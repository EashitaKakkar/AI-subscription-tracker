"use client";
import { useState, useEffect } from 'react';

// Updated interface to include 'tier' instead of 'price'
interface FormData {
  teamSize: string;
  selectedTools: string[];
  plans: Record<string, { tier: string; cycle: string }>;
}

const AI_TOOLS = [
  { id: 'cursor', name: 'Cursor', icon: '💻' },
  { id: 'chatgpt', name: 'ChatGPT', icon: '🤖' },
  { id: 'claude', name: 'Claude', icon: '✍️' },
  { id: 'copilot', name: 'GitHub Copilot', icon: '🚀' },
  { id: 'v0', name: 'v0.dev', icon: '🎨' },
];

const TOOL_PRICES: Record<string, Record<string, { monthly: number; yearly: number }>> = {
  cursor: {
    hobby: { monthly: 0, yearly: 0 },
    pro: { monthly: 20, yearly: 16 },
    business: { monthly: 40, yearly: 40 },
  },
  chatgpt: {
    free: { monthly: 0, yearly: 0 },
    plus: { monthly: 20, yearly: 20 },
    team: { monthly: 30, yearly: 25 },
  },
  claude: {
    free: { monthly: 0, yearly: 0 },
    pro: { monthly: 20, yearly: 20 },
    team: { monthly: 30, yearly: 25 },
  },
  copilot: {
    individual: { monthly: 10, yearly: 10 },
    business: { monthly: 19, yearly: 19 },
    enterprise: { monthly: 39, yearly: 39 },
  },
  v0: {
    free: { monthly: 0, yearly: 0 },
    premium: { monthly: 20, yearly: 20 },
    team: { monthly: 30, yearly: 30 },
  },
};

export default function AuditForm() {
  const [step, setStep] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    teamSize: '',
    selectedTools: [],
    plans: {} 
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
      const saved = localStorage.getItem('spendlens_data');
      if (saved) {
        try {
          setFormData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load saved data", e);
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

  const toggleTool = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTools: prev.selectedTools?.includes(id)
        ? prev.selectedTools.filter((t) => t !== id)
        : [...(prev.selectedTools || []), id]
    }));
  };

  const updatePlan = (toolId: string, field: 'tier' | 'cycle', value: string) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [toolId]: { 
          ...(prev.plans?.[toolId] || { tier: Object.keys(TOOL_PRICES[toolId])[0], cycle: 'monthly' }), 
          [field]: value 
        }
      }
    }));
  };

  const calculateTotal = () => {
    const seats = parseInt(formData.teamSize) || 0;
    return formData.selectedTools.reduce((acc, toolId) => {
      const plan = formData.plans[toolId] || { tier: Object.keys(TOOL_PRICES[toolId])[0], cycle: 'monthly' };
      const price = TOOL_PRICES[toolId]?.[plan.tier]?.[plan.cycle as 'monthly' | 'yearly'] || 0;
      return acc + (price * seats);
    }, 0);
  };

  if (!isMounted) return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl border border-slate-800 my-10 h-64 animate-pulse" />
  );

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl border border-slate-800 my-10 shadow-2xl">
      <div className="mb-8">
        <span className="text-emerald-500 font-mono text-sm">STEP {step} OF 3</span>
        <div className="w-full bg-slate-800 h-2 mt-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }} 
          />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-2xl font-bold text-white">How many seats?</h2>
          <input 
            type="number" 
            placeholder="e.g. 10"
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:ring-1 focus:ring-emerald-500 outline-none"
            value={formData.teamSize}
            onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
          />
          <button 
            onClick={() => setStep(2)} 
            disabled={!formData.teamSize} 
            className="w-full bg-emerald-500 py-3 rounded-lg font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-all"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <h2 className="text-2xl font-bold text-white">Select Tools</h2>
          <div className="grid grid-cols-2 gap-4">
            {AI_TOOLS.map(tool => (
              <button 
                key={tool.id} 
                onClick={() => toggleTool(tool.id)} 
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.selectedTools?.includes(tool.id) 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <span className="text-2xl mb-2 block">{tool.icon}</span>
                <span className="font-semibold text-white">{tool.name}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 text-slate-400 font-medium">Back</button>
            <button 
              disabled={formData.selectedTools?.length === 0} 
              onClick={() => setStep(3)} 
              className="flex-[2] bg-emerald-500 text-slate-950 py-3 rounded-lg font-bold"
            >
              Next: Pricing
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="text-center bg-slate-950 p-6 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <p className="text-emerald-500 font-mono text-xs uppercase tracking-tighter">Current Monthly Burn</p>
            <h3 className="text-5xl font-black text-white mt-1">${calculateTotal()}</h3>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {formData.selectedTools?.map((toolId) => {
              const tool = AI_TOOLS.find(t => t.id === toolId);
              const tiers = Object.keys(TOOL_PRICES[toolId] || {});
              const currentPlan = formData.plans[toolId] || { tier: tiers[0], cycle: 'monthly' };

              return (
                <div key={toolId} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{tool?.icon}</span>
                      <span className="text-white font-bold">{tool?.name}</span>
                    </div>
                    <select 
                      className="bg-slate-950 text-[10px] text-slate-400 p-1 rounded border border-slate-700 uppercase font-bold"
                      value={currentPlan.cycle}
                      onChange={(e) => updatePlan(toolId, 'cycle', e.target.value)}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Select Subscription Tier</p>
                    <div className="flex flex-wrap gap-2">
                      {tiers.map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => updatePlan(toolId, 'tier', tier)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            currentPlan.tier === tier 
                              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-800">
            <button onClick={() => setStep(2)} className="flex-1 text-slate-400 font-medium">Back</button>
            <button 
              onClick={() => alert("Analyzing overlaps between your tools...")}
              className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all"
            >
              Run Savings Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}