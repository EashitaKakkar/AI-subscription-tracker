## What this PR does
This PR extends SpendLens from a one-time static audit tool into an active, continuous monitoring platform. It implements persistent Supabase storage for every completed user audit, a manual administrative trigger endpoint (`/api/detect-changes`) to process pricing shifts, and an automated de-duplicated email notification system via Resend. Finally, it provides users with a dynamic, side-by-side frontend diff view that highlights infrastructure cost mutations and prominent top-line annual savings changes.

## Why
SaaS and AI tool pricing configurations are highly volatile, meaning static financial audits become rapidly outdated and risk delivering inaccurate optimization advice. This feature directly protects the user—primarily tech-focused teams or engineering managers monitoring overhead—by drawing them back to an interactive dashboard the moment market movements change their software budget profile. It assumes users value immediate, transparent visibility into sudden price increases or new tiered models without needing to re-input their stack options from scratch.

## How it works
1. **Audit Persistence**: When an audit is submitted, a route securely commits the user's metadata, selected array of tools, generated advice array, and a deeply nested dictionary representing the active `pricing_snapshot` (including multi-tier billing fields) to our Supabase database table.
2. **Change Detection & Extraction**: The `POST /api/detect-changes` endpoint acts as our evaluation pipeline. It filters all matching historical entries via `.contains()`. Inside the loop, a custom deep-drilling parser extracts primitive currency metrics from deep nested objects (`monthly` or `yearly` keys), securely handling schema variations and isolating clean numerical types while filtering out corrupt configurations via strict `isNaN` checks.
3. **Consolidation & Dispatch**: To protect against inbox fatigue, matching records are collapsed and aggregated into a single record map per unique email address. Resend builds an inline HTML payload detailing the cost drift and injects an interactive link with encoded parameters (`?re_audit=true&tool=...&new_price=...&plan=...`).
4. **Client-Side Comparison Layout**: When a user arrives via the tracking deep link, the `/share/[id]` page component captures the search query strings, contrasts the static database row against the live simulation parameters, and displays a two-column card matrix with an highlighted headline annual savings delta.

+-----------------------------------------------------------------------+
|  POST /api/detect-changes  --> Pulls matching Audits via Supabase    |
+-----------------------------------------------------------------------+
|
v
+-----------------------------------------------------------------------+
|  Collapses duplicate rows per user to prevent multi-email spamming    |
+-----------------------------------------------------------------------+
|
v
+-----------------------------------------------------------------------+
|  Dispatches Resend notification with required parameters         |
+-----------------------------------------------------------------------+
|
v
+-----------------------------------------------------------------------+
|  User visits /share/[id]?re_audit=true --> Mounts Split Diff Grid     |
+-----------------------------------------------------------------------+


## What I cut
1. **Native Cron/Worker Deamons**: I cut integrating background schedule utilities like Vercel Cron or Edge Worker triggers. Given the strict 36-hour window, prioritizing a reliable, manually testable administrative execution API endpoint offered a more predictable validation surface for reviews. It also gave me time to build an admin dashboard, from where one could make changes (accessible via /admin in the url)
2. **Granular Transactional Unsubscribe States**: One-click subscription preferences maps were omitted. The value-to-effort ratio under tight time constraints favored ensuring bulletproof visual delivery of the side-by-side differential rendering matrix over building opt-out tracking collections.
3. **Admin Dashboard Analytics View**: I cut the construction of a dedicated telemetry dashboard showing total emails pushed, percentage click-through rates, and aggregated analytics blocks to remain strictly focused on delivering a stable end-to-end user pipeline. Though I did add a small admin page where one could see the number of emails affected by the changes in the costs.

## How to test it manually
1. **Save an Audit**: Go to your local deployment and run a new audit. Include **Claude** on the **Pro** plan, input an email address, and submit. Verify that you receive the native SpendLens interactive email confirmation.
2. **Review Database State**: Check your Supabase database dashboard under the `audits` table. Verify that a row was successfully added containing a complete, multi-tiered JSON schema mapping inside the `pricing_snapshot` field.
3. **Simulate a Market Price Shift**: Open your API testing tool (or admin interface) and send a `POST` request to `/api/detect-changes` with the following JSON request body payload:
   ```json
   {
     "tool": "claude",
     "plan": "pro",
     "newPrice": 40
   }
4. **Inspect Server Logs**: Observe your terminal output stream. Ensure the data drilling loop runs without errors, extracts the historical price baseline, isolates your row match, and logs an email dispatch success block.
5. **Check Your Inbox**: Open the email client associated with your Resend sandbox testing account. Verify that a single consolidated alert is received showing that the tool shifted from the old hardcoded cost of $20 to the new cost.
6. **Open Split-Screen Diff View**: Click the "View Price Diff & Re-Audit Stack" action button in the email footer. Verify that the browser routes cleanly to your application, parses the URL search parameters, and displays the split comparative dashboard with the calculated headline annual savings delta.

## What's tested
Automated unit testing suites (such as Jest or Playwright integration scripts) were intentionally cut due to the tight project schedule to protect delivery velocity. If allotted an extended testing cycle, I would prioritize writing schema assertion specs confirming that our deep-nested pricing_snapshot lookups fall back to primitives cleanly without triggering compilation errors under arbitrary JSON properties.

## Open questions / risks
1. **Resend Sandbox Limits**: Because the workspace uses Resend's unverified onboarding@resend.dev free sandbox sender layer, emails will be rejected by the provider if the endpoint attempts to email any address that is not explicitly verified inside the developer panel.
2. **RLS vs. Background Worker Architecture Misfit**: In this implementation, the backend routine queries the database using the public anonymous client key. While this matches local simulation setups cleanly, it creates an architectural misfit with standard database Row-Level Security (RLS) protocols in a production context. A true background worker job running global calculations across separate user collections should be decoupled and authenticated via high-privilege server keys to operate safely without disabling row security.
3. **Unauthorize access to the price updation pannel**: Due to time constraints couldn't include an authorization page/ login to the admin page that updates the rates of the AI tools, which could be dangerous. 