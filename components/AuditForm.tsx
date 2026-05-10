"use client";
import { useState, useEffect } from 'react';

interface FormData {
  teamSize: string;
  selectedTools: string[];
  plans: Record<string, { tier: string; cycle: string; useCase: string }>;
}

const AI_TOOLS = [
  { id: 'cursor', name: 'Cursor', icon: '💻', category: 'IDE' },
  { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', category: 'Chat' },
  { id: 'claude', name: 'Claude', icon: '✍️', category: 'Chat' },
  { id: 'copilot', name: 'GitHub Copilot', icon: '🚀', category: 'IDE' },
  { id: 'v0', name: 'v0.dev', icon: '🎨', category: 'Design' },
];

const USE_CASES = ["Coding/Debugging", "Content/Marketing", "Data Analysis", "UI/UX Design", "General Research"];

const TOOL_PRICES: Record<string, Record<string, { monthly: number; yearly: number }>> = {
  cursor: { hobby: { monthly: 0, yearly: 0 }, pro: { monthly: 20, yearly: 16 }, business: { monthly: 40, yearly: 40 } },
  chatgpt: { free: { monthly: 0, yearly: 0 }, plus: { monthly: 20, yearly: 20 }, team: { monthly: 30, yearly: 25 } },
  claude: { free: { monthly: 0, yearly: 0 }, pro: { monthly: 20, yearly: 20 }, team: { monthly: 30, yearly: 25 } },
  copilot: { individual: { monthly: 10, yearly: 10 }, business: { monthly: 19, yearly: 19 }, enterprise: { monthly: 39, yearly: 39 } },
  v0: { free: { monthly: 0, yearly: 0 }, premium: { monthly: 20, yearly: 20 }, team: { monthly: 30, yearly: 30 } },
};

export default function AuditForm() {
  const [step, setStep] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({ teamSize: '', selectedTools: [], plans: {} });

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
      const saved = localStorage.getItem('spendlens_data');
      if (saved) { try { setFormData(JSON.parse(saved)); } catch (e) { console.error(e); } }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => { if (isMounted) localStorage.setItem('spendlens_data', JSON.stringify(formData)); }, [formData, isMounted]);

  const updatePlan = (toolId: string, field: 'tier' | 'cycle' | 'useCase', value: string) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [toolId]: { ...(prev.plans?.[toolId] || { tier: 'pro', cycle: 'monthly', useCase: USE_CASES[0] }), [field]: value }
      }
    }));
  };

  const getAuditReport = () => {
    const overlaps: string[] = [];
    const usageMap: Record<string, string[]> = {};

    formData.selectedTools.forEach(id => {
      const useCase = formData.plans[id]?.useCase || "General";
      if (!usageMap[useCase]) usageMap[useCase] = [];
      usageMap[useCase].push(AI_TOOLS.find(t => t.id === id)?.name || id);
    });

    Object.entries(usageMap).forEach(([useCase, tools]) => {
      if (tools.length > 1) {
        overlaps.push(`Task Redundancy: You are using ${tools.join(" & ")} for ${useCase}. Drop one to save.`);
      }
    });

    return overlaps;
  };

  const calculateTotal = () => {
    const seats = parseInt(formData.teamSize) || 0;
    return formData.selectedTools.reduce((acc, toolId) => {
      const plan = formData.plans[toolId] || { tier: 'pro', cycle: 'monthly' };
      return acc + (TOOL_PRICES[toolId]?.[plan.tier]?.[plan.cycle as 'monthly' | 'yearly'] || 0) * seats;
    }, 0);
  };

  if (!isMounted) return <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl animate-pulse h-64 my-10" />;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl border border-slate-800 my-10 shadow-2xl">
      {/* Progress Bar */}
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
          <input type="number" placeholder="e.g. 12" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-xl outline-none focus:border-emerald-500" value={formData.teamSize} onChange={(e) => setFormData({...formData, teamSize: e.target.value})} />
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
                    <select 
                      className="w-full bg-slate-900 text-xs text-slate-300 p-2 rounded-lg border border-slate-700 outline-none"
                      value={formData.plans[t.id]?.useCase || ""}
                      onChange={(e) => updatePlan(t.id, 'useCase', e.target.value)}
                    >
                      {USE_CASES.map(uc => <option key={uc} value={uc}>{uc}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setStep(3)} className="w-full bg-emerald-500 py-4 rounded-xl font-bold text-slate-950">Next: Tiers</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <h2 className="text-3xl font-black text-white">Pricing Tiers</h2>
          <div className="space-y-4">
            {formData.selectedTools.map(id => (
              <div key={id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-white font-bold">{id.toUpperCase()}</span>
                <div className="flex gap-2">
                  <select className="bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700" value={formData.plans[id]?.tier} onChange={(e) => updatePlan(id, 'tier', e.target.value)}>
                    {Object.keys(TOOL_PRICES[id]).map(tier => <option key={tier} value={tier}>{tier}</option>)}
                  </select>
                  <select className="bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700" value={formData.plans[id]?.cycle} onChange={(e) => updatePlan(id, 'cycle', e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(4)} className="w-full bg-emerald-500 py-4 rounded-xl font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]">View Analysis</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-in zoom-in-95">
          <div className="text-center p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
            <p className="text-emerald-500 text-xs font-mono uppercase tracking-widest">Monthly Optimization Potental</p>
            <h3 className="text-5xl font-black text-white mt-2">${(calculateTotal() * 0.35).toFixed(0)}</h3>
          </div>

          <div className="space-y-3">
            <h4 className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Wasted Coverage Detected</h4>
            {getAuditReport().map((msg, i) => (
              <div key={i} className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-400 text-xs leading-relaxed">
                <span className="font-bold">Recommendation:</span> {msg}
              </div>
            ))}
            {getAuditReport().length === 0 && <p className="text-emerald-400 text-xs">✅ Your stack usage is efficient across tasks.</p>}
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-white font-bold mb-2">Credex Strategy Note:</h4>
            <p className="text-slate-400 text-xs leading-relaxed italic">
              Since you are using {formData.teamSize} seats, the overlap in your debugging tools suggests a $ {((calculateTotal() * 12) * 0.15).toFixed(0)} annual hidden tax. 
              Consolidating to a single enterprise seat for Cursor would cover 90% of your current Claude/Copilot usage.
            </p>
          </div>

          <button onClick={() => alert("Email Gate + Unique URL share logic goes here!")} className="w-full bg-white py-4 rounded-xl font-bold text-slate-950 mb-2">Claim Full Savings Report</button>
          <button onClick={() => setStep(1)} className="w-full text-slate-500 text-xs font-bold hover:text-white transition-colors">Restart Audit</button>
        </div>
      )}
    </div>
  );
}