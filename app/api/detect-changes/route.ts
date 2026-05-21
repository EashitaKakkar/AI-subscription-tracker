import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the lowest level pricing structure (billing periods)
interface BillingPeriodPlans {
  monthly?: number;
  yearly?: number;
}

// Define the middle tier structure (plan reference keys or fallback properties)
interface ToolPricePlan {
  monthly?: number | BillingPeriodPlans;
  price?: number | BillingPeriodPlans;
  [planKey: string]: number | BillingPeriodPlans | undefined;
}

// Define the structural row format retrieved from the Supabase audits table
interface AuditRow {
  id: string;
  email: string;
  tools: string[];
  total_savings: number;
  pricing_snapshot: Record<string, ToolPricePlan | undefined> | null;
  input_stack: Record<string, unknown>;
}

interface DispatchedNotification {
  id: string;
  tool: string;
  oldPrice: number;
  newPrice: number;
}

export async function POST(req: Request) {
  try {
    const { tool, plan, newPrice } = await req.json();

    if (!tool || !newPrice) {
      return NextResponse.json({ error: "Missing tool or newPrice parameters" }, { status: 400 });
    }

    const { data: storedAudits, error: dbError } = await supabase
      .from('audits')
      .select('id, email, tools, total_savings, pricing_snapshot, input_stack')
      .contains('tools', [tool]);

    if (dbError || !storedAudits) {
      console.error("Fetch audits failure:", dbError);
      return NextResponse.json({ error: "Could not read audits from database" }, { status: 500 });
    }

    const usersToNotify: Record<string, DispatchedNotification[]> = {};
    const castedAudits = storedAudits as unknown as AuditRow[];

    castedAudits.forEach((row) => {
      if (!row.pricing_snapshot || typeof row.pricing_snapshot !== 'object') return;
      
      const selectedToolSnapshot = row.pricing_snapshot[tool];
      if (!selectedToolSnapshot) return;

      const planObject = selectedToolSnapshot[plan];
      
      let rawHistoricalPrice: number | undefined;

      if (planObject && typeof planObject === 'object') {
        const billingObject = planObject as BillingPeriodPlans;
        rawHistoricalPrice = billingObject.monthly ?? billingObject.yearly;
      } else if (typeof planObject === 'number') {
        rawHistoricalPrice = planObject;
      } else {
        // Final catch-all lookup for looser structure models
        const looseFallback = selectedToolSnapshot.price ?? selectedToolSnapshot.monthly;
        if (looseFallback && typeof looseFallback === 'object') {
          const billingObject = looseFallback as BillingPeriodPlans;
          rawHistoricalPrice = billingObject.monthly ?? billingObject.yearly;
        } else if (typeof looseFallback === 'number') {
          rawHistoricalPrice = looseFallback;
        }
      }

      if (rawHistoricalPrice === undefined || rawHistoricalPrice === null) return;
      
      const historicalPrice = Number(rawHistoricalPrice);
      if (isNaN(historicalPrice)) return; 

      if (historicalPrice !== Number(newPrice)) {
        if (!usersToNotify[row.email]) {
          usersToNotify[row.email] = [];
        }
        
        const alreadyLogged = usersToNotify[row.email].some((c) => c.tool === tool);
        
        if (!alreadyLogged) {
          usersToNotify[row.email].push({
            id: row.id,
            tool,
            oldPrice: historicalPrice,
            newPrice: Number(newPrice)
          });
        }
      }
    });

    const emailPromises = Object.entries(usersToNotify).map(async ([email, changes]) => {
      const baseUrl = new URL(req.url).origin;
      const targetAuditId = changes[changes.length - 1].id;
      const reRunLink = `${baseUrl}/share/${targetAuditId}?re_audit=true&tool=${tool}&new_price=${newPrice}&plan=${plan}`;

      const emailHtml = `
        <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0f172a;">⚠️ Pricing Shift Detected on Your Stack</h1>
          <p>We noticed that the market pricing for tools in your technology stack has officially shifted since your last optimization review.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0f172a;">What Changed:</h3>
            ${changes.map(c => `
              <p style="margin: 8px 0; font-size: 15px;">
                <strong>${c.tool.toUpperCase()}</strong> pricing changed from 
                <span style="text-decoration: line-through; color: #94a3b8;">$${c.oldPrice}</span> to 
                <strong style="color: #10b981;">$${c.newPrice}</strong>.
              </p>
            `).join('')}
          </div>
          <p>This pricing modification directly affects your calculated savings profile. Your previous recommendation values are now stale.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${reRunLink}" style="background: #10b981; color: #0f172a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              🔄 View Price Diff & Re-Audit Stack
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">SpendLens Automated Infrastructure Engine.</p>
        </div>
      `;

      return resend.emails.send({
        from: 'SpendLens Radar <onboarding@resend.dev>',
        to: email,
        subject: `Action Required: Pricing Change Affects Your AI Stack Audit`,
        html: emailHtml,
      });
    });

    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      messagesSent: Object.keys(usersToNotify).length,
      affectedUsers: Object.keys(usersToNotify)
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Engine Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}