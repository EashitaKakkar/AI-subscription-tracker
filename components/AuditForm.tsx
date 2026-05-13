"use client";
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface FormData {
  teamSize: string;
  selectedTools: string[];
  plans: Record<string, { tier: string; cycle: string; useCase: string }>;
}

interface AdviceItem {
  tool: string;
  action: string;
  savings: number;
  reason: string;
}

interface AuditPayload {
  email: string;
  savings: number;
  teamSize: string;
  tools: string[];
  advice: AdviceItem[];
}

// --- Constants ---

const USE_CASES = ["Coding/Debugging", "Content/Marketing", "Data Analysis", "UI/UX Design", "General Research", "Mixed / Internal Tooling"];

const API_BILL_RANGES: Record<string, number> = {
  "$0 - $50": 25,
  "$51 - $200": 125,
  "$201 - $500": 350,
  "$500+": 750,
};

const AI_TOOLS = [
  { id: 'cursor', name: 'Cursor', icon: '💻', category: 'IDE' },
  { id: 'copilot', name: 'GitHub Copilot', icon: '🚀', category: 'IDE' },
  { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', category: 'Chat' },
  { id: 'claude', name: 'Claude', icon: '✍️', category: 'Chat' },
  { id: 'anthropic_api', name: 'Anthropic API', icon: '🏗️', category: 'API' },
  { id: 'openai_api', name: 'OpenAI API', icon: '⚙️', category: 'API' },
  { id: 'gemini', name: 'Gemini', icon: '✨', category: 'Chat' },
  { id: 'v0', name: 'v0.dev', icon: '🎨', category: 'Design' },
];

const TOOL_PRICES: Record<string, Record<string, { monthly: number; yearly: number }>> = {
  cursor: { 
    hobby: { monthly: 0, yearly: 0 }, 
    pro: { monthly: 20, yearly: 16 }, 
    business: { monthly: 40, yearly: 40 },
    enterprise: { monthly: 100, yearly: 100 }
  },
  copilot: { 
    individual: { monthly: 10, yearly: 10 }, 
    business: { monthly: 19, yearly: 19 }, 
    enterprise: { monthly: 39, yearly: 39 } 
  },
  claude: { 
    free: { monthly: 0, yearly: 0 }, 
    pro: { monthly: 20, yearly: 20 }, 
    max: { monthly: 40, yearly: 40 }, 
    team: { monthly: 30, yearly: 25 }, 
    enterprise: { monthly: 75, yearly: 75 },
    api_direct: { monthly: 0, yearly: 0 } 
  },
  chatgpt: { 
    plus: { monthly: 20, yearly: 20 }, 
    team: { monthly: 30, yearly: 25 }, 
    enterprise: { monthly: 60, yearly: 60 },
    api_direct: { monthly: 0, yearly: 0 }
  },
  anthropic_api: { api_direct: { monthly: 0, yearly: 0 } },
  openai_api: { api_direct: { monthly: 0, yearly: 0 } },
  gemini: { 
    pro: { monthly: 20, yearly: 20 }, 
    ultra: { monthly: 30, yearly: 30 }, 
    api: { monthly: 0, yearly: 0 } 
  },
  v0: { 
    free: { monthly: 0, yearly: 0 }, 
    premium: { monthly: 20, yearly: 20 }, 
    team: { monthly: 30, yearly: 30 } 
  },
};

export default function AuditForm() {
  const [step, setStep] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({ teamSize: '', selectedTools: [], plans: {} });
  const [email, setEmail] = useState('');
  
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
      const saved = localStorage.getItem('spendlens_data');
      if (saved) { 
        try { 
          setFormData(JSON.parse(saved)); 
        } catch (e) { 
          console.error("Failed to load local storage:", e); 
        } 
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => { 
    if (isMounted) {
      localStorage.setItem('spendlens_data', JSON.stringify(formData)); 
    }
  }, [formData, isMounted]);

  const updatePlan = (toolId: string, field: 'tier' | 'cycle' | 'useCase', value: string) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [toolId]: { 
          ...(prev.plans?.[toolId] || { tier: 'pro', cycle: 'monthly', useCase: USE_CASES[0] }), 
          [field]: value 
        }
      }
    }));
  };

  const getAuditReport = (): AdviceItem[] => {
    const advice: AdviceItem[] = [];
    const seats = parseInt(formData.teamSize) || 0;
    const usageMap: Record<string, string[]> = {};

    formData.selectedTools.forEach(id => {
      const useCase = formData.plans[id]?.useCase || "General Research";
      if (!usageMap[useCase]) usageMap[useCase] = [];
      usageMap[useCase].push(AI_TOOLS.find(t => t.id === id)?.name || id);
    });

    Object.entries(usageMap).forEach(([useCase, tools]) => {
      if (tools.length > 1) {
        advice.push({
          tool: tools[1],
          action: "Consolidate Subscription",
          savings: 240 * seats,
          reason: `You are using ${tools.join(" & ")} for ${useCase}. Standardizing on one tool eliminates overlap.`
        });
      }
    });

    formData.selectedTools.forEach(id => {
      const plan = formData.plans[id];
      const isApi = plan?.tier === 'api_direct' || id.includes('api');

      if (isApi) {
        const estimatedSpend = API_BILL_RANGES[plan?.cycle] || 0;
        if (estimatedSpend > 50) {
          advice.push({
            tool: id.toUpperCase(),
            action: "Optimize Token Usage",
            savings: estimatedSpend * 0.2 * 12,
            reason: `High API usage detected. Implementing prompt caching or model fine-tuning could save significantly.`
          });
        }
      } else if (plan?.cycle === 'monthly') {
        const toolPrice = TOOL_PRICES[id]?.[plan.tier];
        if (toolPrice && toolPrice.monthly > toolPrice.yearly) {
          const annualDiff = (toolPrice.monthly - toolPrice.yearly) * 12 * seats;
          advice.push({
            tool: id.toUpperCase(),
            action: "Switch to Yearly",
            savings: annualDiff,
            reason: `Moving to annual billing for ${id} reduces the per-seat cost significantly.`
          });
        }
      }
    });

    return advice;
  };

  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          advice: getAuditReport(), 
          teamSize: formData.teamSize 
        }),
      });
      const data = await res.json();
      setAiSummary(data.summary);
    } catch (err) {
      console.error("Summary generation failed:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleViewAnalysis = () => {
    setStep(4);
    generateSummary();
  };

  const sendAuditReport = async (userEmail: string) => {
    const currentAdvice = getAuditReport();
    const totalPotentialSavings = currentAdvice.reduce((acc, item) => acc + item.savings, 0);

    const auditData: AuditPayload = {
      email: userEmail,
      savings: totalPotentialSavings, 
      teamSize: formData.teamSize,
      tools: formData.selectedTools,
      advice: currentAdvice 
    };

    try {
      const response = await fetch('/api/send-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData),
      });

      if (response.ok) {
        alert(`Audit report sent to ${userEmail}!`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send report");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      alert(`Error: ${errorMessage}`);
    }
  };

  if (!isMounted) return <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl animate-pulse h-64 my-10" />;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl border border-slate-800 my-10 shadow-2xl">
      <div className="mb-8">
        <span className="text-emerald-500 font-mono text-sm uppercase tracking-widest">Step {step} of 4</span>
        <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-black text-white">Scale Check</h2>
          <p className="text-slate-400">How many team members are using these AI tools?</p>
          <input 
            type="number" 
            placeholder="e.g. 12" 
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-xl outline-none focus:border-emerald-500" 
            value={formData.teamSize} 
            onChange={(e) => setFormData({...formData, teamSize: e.target.value})} 
          />
          <button onClick={() => setStep(2)} disabled={!formData.teamSize} className="w-full bg-emerald-500 py-4 rounded-xl font-bold text-slate-950 hover:scale-[1.02] transition-transform disabled:opacity-50">Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <h2 className="text-3xl font-black text-white">Stack & Use Case</h2>
          <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {AI_TOOLS.map(t => (
              <div key={t.id} className={`p-4 rounded-xl border-2 transition-all ${formData.selectedTools.includes(t.id) ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950'}`}>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setFormData(prev => ({...prev, selectedTools: prev.selectedTools.includes(t.id) ? prev.selectedTools.filter(id => id !== t.id) : [...prev.selectedTools, t.id]}))} className="flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <span className="text-white font-bold">{t.name}</span>
                  </button>
                  {formData.selectedTools.includes(t.id) && <span className="text-emerald-500 text-xs font-mono">SELECTED</span>}
                </div>
                {formData.selectedTools.includes(t.id) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Primary Purpose</p>
                    <select className="w-full bg-slate-900 text-xs text-slate-300 p-2 rounded-lg border border-slate-700 outline-none" value={formData.plans[t.id]?.useCase || ""} onChange={(e) => updatePlan(t.id, 'useCase', e.target.value)}>
                      {USE_CASES.map(uc => <option key={uc} value={uc}>{uc}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className='flex gap-3'>
            <button onClick={() => setStep(1)} className="w-full bg-slate-900 text-emerald-400 py-4 rounded-xl font-bold border border-emerald-700">Back</button>
            <button onClick={() => setStep(3)} className="w-full bg-emerald-500 py-4 rounded-xl font-bold text-slate-950">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <h2 className="text-3xl font-black text-white">Pricing Tiers</h2>
          <div className="space-y-4">
            {formData.selectedTools.map(id => {
              const plan = formData.plans[id];
              const isApi = plan?.tier === 'api_direct' || id.includes('api');
              return (
                <div key={id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-white font-bold">{id.toUpperCase()}</span>
                  <div className="flex gap-2">
                    <select className="bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700" value={plan?.tier} onChange={(e) => updatePlan(id, 'tier', e.target.value)}>
                      {Object.keys(TOOL_PRICES[id] || {}).map(tier => <option key={tier} value={tier}>{tier}</option>)}
                    </select>
                    {isApi ? (
                      <select 
                        className="bg-slate-900 text-xs text-emerald-400 p-2 rounded-lg border border-emerald-700 font-bold" 
                        value={plan?.cycle} 
                        onChange={(e) => updatePlan(id, 'cycle', e.target.value)}
                      >
                        <option value="">Select Monthly Spend</option>
                        {Object.keys(API_BILL_RANGES).map(range => <option key={range} value={range}>{range}</option>)}
                      </select>
                    ) : (
                      <select className="bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700" value={plan?.cycle} onChange={(e) => updatePlan(id, 'cycle', e.target.value)}>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className='flex gap-3'>
           <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-emerald-400 py-4 rounded-xl font-bold border border-emerald-700">Back</button>
           <button onClick={handleViewAnalysis} className="w-full bg-emerald-500 py-4 rounded-xl font-bold text-slate-950">View Analysis</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-in zoom-in-95">
          <div className="text-center p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
            <p className="text-emerald-500 text-xs font-mono uppercase tracking-widest">Total Potential Savings</p>
            <div className="flex justify-center gap-8 mt-4">
              <div>
                <h3 className="text-4xl font-black text-white">
                  ${(getAuditReport().reduce((acc, item) => acc + item.savings, 0) / 12).toFixed(0)}
                </h3>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Monthly</p>
              </div>
              <div className="w-px bg-slate-800 h-12 self-center" />
              <div>
                <h3 className="text-4xl font-black text-emerald-500">
                  ${(getAuditReport().reduce((acc, item) => acc + item.savings, 0)).toLocaleString()}
                </h3>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Annual</p>
              </div>
            </div>
          </div>

          <div>
            {(() => {
              const annualSavings = getAuditReport().reduce((acc, item) => acc + item.savings, 0);
              const monthlySavings = annualSavings / 12;

              if (monthlySavings >= 500) { 
                return (
                  <div className="p-4 bg-orange-500/20 border border-orange-500/50 rounded-xl text-center">
                    <p className="text-orange-700 text-sm font-bold">
                       High Savings Detected! Capture this with{" "}
                      <a href="https://credex.ai" target="_blank" rel="noopener noreferrer" className="text-orange-500 underline hover:text-white">
                        Credex
                      </a>
                    </p>
                  </div>
                );
              } else if (monthlySavings < 100){
                return (
                  <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
                    <p className="text-blue-300 text-sm italic">
                       You are spending well. Your stack is already lean.
                    </p>
                  </div>
                );
              }else {
                return (
                  <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
                    <p className="text-blue-300 text-sm italic">
                       Potential savings identified below.
                    </p>
                  </div>
                );
              }
            })()}
          </div>

          {/* AI Box */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Personalized Strategy</h4>
            {loadingSummary ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-slate-800 rounded w-full"></div>
                <div className="h-3 bg-slate-800 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="text-slate-300 text-sm leading-relaxed italic prose ">
                <ReactMarkdown>{aiSummary || "Audit complete. Review your personalized breakdown below for specific savings actions."}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Breakdown List */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold px-1">Optimization Breakdown:</h4>
            {getAuditReport().map((item, i) => (
              <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-tighter">Recommended Action</span>
                    <p className="text-white font-bold leading-tight">{item.tool} &rarr; {item.action}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] font-black uppercase italic">Savings</span>
                    <p className="text-emerald-400 font-mono font-bold">+${item.savings}</p>
                  </div>
                </div>
                <p className="text-slate-400 text-[11px] border-t border-slate-900 pt-2">{item.reason}</p>
              </div>
            ))}
          </div>

          {/* Email CTA */}
          <div className="p-6 bg-emerald-500 rounded-2xl shadow-[0_20px_50px_rgba(16,185,129,0.2)]">
            <h4 className="text-slate-950 font-black text-lg leading-tight mb-1">
              {getAuditReport().reduce((acc, item) => acc + item.savings, 0) < 150 
                ? "Notify me of new optimizations" 
                : "Claim Your Full Savings Report"}
            </h4>
            <p className="text-slate-900 text-xs mb-4 opacity-80">Get the full report sent to your inbox.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="xyz@example.com" 
                className="flex-1 p-3 rounded-lg bg-white/20 border border-slate-950/10 placeholder:text-slate-800 text-slate-950 outline-none" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <button 
                onClick={() => sendAuditReport(email)} 
                disabled={!email.includes('@')} 
                className="bg-slate-950 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
          
          <button onClick={() => setStep(1)} className="w-full text-slate-500 text-xs font-bold hover:text-white transition-colors">Restart Analysis</button>
        </div>
      )}
    </div>
  );
}