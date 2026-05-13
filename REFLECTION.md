# Reflection: AI Spend Auditor

## 1. The hardest bug you hit this week, and how you debugged it

The hardest bug was the Supabase "Invalid API key" error that persisted even after I confirmed the service role key was correctly set in `.env.local`.

My initial hypothesis was that the key was wrong — so I decoded the JWT and confirmed it contained `"role": "service_role"` and the correct project ref. Key was valid. That ruled out hypothesis 1.

Second hypothesis: the `.env.local` file wasn't being loaded. I added a debug `console.log` to `lib/supabase.ts` to print the first 20 characters of the key at runtime. The log showed `REPLACE_WITH_SERVICE...` — the placeholder value, not the real key. So the file was being read, but an old cached version.

Third hypothesis: Next.js was loading env vars from the wrong directory. The terminal showed a warning: "Next.js inferred your workspace root as C:\Users\VICTUS\ due to multiple lockfiles." There was a stray `package-lock.json` at `C:\Users\VICTUS\` from an unrelated project. Next.js was treating that directory as the workspace root and looking for `.env.local` there — not in the project folder.

Fix: renamed `C:\Users\VICTUS\package-lock.json` to `.bak`. Restarted the dev server. The debug log now showed the correct key prefix. The Supabase call succeeded.

The lesson: when env vars behave unexpectedly, don't assume the value is wrong — verify what value is actually being read at runtime. A one-line debug log saved 2 hours of key rotation and config hunting.

---

## 2. A decision you reversed mid-week, and what made you reverse it

I initially planned to use `middleware.ts` for request handling — it's the standard Next.js pattern I knew from previous projects. I wrote the file, exported a `middleware` function, and added the matcher config.

On Day 2, while reading the Next.js 16 docs (required by the AGENTS.md rule in the project), I found that `middleware.ts` is deprecated in Next.js 16. The replacement is `proxy.ts` with an exported `proxy` function — different filename, different export name, same matcher config format.

I reversed the decision immediately and rewrote the file as `proxy.ts`. The reason was straightforward: using a deprecated API in a submission being evaluated on engineering skills would be a red flag. More practically, deprecated APIs get removed in future versions — building on them creates technical debt from day one.

This also changed how I thought about the rest of the codebase. I went back and audited every Next.js API I was using against the v16 docs: `params` as a Promise (had to add `await`), `cookies()` and `headers()` as async functions, `redirect()` outside `try/catch`. Several of these would have been silent bugs in production — the code would have worked in development but failed in edge cases.

The broader lesson: read the actual docs for the version you're using, not the version you know.

---

## 3. What you would build in week 2 if you had it

The most valuable week 2 addition would be **user authentication with audit history**. Right now, every audit is anonymous — users get a UUID URL but have no way to see all their past audits or track savings over time. Adding Supabase Auth (email magic link, no password) would let founders log in and see "you've run 3 audits, your team's AI spend has dropped from $1,200 to $800/month over 6 weeks." That's a retention hook and a much stronger Credex lead signal.

Second priority: **the Credex consultation booking flow**. The current implementation surfaces a Credex CTA for audits showing >$500/month savings, but it's just a link. Week 2 would integrate Calendly or a simple booking form so high-value leads can book a call directly from the audit results page. This closes the loop between the audit tool and Credex's actual sales process.

Third: **benchmark mode**. "Your AI spend per developer is $X — companies your size average $Y." This requires aggregating anonymized data from completed audits. After 100+ audits, the dataset would be large enough to show meaningful benchmarks. This is the feature that makes the tool shareable — founders would post their benchmark comparison on Twitter, driving organic growth.

Fourth: **form state persistence improvements**. Currently using localStorage. Week 2 would add URL-based state encoding so users can share a pre-filled form (e.g., "here's my team's setup, what do you think?").

---

## 4. How you used AI tools

I used Kiro (the agentic IDE) as the primary development tool, with Claude and ChatGPT for specific tasks.

**Kiro:** Used for spec generation (requirements, design, task list), scaffolding boilerplate files (types, validations, route handlers), and writing property-based tests with fast-check. Kiro was most useful for the initial structure — it generated a coherent file layout and interface definitions that I then edited to match the exact Credex requirements.

**What I didn't trust Kiro with:** The audit engine logic. The plan selection algorithm (cheapest eligible plan, tie-break by highest minSeats, fallback to highest minSeats when no plan is eligible) required careful reasoning about edge cases. I wrote this myself and verified it with property-based tests. Kiro's first attempt at the algorithm had an off-by-one error in the fallback case — it was returning the cheapest plan instead of the highest-minSeats plan when no eligible plans existed.

**One specific time the AI was wrong:** Kiro suggested adding `turbopack.root` under `experimental` in `next.config.ts` to fix the workspace root warning. I applied it. The result was a Turbopack crash with a JavaScript heap out-of-memory error and a panic log. The key `experimental.turbo` doesn't exist in Next.js 16 — it was a hallucinated config option. I caught it by reading the Next.js error output carefully: "Unrecognized key(s) in object: 'turbo' at experimental." Reverted to a clean config immediately.

**Claude:** Used for the audit summary generation in production (the one required AI feature). Also used for drafting the business documents (GTM, Economics) as a starting point, which I then rewrote substantially to add specific numbers and reasoning.

---

## 5. Self-rating

**Discipline: 6/10**
I started on Day 1 as required and committed daily, but the commit history is compressed into fewer days than ideal. I should have spread the work more deliberately across the 7-day window rather than building in bursts.

**Code quality: 7/10**
The core library code (audit engine, validations, types) is clean, well-typed, and thoroughly tested with property-based tests. The UI components are functional but could use more polish — some components have inline styles that should be extracted to Tailwind classes, and error states could be more descriptive.

**Design sense: 6/10**
The UI is clean and professional but not distinctive. It uses standard Tailwind patterns without a strong visual identity. The report page is functional but the savings number could be more visually impactful — it should be the first thing your eye goes to, not just another section.

**Problem-solving: 8/10**
The debugging process for the env var issue was methodical — I formed hypotheses, tested each one with a specific check, and found the root cause rather than guessing. The TypeScript type issue with Supabase was resolved pragmatically (any typing) with a clear note about the proper fix.

**Entrepreneurial thinking: 7/10**
I understand the user (startup founders and engineering managers), the economics (lead gen for Credex), and the viral loop (shareable UUID URLs). The GTM plan has specific channels and tactics. Where I fell short: I didn't add the Credex consultation booking flow, which is the actual conversion mechanism. The tool generates leads but doesn't close them.
