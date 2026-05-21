"use client";

import { useState } from 'react';

interface DetectionResult {
  success?: boolean;
  messagesSent?: number;
  affectedUsers?: string[];
  error?: string;
}

export default function AdminPricingPanel() {
  const [tool, setTool] = useState('cursor');
  const [plan, setPlan] = useState('pro');
  const [newPrice, setNewPrice] = useState('30');
  const [loading, setLoading] = useState(false);
  
  const [result, setResult] = useState<DetectionResult | null>(null);

  const triggerDetection = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/detect-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: tool.toLowerCase().trim(),
          plan: plan.toLowerCase().trim(),
          newPrice: Number(newPrice)
        })
      });
      
      const data: DetectionResult = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Network transaction failed execution." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Market Price Simulator</h1>
          <p className="text-xs text-slate-400 mt-1">Simulate market pricing fluctuations to trigger batch user notification runs.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">TARGET SOFTWARE TOOL</label>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-mono"
              value={tool} 
              onChange={(e) => setTool(e.target.value)} 
              placeholder="e.g. cursor, claude, chatgpt"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">PLAN REFERENCE KEY</label>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-mono"
              value={plan} 
              onChange={(e) => setPlan(e.target.value)} 
              placeholder="e.g. pro, premium, monthly"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">NEW SIMULATED VALUE ($)</label>
            <input 
              type="number" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-mono"
              value={newPrice} 
              onChange={(e) => setNewPrice(e.target.value)} 
            />
          </div>

          <button
            onClick={triggerDetection}
            disabled={loading}
            className="w-full bg-emerald-500 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "Scanning System Records..." : "🚀 Launch Change Detection Run"}
          </button>
        </div>

        {result && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-48">
            <span className="block text-slate-400 font-semibold mb-2">EXECUTION LOG STREAM:</span>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}