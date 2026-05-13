# DEVLOG — AI Spend Auditor

## Day 1 — 2026-05-10

**Hours worked:** 4

**What I did:**
Set up the Next.js 16 project with TypeScript and Tailwind. Installed all dependencies: @supabase/supabase-js, @anthropic-ai/sdk, resend, zod. Generated the Kiro spec — requirements document, system design, and task list. Researched pricing data for all 15 tools from official vendor pages and wrote PRICING_DATA.md. Created the shared TypeScript interfaces in lib/types.ts and vitest.config.ts for testing. Set up the __tests__/ directory structure with unit/ and integration/ folders.

**What I learned:**
Next.js 16 has breaking changes that aren't in most tutorials. `params` in page components is now a Promise and must be awaited. `middleware.ts` is deprecated — replaced by `proxy.ts` with an exported `proxy` function. `redirect()` must be called outside `try/catch` blocks or it throws an unhandled error. Had to read the actual Next.js 16 docs rather than relying on existing knowledge.

**Blockers / what I'm stuck on:**
The Kiro spec generation took longer than expected because I kept editing the requirements to match the actual Credex assignment rather than accepting the first draft. Spent 45 minutes refining the audit engine spec to ensure the plan selection algorithm was precisely defined before writing any code.

**Plan for tomorrow:**
Implement the pricing catalog, audit engine, and all property-based tests. Get the core calculation logic working and verified before touching any UI.

---

## Day 2 — 2026-05-11

**Hours worked:** 6

**What I did:**
Implemented the full pricing catalog (lib/pricing-catalog.ts) with all 15 tools and verified plan tiers. Built the audit engine (lib/audit-engine.ts) with selectOptimizedPlan, computeToolSavings, and compute functions. Wrote all Zod validation schemas (lib/validations.ts). Created 24 property-based tests using fast-check covering all 9 correctness properties — all passing. Built the Supabase client wrapper (lib/supabase.ts), Claude API wrapper (lib/claude.ts), and Resend email wrapper (lib/resend.ts). Wrote the business documents: GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md.

**What I learned:**
Property-based testing with fast-check is significantly more powerful than example-based tests for pure functions like the audit engine. Running 100 random inputs per property caught an edge case I hadn't considered: when a user's seat count is exactly equal to a plan's minSeats threshold, the plan should be eligible (<=, not <). The test caught this before I shipped it.

**Blockers / what I'm stuck on:**
The @supabase/supabase-js v2 TypeScript types require a typed database schema to avoid `never[]` type errors on insert/update operations. Without a generated schema type, every Supabase call produces TypeScript errors. Resolved by using `any` typing on the client — not ideal but unblocks development. Would generate proper types from the Supabase CLI in a production setup.

**Plan for tomorrow:**
Build all UI components, the report page, API route handlers. Fix the Supabase env var issue and test the full end-to-end flow.

---

## Day 3 — 2026-05-12

**Hours worked:** 7

**What I did:**
Built all 7 UI components: AuditForm, ToolEntryRow, ReportMetrics, ReportBreakdownTable, ReportSuggestions, CopyLinkButton, EmailForm. Implemented both API route handlers (POST /api/audit, POST /api/email). Created the report page as an async Server Component with awaited params (Next.js 16 requirement). Added not-found.tsx and error.tsx for the audit route. Created proxy.ts replacing deprecated middleware.ts. Wrote ARCHITECTURE.md, TESTS.md, USER_INTERVIEWS.md. Debugged the Supabase env var issue — traced it to a stray package-lock.json at C:\Users\VICTUS\ causing Next.js to infer the wrong workspace root. Renamed the stray lockfile to fix it.

**What I learned:**
When env vars behave unexpectedly, don't assume the value is wrong — verify what value is actually being read at runtime. A one-line debug console.log confirmed Next.js was reading the placeholder value, not the real key. The root cause was the workspace root inference issue, not the key itself. Lesson: always check for stray lockfiles in parent directories when working in nested project structures.

**Blockers / what I'm stuck on:**
Supabase still returning "Invalid API key" intermittently even after the workspace root fix. Suspecting RLS policies on the tables may be blocking inserts even with the service role key. Will investigate and disable RLS tomorrow.

**Plan for tomorrow:**
Resolve Supabase RLS issue, deploy to Vercel, add localStorage form persistence, add team size and use case fields, add Credex CTA for high-savings audits, create PROMPTS.md and CI workflow, write final README, submit.

---

## Day 4 — 2026-05-13

**Hours worked:** 6

**What I did:**
Disabled RLS on audits and audit_emails tables in Supabase dashboard — this resolved the "Invalid API key" error (the service role key was correct; RLS was blocking server-side inserts). Added localStorage persistence to the audit form so state survives page reloads. Added team size and primary use case fields (coding/writing/data/research/mixed) to the form. Added Credex CTA section to the report page for audits showing >$500/month savings. Added "You're spending well" message for audits showing <$100/month savings. Created PROMPTS.md documenting the Claude prompt design and iteration history. Created .github/workflows/ci.yml for lint + test on every push. Updated REFLECTION.md to full depth (150-400 words per question). Deployed to Vercel, verified full end-to-end flow. Updated README.md with live URL, screenshots, quick start, and Decisions section. Final commit and submitted the Google Form.

**What I learned:**
Supabase RLS is enabled by default on all tables. For a server-side-only application where the service role key is never exposed to the browser, disabling RLS is the correct approach — security is enforced at the application layer. Also: GitHub Actions CI needs placeholder env vars for tests that import server-side modules, otherwise the Node process exits before any test runs.

**Blockers / what I'm stuck on:**
No blockers. Lighthouse scores: Performance 91, Accessibility 92, Best Practices 94. All targets met. Submission complete.

**Plan for tomorrow:**
Assignment submitted. Awaiting Round 2 notification within 3 working days of the deadline.
