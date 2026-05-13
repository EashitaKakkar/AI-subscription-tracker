import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Ensure this path is correct

const resend = new Resend(process.env.RESEND_API_KEY);

interface AdviceItem {
  tool: string;
  action: string;
  savings: number;
  reason: string;
}

export async function POST(req: Request) {
  try {
    const { email, teamSize, tools, savings, advice = [], aiSummary } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Save to Supabase first to get the unique ID for the shareable link
    const { data: dbData, error: dbError } = await supabase
      .from('audits')
      .insert([{ 
        email, 
        team_size: teamSize, 
        total_savings: savings, 
        advice, 
        ai_summary: aiSummary 
      }])
      .select()
      .single();

    if (dbError) {
      console.error("Supabase Save Error:", dbError.message);
      return NextResponse.json({ error: "Database save failed" }, { status: 500 });
    }

    // Generate the full URL for the share page
    const baseUrl = new URL(req.url).origin;
    const shareLink = `${baseUrl}/share/${dbData.id}`;

    const monthlySavings = (Number(savings) || 0) / 12;
    const isHighSavings = monthlySavings >= 500;
    const isOptimal = (Number(savings) || 0) < 100;

    let emailHtml = "";

    if (isOptimal) {
      emailHtml = `
        <div style="font-family: sans-serif; color: #334155; line-height: 1.6;">
          <h1 style="color: #10b981;">Your AI Stack is Lean! ✨</h1>
          <p>Great work. Our audit shows your current setup is highly optimized for your team of <strong>${teamSize}</strong>.</p>
          <div style="margin: 20px 0;">
            <a href="${shareLink}" style="background: #10b981; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Audit Dashboard</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Powered by SpendLens AI Engine.</p>
        </div>
      `;
    } else {
      emailHtml = `
        <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0f172a;">Your AI Spend Audit Results 📊</h1>
          <p style="font-size: 18px;">We've identified <strong>$${savings}</strong> in potential annual savings for your team.</p>
          
          <div style="margin: 25px 0; text-align: center;">
             <a href="${shareLink}" style="background: #0f172a; color: #10b981; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; border: 1px solid #10b981;">👉 View Interactive Report</a>
          </div>

          <h3 style="color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 25px;">Key Recommendations:</h3>
          <div style="margin-top: 15px;">
            ${advice.slice(0, 3).map((item: AdviceItem) => `
              <div style="margin-bottom: 15px; padding: 15px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #10b981;">
                <strong style="color: #0f172a; font-size: 16px;">${item.tool}</strong> 
                <span style="color: #059669; font-weight: bold; font-size: 13px; margin-left: 8px;">[${item.action}]</span>
                <p style="margin: 8px 0; color: #475569; font-size: 14px;">${item.reason}</p>
              </div>
            `).join('')}
          </div>

          ${isHighSavings ? `
            <div style="background: #0f172a; padding: 25px; border-radius: 16px; margin-top: 30px; text-align: center;">
              <h2 style="color: #10b981; margin-top: 0;">High Savings Opportunity</h2>
              <p style="color: #94a3b8;">Your annual savings exceed the enterprise threshold.</p>
              <a href="https://credex.ai/book" style="display: inline-block; background: #10b981; color: #0f172a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 800; margin-top: 10px;">Book Negotiation Call</a>
            </div>
          ` : ''}
        </div>
      `;
    }

    await resend.emails.send({
      from: 'SpendLens Audit <onboarding@resend.dev>',
      to: email,
      subject: isOptimal ? 'Confirmed: Your AI Stack is Optimized' : 'Action Required: Your AI Spend Audit Report',
      html: emailHtml,
    });

    // Return the ID so the frontend can redirect if needed
    return NextResponse.json({ 
      success: true, 
      id: dbData.id, 
      message: "Audit saved and sent to email." 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("API Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}