## Day 1 — 2026-05-08
**Hours worked:** 1
**What I did:** Initialized Git repository and mandatory file structure. Analyzed the Credex brief to identify the core "Audit Engine" logic. Researched current 2026 pricing for Cursor, ChatGPT, and Copilot.
**What I learned:** The "entrepreneurial" aspect is a 25-point weight, meaning I need to focus on lead-gen math, not just React components. 
**Blockers:** Initial confusion on entity names (resolved).
**Plan for tomorrow:** Build the Spend Input form and reach out to 3 local startup founders for the required interviews.

## Day 2 — 2026-05-09
**Hours worked:** 2.5
**What I did:** Built out the interactive multi-step form logic. Implemented a dynamic "Plan Database" to handle tiered pricing (Hobby, Pro, Business) for major AI tools. Solved critical React hydration errors and "undefined property" crashes using optional chaining and a mounting safety pattern. Integrated LocalStorage persistence to ensure user progress isn't lost on refresh.
**What I learned:** Handling nested objects in React state (`Record<string, object>`) requires strict TypeScript interfaces and defensive initialization to prevent runtime errors. Also realized that providing industry-standard pricing reduces user friction compared to manual input.
**Blockers:** Encountered a `Cannot read properties of undefined` error during the Step 3 render, which was resolved by refactoring the state initialization and using optional chaining.
**Plan for tomorrow:** Build the "Audit Engine" to identify overlapping capabilities between tools (e.g., detecting waste between Cursor and Copilot). Add data visualization (charts) and an AI-driven text summary to provide actionable savings predictions.

## Day 3 — 2026-05-10
**Hours worked:** 0.5
**What I did:** Finalized the "Audit Engine" core logic. Built a category-based overlap detection system that flags redundant AI tools (e.g., Cursor vs Copilot). Added Step 4 (Results) which displays a calculated "Potential Savings" score and an AI-generated text prediction for burn-per-seat reduction.
**What I learned:** Implemented data-driven UI feedback. Learned how to map business categories to tool IDs to identify technical redundancies—turning a simple calculator into a consultative tool.
**Blockers:** I had 3 exams to study and appear for, so the project time dedication got compromized. Also had to change the logic since the previous design didn't align quite well with the product description.
**Plan for tomorrow:** Refine the visualization with a Bar Chart (Recharts) and prepare the "User Interview" documentation for final submission.