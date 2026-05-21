
#  SpendLens: AI Spend Audit

A high-fidelity tool built for startup founders and engineering managers to audit, optimize, and reduce their annual AI software spend. By analyzing team size and tool overlap, **SpendLens** identifies redundant subscriptions and surfaces real-world savings through smarter tier management and Credex infrastructure credits.

**Live Demo:** [SpendLens](https://ai-subscription-tracker-two.vercel.app/)

---

## Proof of Concept

[https://youtu.be/3ygin-oGzus](https://youtu.be/3ygin-oGzus)
---

##  Quick Start

### 1. Clone & Install
```bash
git clone [https://github.com/your-username/ai-spend-audit.git](https://github.com/your-username/ai-spend-audit.git)
cd ai-spend-audit
npm install
--- 
### 2. Configure Environment Variables
Create a .env.local file with the following:

Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_ai_key
RESEND_API_KEY=your_resend_key
3. Run Locally
Bash
npm run dev
# Open http://localhost:3000
4. Deploy
Push to GitHub and connect your repository to Vercel. Ensure all Environment Variables are added in the Vercel Dashboard.

# Decisions & Trade-offs
- LLM Choice (Gemini vs. Anthropic): While the project prompt suggested Anthropic, I opted for the Gemini API. This was a pragmatic decision based on immediate credit availability and API stability during my development window.

- Visual Identity (Emojis vs. Logos): To ensure a clean legal profile and avoid potential copyright or trademark complexities with brand assets, I used high-quality emojis to represent AI tools. This maintains a professional aesthetic without the risk of asset misuse.

- Hardcoded Rules vs. AI Logic: I chose to use hardcoded mathematical rules for the audit engine rather than LLM inference. This ensures "defensible" finance reasoning that won't hallucinate savings numbers—reserving the AI specifically for the personalized executive summary.

- Scope Prioritization: Given the tight timeline and my current CSE examination schedule, I prioritized a "Deep MVP"—focusing on a flawless lead-capture and sharing loop (The "Viral Loop") over expansive multi-page UI depth.

- Schema Cache over Real-time Sync: To keep the app highly performant, I utilized Supabase RLS policies and optimized schema structures. This minimized latency in the shareable URL generation, ensuring the user gets their "viral" link instantly.

#  Tech Stack
Framework: Next.js 15+ (App Router)

Language: TypeScript (Strict Mode)

Database: Supabase (PostgreSQL)

Styling: Tailwind CSS + Framer Motion

AI: Gemini Pro

Emails: Resend
