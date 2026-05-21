import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import { Metadata } from 'next';
import Link from 'next/link';

interface AuditAdvice {
  tool: string;
  action: string;
  reason: string;
  savings: number;
}

interface AuditData {
  id: string;
  total_savings: number;
  advice: AuditAdvice[]; 
  ai_summary: string;
  team_size?: string | number;
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ re_audit?: string; tool?: string; new_price?: string; plan?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { data } = await supabase
    .from('audits')
    .select('total_savings')
    .eq('id', id)
    .single();

  const savings = data?.total_savings?.toLocaleString() || '0';

  return {
    title: `Saved $${savings} on AI Tools | Audit Report`,
    description: `I just used the AI Spend Audit to find $${savings} in potential annual savings. Check out the optimization breakdown.`,
  };
}

export default async function SharePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { re_audit, tool: shiftedTool, new_price, plan } = await searchParams;
  const { data, error } = await supabase
    .from('audits')
    .select('id, total_savings, advice, ai_summary, team_size')
    .eq('id', id) 
    .single();

  const audit = data as AuditData;

  if (error || !audit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Audit report not found</h2>
          <Link href="/" className="text-emerald-500 hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  const isReAudit = re_audit === 'true';
  const targetTool = shiftedTool || '';
  const parsedNewPrice = Number(new_price) || 0;
  const seatsCount = Number(audit.team_size) || 1;

  let savingsDelta = 0;
  let recalculatedTotalSavings = audit.total_savings;

  if (isReAudit && targetTool) {
    savingsDelta = parsedNewPrice * 12 * seatsCount * 0.15;
    recalculatedTotalSavings = audit.total_savings + savingsDelta;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {isReAudit && (
          <div className="border border-emerald-500/30 bg-emerald-500/5 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                Live Re-Audit Matrix
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-2">
                Pricing Adjustment Detected for {targetTool.toUpperCase()} ({plan || 'Pro'})
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Simulated change shifts standard price to <strong className="text-slate-200">${parsedNewPrice}/mo</strong>.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl text-right md:min-w-[200px]">
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-widest">Savings Headline Delta</span>
              <span className="text-2xl font-black text-emerald-400">
                +${savingsDelta.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr
              </span>
            </div>
          </div>
        )}

        <div className={`grid gap-8 ${isReAudit ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
          
          <div className="space-y-4">
            {isReAudit && <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Baseline Setup Summary</h3>}
            
            <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
              <h1 className="text-xl font-bold">Historical Audit Report</h1>
              
              <div className="p-6 bg-slate-950 border border-slate-850 rounded-2xl text-center">
                <p className="text-slate-500 text-xs font-mono tracking-widest">ANNUAL POTENTIAL SAVINGS</p>
                <h2 className="text-4xl font-black text-slate-300">${audit.total_savings.toLocaleString()}</h2>
              </div>

              {audit.ai_summary && !isReAudit && (
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-slate-400 uppercase text-xs font-bold mb-2">Executive Summary</h3>
                  <div className="text-slate-300 text-sm leading-relaxed">
                    <ReactMarkdown>{audit.ai_summary}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider pb-1">Optimization Steps</h3>
                {audit.advice && audit.advice.length > 0 ? (
                  audit.advice.map((item, i) => (
                    <div key={i} className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                      <p className="text-slate-300 font-bold text-sm">{item.tool} → {item.action}</p>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{item.reason}</p>
                      <p className="text-slate-400 font-mono text-xs mt-3 font-semibold">+${item.savings.toLocaleString()} saved/yr</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-sm">No specific optimization steps recorded.</p>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN B: RE-AUDITED UPDATED LAYOUT VIEW */}
          {isReAudit && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest px-1">Recalculated Projections</h3>
              
              <div className="p-8 bg-slate-900 border-2 border-emerald-500/20 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-lg">
                  Adjusted Live Matrix
                </div>

                <h1 className="text-xl font-bold text-emerald-400">Recalculated Savings</h1>

                <div className="p-6 bg-slate-950 border border-emerald-500/10 rounded-2xl text-center">
                  <p className="text-emerald-400/70 text-xs font-mono tracking-widest">ADJUSTED POTENTIAL SAVINGS</p>
                  <h2 className="text-4xl font-black text-emerald-500">${recalculatedTotalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-emerald-400/80 uppercase tracking-wider pb-1">Updated Steps</h3>
                  {audit.advice && audit.advice.length > 0 ? (
                    audit.advice.map((item, i) => {
                      const isAffected = item.tool.toLowerCase() === targetTool.toLowerCase();
                      const itemSavingsDelta = isAffected ? (savingsDelta / (audit.advice.length || 1)) : 0;
                      const adjustedItemSavings = item.savings + itemSavingsDelta;

                      return (
                        <div 
                          key={i} 
                          className={`p-4 rounded-xl transition-all border ${
                            isAffected 
                              ? 'bg-emerald-950/20 border-emerald-500 text-white' 
                              : 'bg-slate-950 border-slate-850 opacity-40'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <p className={`font-bold text-sm ${isAffected ? 'text-emerald-400' : 'text-slate-300'}`}>
                              {item.tool} → {isAffected ? "Maximize Plan Tiers" : item.action}
                            </p>
                            {isAffected && (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded">
                                Shipped Modification
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs mt-1 leading-relaxed">{item.reason}</p>
                          <p className={`font-mono text-xs mt-3 font-bold ${isAffected ? 'text-emerald-400 text-sm' : 'text-slate-400'}`}>
                            +${adjustedItemSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })} saved/yr
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-500 italic text-sm">No verification entries tracked.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* FOOTER CALL TO ACTION */}
        <div className="pt-6 text-center">
          <p className="text-slate-500 text-sm mb-4">Want to run a clean optimization snapshot?</p>
          <Link href="/" className="inline-block bg-emerald-500 text-slate-950 px-6 py-3 rounded-full font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 text-sm">
            Run Free Audit
          </Link>
        </div>

      </div>
    </div>
  );
}