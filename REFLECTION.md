# 🧠 Development Reflection

---

# 1. 🐞 The Hardest Bug

The most critical bug occurred in the final hours when the entire frontend failed to compile, preventing the local environment from running.

I hypothesized that a package mismatch between **Next.js 16** and the **Turbopack** compiler was causing a hydration mismatch or a loop in the persistence logic.

Initially, I attempted to:

- Manually clear the `.next` cache
- Downgrade specific dependencies
- Reinstall node modules
- Debug hydration and state persistence issues

However, when the site remained broken, I realized a deeper architectural conflict existed within the state management layer.

To resolve this, I made the difficult decision to rapidly rewrite the core frontend components within the final two-hour window before the deadline.

While this successfully restored functionality and allowed deployment on **Vercel**, the extreme time pressure forced a compromise on the original “unique URL” architecture for shareable links.

As a result, I pivoted from a more complex dynamic routing system to a streamlined `id`-based approach that could be quickly tested and verified before submission.

---

# 2. 🔄 Decision Reversal

Mid-week, I reversed my decision to use **Firebase** as the backend provider and migrated the project to **Supabase**.

Initially, Firebase was selected for its real-time capabilities. However, I realized that an audit platform requiring:

- Defensible financial calculations
- Structured relational data
- Strict Row-Level Security (RLS)
- Reliable public sharing flows

would benefit significantly more from a relational **PostgreSQL** architecture.

Supabase provided:

- A cleaner interface for managing the `audits` table
- Better schema control
- Reliable generation of unique audit IDs
- Simpler implementation of secure RLS policies

This migration was essential for achieving the **“Viral Loop”** requirement while maintaining strong separation between:

- Private user data (emails, internal metadata)
- Public-facing audit reports

The switch also improved performance and reliability for a Product Hunt-style launch experience.

---

# 3. 🚀 Week 2 Plans

If given a second development week, I would focus on significantly expanding both the UI/UX and the capabilities of the **Audit Engine**.

## Planned Features

### 📊 Spend Tracking Dashboard
A recurring-user dashboard showing:

- Historical spend trends
- Savings over time
- Team-level analytics

### 🧮 “What-If” Cost Simulator
An interactive simulator to forecast how:

- Team growth
- Tool adoption
- Tier upgrades

would impact future AI software costs.

### 🔌 SaaS API Integrations
Direct integrations such as:

- OpenAI
- Anthropic
- Slack
- Notion

to automatically fetch real usage data instead of relying on manual user input.

This would evolve the product from a one-time audit tool into a proactive **AI Cost Management Platform** targeted toward startups and enterprise teams.

---

# 4. 🤖 Use of AI Tools

I used:

- **Gemini** for backend logic generation
- **ChatGPT** for documentation structuring and refinement

However, I intentionally avoided over-relying on AI for long-form architectural decisions because I observed it frequently losing context across complex state interactions.

## Issues I Caught Manually

### ⚠️ Unsafe TypeScript Typing
AI-generated `try-catch` blocks repeatedly used the `any` type instead of the safer `unknown` type, which would have weakened TypeScript strictness and reduced type safety.

### ⚠️ Incorrect Navigation Components
AI frequently suggested standard HTML `<a>` tags for navigation.

I manually corrected these to Next.js `<Link>` components to preserve:

- Client-side routing
- Performance optimization
- Seamless navigation without full-page reloads

This reinforced the importance of using AI as an assistant rather than blindly trusting generated code.

---

# 5. 📈 Self-Rating

| Category | Rating | Notes |
|---|---|---|
| Discipline | 10/10 | Maintained a consistent devlog and coding schedule despite balancing IIT Madras degree end-term exams and SPPU practicals. |
| Code Quality | 6/10 | Functional but impacted by the final AI-assisted frontend rewrite under severe time pressure. |
| Design Sense | 9/10 | Fully responsive UI with strong Lighthouse scores and Product Hunt-ready presentation quality. |
| Problem Solving | 3/10 | Relied heavily on AI assistance for debugging instead of independently identifying root causes. |
| Entrepreneurial Thinking | 8/10 | Reached out to founders and professionals through Google Forms to validate the audit logic using real-world feedback. |

---