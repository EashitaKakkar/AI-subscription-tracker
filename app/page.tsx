"use client"; // Add this line!

import Hero from '@/components/Hero';
import AuditForm from '@/components/AuditForm';

export default function Home() {
  const scrollToForm = () => {
    document.getElementById('audit-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="bg-slate-950 min-h-screen">
      <Hero onStartAudit={scrollToForm} />
      <div id="audit-form" className="py-20">
        <AuditForm />
      </div>
    </main>
  );
}