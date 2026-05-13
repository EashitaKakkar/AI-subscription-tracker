# 🤖 PROMPTS.md: LLM Engineering & Logic

This document details the system instructions used for the **SpendLens** AI Executive Summary, the reasoning behind the prompt engineering strategy, and the failed iterations encountered during development.

---

# 🛠️ The Final System Prompt

This prompt is sent to the **Gemini Pro** model via the `/api/generate-summary` endpoint.

```text
Context: You are a senior financial auditor specializing in SaaS and AI infrastructure optimization.

Task:
Analyze a JSON array of "Optimization Advice" for a company with [Team Size] members.

Constraints:
1. Tone:
   - Professional
   - Direct
   - Action-oriented
   - No fluff

2. Structure:
   - A one-sentence high-level assessment
   - 2–3 specific "Strategic Wins" based on the provided audit data
   - One "Infrastructure Note" regarding Credex credits if monthly savings exceed $500

3. Math:
   - Do not hallucinate new numbers
   - Use the exact "savings" and "tool" names provided in the JSON

4. Format:
   - Use Markdown formatting
   - Use bolding and bullet points for readability

Input Data:
[Audit JSON]
```

---

# 🧠 Why I Wrote It This Way

## 🎭 Role Prompting

By assigning the model the persona of a **Senior Financial Auditor**, I encouraged more professional terminology such as:

- Consolidation
- Standardization
- Infrastructure optimization
- Tier efficiency

instead of generic chatbot-style responses.

This improved the credibility of the generated executive summaries and aligned the output with the expectations of startup founders and engineering managers.

---

## 🧮 Mathematical Rigidity

Since LLMs are unreliable with deterministic arithmetic, I intentionally separated:

- **Calculation logic** → handled entirely in the frontend audit engine
- **Language generation** → handled by Gemini

The prompt explicitly forbids the model from inventing numbers.

This forces the AI to behave as a **translator of verified audit data** rather than an unreliable calculator.

---

## 🏢 Credex Alignment

The prompt includes a conditional rule for generating an **Infrastructure Note** only when monthly savings exceed `$500`.

This strategically aligns the product with the Credex infrastructure-credit narrative without making the output feel like spam or forced advertising.

It also ensures enterprise recommendations only appear when financially justified.

---

# ❌ What Didn’t Work

## 1. 💥 The “Full Context” Fail

Initially, I passed the entire raw `formData` object to the AI, including:

- Selected tools
- Pricing tiers
- Team size
- Subscription configurations

and asked the model to calculate the savings itself.

### Result

The AI consistently:

- Hallucinated pricing data
- Miscalculated multiplications
- Produced inconsistent totals

### Fix

I moved all financial calculations into a deterministic TypeScript `useMemo` audit engine and only passed finalized `AdviceItems` to the AI layer.

This dramatically improved reliability and trustworthiness.

---

## 2. 😅 The “Too Friendly” Problem

Early prompt versions did not specify tone constraints.

### Result

The AI generated outputs such as:

> “Wow! You’re doing great! 🎉”

which felt completely inappropriate for a financial optimization platform targeted toward founders and engineering leaders.

### Fix

I introduced explicit constraints:

- “Professional”
- “Direct”
- “No fluff”

This immediately improved the seriousness and credibility of the summaries.

---

## 3. 📉 Token Bloat

At one point, I experimented with asking the AI to recommend *new* tools the company was not currently using.

### Result

This caused:

- Long irrelevant paragraphs
- Off-topic suggestions
- Reduced clarity
- Increased token usage

The recommendations distracted from the core product goal:
**reducing unnecessary spend**.

### Fix

I restricted the AI output to:

- Audit-backed insights only
- 2–3 concise strategic wins
- Existing tool consolidation opportunities

This made the summaries significantly sharper and more actionable.

---

# 🛠️ Tech Stack Integration

The prompt execution is handled through a Next.js **Route Handler**, ensuring the `GEMINI_API_KEY` remains securely server-side and never exposed to the client browser.

## Stack Flow

```txt
Frontend Form → Route Handler → Gemini API → Executive Summary
```

## Security Benefits

- API key never reaches the browser
- Reduced attack surface
- Cleaner separation between frontend and AI infrastructure
- Easier future migration to alternate LLM providers

---

# 📌 Final Takeaway

The biggest lesson from building the AI layer for SpendLens was realizing that:

> LLMs are excellent communicators but unreliable calculators.

By separating deterministic business logic from natural-language generation, I was able to create summaries that felt intelligent while remaining financially defensible.

---