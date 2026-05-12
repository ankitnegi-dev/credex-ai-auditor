# Reflection: AI Spend Auditor Build

## What was hardest?

The audit engine logic was the most technically demanding part. Getting the plan selection algorithm right — specifically the tie-breaking rule (cheapest plan, then highest minSeats among ties) — required careful thought. It's easy to write code that works for the happy path but breaks on edge cases like a user with 200 seats where only the Enterprise plan applies, or two plans with identical pricing at different seat thresholds.

The second hardest part was the Next.js 16 breaking changes. `params` being a `Promise` that must be awaited, `redirect()` needing to be outside `try/catch`, and `middleware.ts` being replaced by `proxy.ts` — none of these are in most tutorials or Stack Overflow answers. I had to read the actual Next.js 16 docs carefully.

## What did you cut and why?

- **User authentication** — cut entirely. Adding auth would have doubled the complexity and the core value (audit + share) works without it. A UUID URL is sufficient for sharing.
- **PDF export** — cut for time. The shareable URL serves the same purpose for the 3-day sprint.
- **Browser extension** — out of scope for MVP. Would be a strong Week 2 feature.
- **More than 15 tools** — the catalog is hardcoded at 15. Adding more requires a code change, which is intentional — it keeps pricing data versioned and auditable.

## How did Kiro help and where did it fail?

Kiro helped significantly with:
- Generating the initial spec (requirements, design, task list) — saved 2–3 hours of planning
- Scaffolding boilerplate files (types, validations, route handlers)
- Writing property-based tests with fast-check — I wouldn't have set these up from scratch in a 3-day sprint

Where Kiro fell short:
- The TypeScript types for `@supabase/supabase-js` v2 — Kiro generated code that assumed a typed database schema, which caused `never[]` type errors. I had to fix this manually by using `any` typing on the client.
- The `next.config.ts` turbopack root fix — Kiro suggested a config key (`experimental.turbo`) that doesn't exist in Next.js 16, causing a Turbopack crash. I had to revert it.
- Environment variable debugging — Kiro couldn't diagnose that Next.js was picking up the wrong workspace root due to a stray `package-lock.json` in the parent directory.

The pattern: Kiro is excellent at structure and boilerplate, but runtime environment issues and version-specific breaking changes require human debugging.

## What would you do with 7 more days?

1. **User authentication** — Supabase Auth so founders can log in and see all their past audits
2. **More tools** — expand the catalog to 30+ tools, add a "suggest a tool" form
3. **Browser extension** — detect AI tool subscriptions from browser history/bookmarks
4. **PDF export** — generate a downloadable PDF report for sharing with CFOs
5. **Comparison mode** — compare two audit snapshots to track savings over time
6. **Credex CTA integration** — after showing savings, show a personalised Credex credits offer

## What metric proves this worked?

**Weekly audits completed** is the primary proof. If founders are completing audits, the tool is delivering real value. Secondary proof is the email capture rate — if >35% of users submit their email, the value proposition is strong enough to earn their contact details.

A third signal: if any audit URL gets shared and generates a second visit from a different IP, the viral loop is working.
