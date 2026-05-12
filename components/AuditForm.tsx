"use client";
import { useState, useEffect, useMemo } from 'react';

// --- Interfaces ---

interface AdviceItem {
  tool: string;
  action: string;
  savings: number;
  reason: string;
}

interface FormData {
  teamSize: string;
  selectedTools: string[]; // This is our single source of truth for IDs
  plans: Record<string, { tier: string; cycle: string; useCase: string }>;
}

interface AuditPayload {
  email: string;
  savings: number;
  teamSize: string;
  tools: string[]; // The API expects this name
  advice: AdviceItem[];
}

// --- Constants ---

const AI_TOOLS = [
  { id: 'cursor', name: 'Cursor', icon: '💻' },
  { id: 'chatgpt', name: 'ChatGPT', icon: '🤖' },
  { id: 'claude', name: 'Claude', icon: '✍️' },
  { id: 'copilot', name: 'GitHub Copilot', icon: '🚀' },
  { id: 'v0', name: 'v0.dev', icon: '🎨' },
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
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState<FormData>({ 
    teamSize: '', 
    selectedTools: [], 
    plans: {} 
  });

  // --- Hydration & Persistence ---

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('spendlens_val_v2');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Storage error", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('spendlens_val_v2', JSON.stringify(formData));
    }
  }, [formData, isMounted]);

  // --- Logic ---

  const updatePlan = (toolId: string, field: 'tier' | 'cycle' | 'useCase', value: string) => {
    setFormData(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [toolId]: { 
          ...(prev.plans[toolId] || { tier: 'pro', cycle: 'monthly', useCase: 'General Research' }), 
          [field]: value 
        }
      }
    }));
  };

  const auditReport = useMemo((): AdviceItem[] => {
    const advice: AdviceItem[] = [];
    const seats = Number(formData.teamSize) || 0;
    const usageMap: Record<string, string[]> = {};

    formData.selectedTools.forEach(id => {
      const useCase = formData.plans[id]?.useCase || "General Research";
      if (!usageMap[useCase]) usageMap[useCase] = [];
      usageMap[useCase].push(AI_TOOLS.find(t => t.id === id)?.name || id);
    });

    // Redundancy
    Object.entries(usageMap).forEach(([useCase, tools]) => {
      if (tools.length > 1) {
        advice.push({
          tool: tools[1],
          action: "Consolidate Subscription",
          savings: 240 * seats,
          reason: `You use ${tools.join(" & ")} for ${useCase}. You can likely save by picking one.`
        });
      }
    });

    // Annual
    formData.selectedTools.forEach(id => {
      const plan = formData.plans[id];
      if (plan?.cycle === 'monthly') {
        const pricing = TOOL_PRICES[id]?.[plan.tier];
        if (pricing && pricing.monthly > pricing.yearly) {
          advice.push({
            tool: id.toUpperCase(),
            action: "Switch to Yearly",
            savings: (pricing.monthly - pricing.yearly) * 12 * seats,
            reason: `Annual billing for ${id} is cheaper per seat.`
          });
        }
      }
    });

    return advice;
  }, [formData]);

  const totalSavings = auditReport.reduce((acc, item) => acc + item.savings, 0);

  const handleSend = async () => {
    try {
      const payload: AuditPayload = {
        email,
        savings: totalSavings,
        teamSize: formData.teamSize,
        tools: formData.selectedTools, // Mapping selectedTools -> tools for API
        advice: auditReport
      };

      const res = await fetch('/api/send-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to send");
      alert("Sent! Check your inbox.");
    } catch (err) {
      alert("Error sending email.");
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-3xl border border-slate-800 my-10 shadow-2xl text-white">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">
          <span>Step {step} of 4</span>
          <span>{Math.round((step / 4) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-800 h-1 rounded-full">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black">How big is the team?</h2>
          <input 
            type="number" 
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-2xl outline-none focus:border-emerald-500 transition-colors" 
            value={formData.teamSize} 
            onChange={(e) => setFormData({...formData, teamSize: e.target.value})} 
            placeholder="0"
          />
          <button onClick={() => setStep(2)} disabled={!formData.teamSize} className="w-full bg-emerald-500 py-4 rounded-2xl font-bold text-slate-950 disabled:opacity-30">Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black">Your Stack</h2>
          <div className="grid grid-cols-1 gap-3">
            {AI_TOOLS.map(t => (
              <div key={t.id} className={`p-4 rounded-2xl border-2 transition-all ${formData.selectedTools.includes(t.id) ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950'}`}>
                <div className="flex items-center justify-between">
                  <button 
                    className="flex items-center gap-3 flex-1"
                    onClick={() => {
                      const next = formData.selectedTools.includes(t.id) 
                        ? formData.selectedTools.filter(x => x !== t.id) 
                        : [...formData.selectedTools, t.id];
                      setFormData({...formData, selectedTools: next});
                    }}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <span className="font-bold">{t.name}</span>
                  </button>
                </div>
                {formData.selectedTools.includes(t.id) && (
                  <select 
                    className="w-full mt-4 bg-slate-900 p-2 rounded-lg text-xs border border-slate-700"
                    value={formData.plans[t.id]?.useCase || ""} 
                    onChange={(e) => updatePlan(t.id, 'useCase', e.target.value)}
                  >
                    {USE_CASES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setStep(3)} className="w-full bg-emerald-500 py-4 rounded-2xl font-bold text-slate-950">Next: Tiers</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black">Billing Details</h2>
          <div className="space-y-3">
            {formData.selectedTools.map(id => (
              <div key={id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
                <span className="font-bold">{id.toUpperCase()}</span>
                <div className="flex gap-2">
                  <select className="bg-slate-900 p-2 rounded-lg text-xs border border-slate-700" value={formData.plans[id]?.tier} onChange={(e) => updatePlan(id, 'tier', e.target.value)}>
                    {Object.keys(TOOL_PRICES[id] || {}).map(tier => <option key={tier} value={tier}>{tier}</option>)}
                  </select>
                  <select className="bg-slate-900 p-2 rounded-lg text-xs border border-slate-700" value={formData.plans[id]?.cycle} onChange={(e) => updatePlan(id, 'cycle', e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(4)} className="w-full bg-emerald-500 py-4 rounded-2xl font-bold text-slate-950">Run Analysis</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center p-8 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2rem]">
            <p className="text-emerald-500 text-xs font-mono uppercase tracking-[0.2em] mb-2">Annual Savings Potential</p>
            <h3 className="text-6xl font-black">${totalSavings.toLocaleString()}</h3>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500 uppercase">Analysis Results ({auditReport.length})</h4>
            {auditReport.map((item, i) => (
              <div key={i} className="p-4 bg-slate-800/50 border-l-4 border-emerald-500 rounded-xl">
                <p className="text-emerald-400 text-xs font-black uppercase">{item.action}</p>
                <p className="text-slate-200 text-sm mt-1">{item.reason}</p>
                <p className="text-white font-mono text-xs mt-2 font-bold">+${item.savings}/year</p>
              </div>
            ))}
          </div>

          <div className="p-6 bg-emerald-500 rounded-3xl">
            <p className="text-slate-950 font-black mb-4">Get the full PDF report</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                className="flex-1 bg-white/20 p-3 rounded-xl border border-black/10 placeholder:text-slate-700 text-slate-950 outline-none" 
                placeholder="email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button onClick={handleSend} className="bg-slate-950 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">Send</button>
            </div>
          </div>
          
          <button onClick={() => setStep(1)} className="w-full text-slate-500 font-bold text-sm uppercase tracking-widest pt-4">Restart</button>
        </div>
      )}
    </div>
  );
}