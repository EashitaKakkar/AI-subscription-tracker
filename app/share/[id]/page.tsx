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
}

// Next.js 15+ requires params to be a Promise
type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params; // Unwrap the params Promise

  const { data } = await supabase
    .from('audits')
    .select('total_savings')
    .eq('id', id)
    .single();

  const savings = data?.total_savings?.toLocaleString() || '0';

  return {
    title: `Saved $${savings} on AI Tools | Audit Report`,
    description: `I just used the AI Spend Audit to find $${savings} in potential annual savings. Check out the optimization breakdown.`,
    openGraph: {
      title: `My AI Spend Audit: $${savings} Saved`,
      description: 'Stop bleeding cash on unused AI seats. View my full optimization report.',
      type: 'website',
      images: [
        {
          url: 'https://your-domain.com/og-preview.png', 
          width: 1200,
          height: 630,
          alt: 'AI Spend Audit Savings Preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `I found $${savings} in AI savings!`,
      description: 'Run your own 2-minute audit to find redundancies in your stack.',
      images: ['https://your-domain.com/og-preview.png'], 
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params; // Unwrap the params Promise

  // Fetching all necessary columns for the UI
  const { data, error } = await supabase
    .from('audits')
    .select('id, total_savings, advice, ai_summary')
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

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-2xl border border-slate-800 my-10 shadow-2xl text-white font-sans">
      <h1 className="text-2xl font-bold mb-6">AI Spend Audit Report</h1>
      
      <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-8 text-center">
        <p className="text-emerald-400 text-sm font-mono tracking-widest">ANNUAL POTENTIAL SAVINGS</p>
        <h2 className="text-6xl font-black text-emerald-500">${audit.total_savings.toLocaleString()}</h2>
      </div>

      {audit.ai_summary && (
        <div className="prose prose-invert max-w-none mb-10">
          <h3 className="text-slate-400 uppercase text-xs font-bold mb-2">Executive Summary</h3>
          <div className="text-slate-300 leading-relaxed">
            <ReactMarkdown>{audit.ai_summary}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-bold text-lg border-b border-slate-800 pb-2 text-slate-100">Optimization Steps</h3>
        {audit.advice && audit.advice.length > 0 ? (
          audit.advice.map((item, i) => (
            <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-all duration-200">
              <p className="text-emerald-500 font-bold">{item.tool} → {item.action}</p>
              <p className="text-slate-400 text-sm mt-1">{item.reason}</p>
              <p className="text-emerald-400 font-mono mt-3 font-bold">+${item.savings.toLocaleString()} saved/yr</p>
            </div>
          ))
        ) : (
          <p className="text-slate-500 italic text-sm">No specific optimization steps recorded.</p>
        )}
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-sm mb-4">Want to find your own savings?</p>
        <Link href="/" className="inline-block bg-emerald-500 text-slate-950 px-6 py-3 rounded-full font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
          Run Free Audit
        </Link>
      </div>
    </div>
  );
}