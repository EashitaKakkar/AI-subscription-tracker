"use client";

import React from 'react';

const Hero = ({ onStartAudit }: { onStartAudit: () => void }) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium leading-6 text-emerald-400 ring-1 ring-inset ring-emerald-500/20 bg-emerald-500/5 mb-8">
          <span className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            May 2026 Pricing Data Live
          </span>
        </div>

        <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-white sm:text-7xl">
          Stop bleeding cash on <br />
          <span className="text-emerald-500 italic">unused AI seats.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Most engineering teams overspend by 30% on AI subscriptions. Our 2-minute audit identifies redundancies in your stack and surfaces exclusive discounts.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-y-6">
          <button
            onClick={onStartAudit}
            className="group relative inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Run Free Spend Audit
            <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          <div className="flex items-center gap-x-4 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px]">
                  👤
                </div>
              ))}
            </div>
            <span>Used by 200+ startups</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;