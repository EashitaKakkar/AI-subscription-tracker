## Day 1 — 2026-05-07
**Hours worked:** 0
**What I did:** Since I was busy with exams, I couldn't check my mails, hence started the project late. 

## Day 2 — 2026-05-08
**Hours worked:** 2
**What I did:** Initialized Git repository and mandatory file structure. Analyzed the Credex brief to identify the core "Audit Engine" logic. Researched current 2026 pricing for Cursor, ChatGPT, and Copilot.
**What I learned:** The "entrepreneurial" aspect is a 25-point weight, meaning I need to focus on lead-gen math, not just React components. 
**Plan for tomorrow:** Build the Spend Input form and reach out to AI users (founders, students and working professionals) for the required interviews.

## Day 3 — 2026-05-09
**Hours worked:** 2.5
**What I did:** Built out the interactive multi-step form logic. Implemented a dynamic "Plan Database" to handle tiered pricing (Hobby, Pro, Business) for major AI tools. Solved critical React hydration errors and "undefined property" crashes using optional chaining and a mounting safety pattern. Integrated LocalStorage persistence to ensure user progress isn't lost on refresh.
**What I learned:** Handling nested objects in React state requires strict TypeScript interfaces and defensive initialization to prevent runtime errors. Also realized that providing industry-standard pricing reduces user friction compared to manual input.
**Blockers:** Encountered a `Cannot read properties of undefined` error during the Step 3 render, which was resolved by refactoring the state initialization and using optional chaining.
**Plan for tomorrow:** Build the "Audit Engine" to identify overlapping capabilities between tools (e.g., detecting waste between Cursor and Copilot). Add data visualization (charts) and an AI-driven text summary to provide actionable savings predictions.

## Day 4 — 2026-05-10
**Hours worked:** 3
**What I did:** Finalized the "Audit Engine" core logic. Built a category-based overlap detection system that flags redundant AI tools (e.g., Cursor vs Copilot). Added Step 4 (Results) which displays a calculated "Potential Savings" score and a share URL feature
**What I learned:** Implemented data-driven UI feedback. Learned how to map business categories to tool IDs to identify technical redundancies—turning a simple calculator into a consultative tool.
**Blockers:** I had 3 exams to study and appear for, so the project time dedication got compromized. Also had to change the logic since the previous design didn't align quite well with the product description.
**Plan for tomorrow:** Prepare the "User Interview" documentation for final submission.

## Day 5 — 2026-05-11
**Hours worked:** 5
**What I did:** Completed the "Value-First" end-to-end user journey. Refined the Audit Engine to provide specific "Drop vs. Keep" advice based on task redundancy. Integrated an email capture gate at the end of the flow to satisfy the lead-generation requirement.
**What I learned:** The difference between a mock UI (current alert system) and a production mail server. Evaluated services like Resend and Nodemailer for the MERN backend integration.
**Blockers:** Had an exam to study for, so couldn't dedicate much time.
**Plan for tomorrow:** Add the "AI summarizer" feature and implement a table to visualize the $ amount of waste.

## Day 6 — 2026-05-12
**Hours worked:** 12
**What I did:** Integrated the transactional email system using the Resend API to handle lead capture and report delivery. Successfully connected the "AI Executive Summary" feature to provide qualitative insights alongside the raw data.
**What I learned:** Deepened my understanding of transactional mail servers and the importance of handling asynchronous API failures gracefully in a production environment.
**Blockers:** Had to troubleshoot API key permissions and domain verification for the email service.
**Plan for tomorrow:** Finalize the unique shareable URLs and wrap up all project documentation.

---

## Day 7 — 2026-05-13
**Hours worked:** 12
**What I did:** Completed the persistent storage logic for the "Shareable URL" feature using Supabase to generate unique public IDs. Finalized the comprehensive project documentation, including the `README.md`, `PRICING_DATA.md`, and `PROMPTS.md`. Successfully deployed the entire stack to Vercel and performed a final audit of the viral sharing loop.
**What I learned:** The criticality of data privacy when creating public links—ensuring all PII (Personally Identifiable Information) is stripped from public views. I also gained experience in managing "Decisions & Trade-offs" documentation to justify architectural choices to stakeholders.
**Blockers:** Balancing the final polish and deployment with my current CSE examination schedule.
**Plan for tomorrow:** Submit the public repository and live URLs for review.
