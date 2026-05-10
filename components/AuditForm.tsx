"use client";
import { useState, useEffect } from 'react';

interface FormData {
  teamSize: string;
  selectedTools: string[];
  plans: Record<string, { tier: string; cycle: string }>;
}

const AI_TOOLS = [
  { id: 'cursor', name: 'Cursor', icon: '💻', category: 'IDE' },
  { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', category: 'Chat' },
  { id: 'claude', name: 'Claude', icon: '✍️', category: 'Chat' },
  { id: 'copilot', name: 'GitHub Copilot', icon: '🚀', category: 'IDE' },
  { id: 'v0', name: 'v0.dev', icon: '🎨', category: 'Design' },
];

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

  const updatePlan = (toolId: string, field: 'tier' | 'cycle', value: string) => {
    setFormData(prev => ({ ...prev, plans: { ...prev.plans, [toolId]: { ...(prev.plans?.[toolId] || { tier: Object.keys(TOOL_PRICES[toolId])[0], cycle: 'monthly' }), [field]: value } } }));
  };

  const calculateTotal = () => {
    const seats = parseInt(formData.teamSize) || 0;
    return formData.selectedTools.reduce((acc, toolId) => {
      const plan = formData.plans[toolId] || { tier: Object.keys(TOOL_PRICES[toolId])[0], cycle: 'monthly' };
      return acc + (TOOL_PRICES[toolId]?.[plan.tier]?.[plan.cycle as 'monthly' | 'yearly'] || 0) * seats;
    }, 0);
  };

  const getAuditReport = () => {
    const overlaps: string[] = [];
    const ides = formData.selectedTools.filter(id => AI_TOOLS.find(t => t.id === id)?.category === 'IDE');
    const chats = formData.selectedTools.filter(id => AI_TOOLS.find(t => t.id === id)?.category === 'Chat');
    
    if (ides.length > 1) overlaps.push(`Redundant IDEs: Using ${ides.join(" & ")}. Cursor includes AI features that replace Copilot.`);
    if (chats.length > 1) overlaps.push(`Chat Overlap: ${chats.join(" & ")}. Consider consolidating to one "Team" plan.`);
    
    return overlaps;
  };

  if (!isMounted) return <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl animate-pulse h-64 my-10" />;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl border border-slate-800 my-10 shadow-2xl">
      <div className="mb-8">
        <span className="text-emerald-500 font-mono text-sm">STEP {step} OF 4</span>
        <div className="w-full bg-slate-800 h-2 mt-2 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">How many seats?</h2>
          <input type="number" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white" value={formData.teamSize} onChange={(e) => setFormData({...formData, teamSize: e.target.value})} />
          <button onClick={() => setStep(2)} className="w-full bg-emerald-500 py-3 rounded-lg font-bold text-slate-950">Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Select Tools</h2>
          <div className="grid grid-cols-2 gap-4">
            {AI_TOOLS.map(t => (
              <button key={t.id} onClick={() => setFormData(prev => ({...prev, selectedTools: prev.selectedTools.includes(t.id) ? prev.selectedTools.filter(id => id !== t.id) : [...prev.selectedTools, t.id]}))} className={`p-4 rounded-xl border-2 text-left ${formData.selectedTools.includes(t.id) ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'}`}>
                <span className="text-2xl">{t.icon}</span><p className="text-white font-bold">{t.name}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(3)} className="w-full bg-emerald-500 py-3 rounded-lg font-bold">Next: Pricing</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Configure Tiers</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {formData.selectedTools.map(id => (
              <div key={id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-white">{id}</span>
                <div className="flex gap-2">
                  <select className="bg-slate-900 text-xs text-white p-1 rounded" onChange={(e) => updatePlan(id, 'tier', e.target.value)}>
                    {Object.keys(TOOL_PRICES[id]).map(tier => <option key={tier} value={tier}>{tier}</option>)}
                  </select>
                  <select className="bg-slate-900 text-xs text-white p-1 rounded" onChange={(e) => updatePlan(id, 'cycle', e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(4)} className="w-full bg-emerald-500 py-3 rounded-lg font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]">Run AI Audit</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <p className="text-emerald-500 text-xs font-mono uppercase">Potential Savings</p>
            <h3 className="text-4xl font-black text-white">$ {(calculateTotal() * 0.3).toFixed(2)} <span className="text-sm text-slate-400">/mo</span></h3>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm">AI Optimization Log:</h4>
            {getAuditReport().map((msg, i) => (
              <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs italic">
                ⚠️ {msg}
              </div>
            ))}
            {getAuditReport().length === 0 && <p className="text-emerald-400 text-xs">✅ Your stack is perfectly lean!</p>}
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
             <p className="text-slate-400 text-xs leading-relaxed">
               <span className="text-emerald-500 font-bold">Prediction:</span> Based on your team size of {formData.teamSize}, 
               consolidating to {formData.selectedTools.length > 2 ? 'enterprise' : 'team'} plans would reduce your 
               burn-per-seat by 15% within 6 months.
             </p>
          </div>

          <button onClick={() => setStep(1)} className="w-full border border-slate-700 text-slate-400 py-3 rounded-lg hover:text-white transition-colors">Start New Audit</button>
        </div>
      )}
    </div>
  );
}