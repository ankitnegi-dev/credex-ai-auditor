# Implementation Plan: AI Spend Auditor

## Overview

Implement the AI Spend Auditor as a Next.js 16 (App Router) web application. The build proceeds in layers: shared types and pure library code first, then the database and API layer, then UI components, and finally the report page and email delivery. All Next.js 16 conventions are followed throughout — `params` is a `Promise`, `middleware.ts` is replaced by `proxy.ts`, and `redirect()` is called outside `try/catch`.

## Tasks

- [x] 1. Set up project dependencies, shared types, and test infrastructure
  - Install runtime dependencies: `@supabase/supabase-js`, `@anthropic-ai/sdk`, `resend`, `zod`
  - Install dev dependencies: `vitest`, `@vitest/coverage-v8`, `fast-check`, `@vitejs/plugin-react`
  - Create `vitest.config.ts` at the project root configured for the Next.js environment
  - Create `lib/types.ts` exporting all shared TypeScript interfaces: `ToolEntry`, `PlanTier`, `CatalogTool`, `PricingCatalog`, `ToolAuditResult`, `AuditResult`, `AuditRecord`, `EmailRecord`
  - Create `lib/uuid.ts` wrapping `crypto.randomUUID()`
  - Create `__tests__/` directory structure: `unit/`, `integration/`
  - _Requirements: 3.1, 7.4_

- [x] 2. Implement the Pricing Catalog and its property tests
  - [x] 2.1 Create `lib/pricing-catalog.ts` with the full `PRICING_CATALOG` constant for all 15 tools
    - Keys must exactly match the tool name strings from Requirement 1.2 (case-sensitive)
    - Each tool must have at least one `PlanTier` with `pricePerSeat >= 0` and `minSeats >= 1`
    - Plan tier names must be unique within each tool
    - _Requirements: 1.2, 7.1, 7.2, 7.3, 7.4, 7.6_

  - [x] 2.2 Write property tests for Pricing Catalog structural invariants
    - **Property 6: Pricing Catalog structural invariants**
    - **Validates: Requirements 7.2, 7.3, 7.6**
    - File: `__tests__/unit/pricing-catalog.test.ts`
    - Assert every tool has ≥ 1 plan, every plan has `pricePerSeat >= 0` and `minSeats >= 1`, and plan names are unique per tool

  - [x] 2.3 Write property test for catalog idempotency
    - **Property 7: Catalog reads are idempotent**
    - **Validates: Requirements 7.5**
    - File: `__tests__/unit/pricing-catalog.test.ts`
    - Use `fc.constantFrom(...Object.keys(PRICING_CATALOG))` and `fc.integer({ min: 1, max: 1000 })` to assert two calls with the same args return the same plan

- [ ] 3. Implement the Audit Engine and its property tests
  - [x] 3.1 Create `lib/audit-engine.ts` with `selectOptimizedPlan`, `computeToolSavings`, and `compute`
    - `selectOptimizedPlan`: filter eligible plans by `minSeats <= seats`; if none, fall back to highest `minSeats`; among cheapest eligible, pick highest `minSeats` for tie-breaking
    - `computeToolSavings`: `optimizedMonthlyCost = round(pricePerSeat * seats, 2)`; `savings = max(0, round(userMonthlyCost - optimizedMonthlyCost, 2))`
    - `compute`: iterate entries, look up catalog, handle unknown tools (savings = 0), aggregate totals with `Math.round(value * 100) / 100`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [-] 3.2 Write property test for optimized plan selection
    - **Property 1: Optimized plan satisfies seat count and minimizes cost**
    - **Validates: Requirements 2.2**
    - File: `__tests__/unit/audit-engine.test.ts`
    - Use `fc.constantFrom(...Object.keys(PRICING_CATALOG))` and `fc.integer({ min: 1, max: 1000 })`; assert selected plan is cheapest eligible with tie-breaking by highest `minSeats`

  - [-] 3.3 Write property test for savings computation
    - **Property 2: Savings are non-negative and correctly computed**
    - **Validates: Requirements 2.3, 2.4**
    - File: `__tests__/unit/audit-engine.test.ts`
    - Use arbitrary `ToolEntry` with valid catalog tool; assert `savings === max(0, round(userMonthlyCost - optimizedPlan.pricePerSeat * seats, 2))`

  - [-] 3.4 Write property test for audit totals consistency
    - **Property 3: Audit totals are consistent with per-tool results**
    - **Validates: Requirements 2.5, 2.6, 2.7**
    - File: `__tests__/unit/audit-engine.test.ts`
    - Use `fc.array(fc.record({...}), { minLength: 1, maxLength: 15 })`; assert `totalSpend`, `totalOptimizedSpend`, and `totalSavings` equal the rounded sums of per-tool values

  - [-] 3.5 Write property test for unknown tool handling
    - **Property 4: Unknown tool produces zero savings**
    - **Validates: Requirements 2.8**
    - File: `__tests__/unit/audit-engine.test.ts`
    - Use `fc.string()` filtered to exclude catalog keys; assert `savings === 0` and `optimizedPlanName === entry.planType`

  - [-] 3.6 Write property test for seat count exceeding all thresholds
    - **Property 5: Seat count exceeding all plan thresholds produces zero savings**
    - **Validates: Requirements 2.9**
    - File: `__tests__/unit/audit-engine.test.ts`
    - For each catalog tool, compute `maxMinSeats`; use a seat count > `maxMinSeats`; assert fallback plan is returned and savings is 0

- [~] 4. Checkpoint — Ensure all library tests pass
  - Run `npx vitest run __tests__/unit/` and confirm all tests pass before proceeding.

- [ ] 5. Implement Zod validation schemas and their property test
  - [x] 5.1 Create `lib/validations.ts` with Zod schemas for the audit form and email route
    - `toolEntrySchema`: `toolName` non-empty string, `planType` non-empty string, `seats` integer >= 1, `monthlyCost` number >= 0
    - `auditRequestSchema`: `entries` array, min 1, max 15, each item validated by `toolEntrySchema`
    - `emailRequestSchema`: `auditId` UUID v4 format, `email` RFC 5322 via `z.string().email()`
    - _Requirements: 1.7, 1.8, 1.9, 1.10, 6.7_

  - [-] 5.2 Write property test for form validation rejection
    - **Property 8: Form validation rejects invalid entries universally**
    - **Validates: Requirements 1.7, 1.8, 1.9, 1.10**
    - File: `__tests__/unit/validations.test.ts`
    - Use `fc.record` with `seats < 1` or `monthlyCost < 0` or empty `toolName`/`planType`; assert `safeParse` returns `success: false`

- [ ] 6. Implement Supabase, Claude, and Resend library wrappers
  - [~] 6.1 Create `lib/supabase.ts` — server-side Supabase client singleton using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars
    - Export typed helper functions: `insertAudit(record)`, `updateAuditSummary(id, summary)`, `getAuditById(id)`
    - Export typed helper: `insertAuditEmail(auditId, email)`, `checkDuplicateEmail(auditId, email)`
    - _Requirements: 3.2, 3.3, 6.4, 6.8_

  - [~] 6.2 Create `lib/claude.ts` — Anthropic API wrapper
    - Implement `generateAuditSummary(result: AuditResult): Promise<string>`
    - Use `AbortController` with 30-second timeout; catch all errors and return `""` on failure
    - Use model `claude-3-5-haiku-20241022`, `max_tokens: 200`
    - Build prompt with total spend, optimized spend, savings, and per-tool breakdown
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [~] 6.3 Create `lib/resend.ts` — Resend email wrapper
    - Implement `sendAuditReport(email: string, audit: AuditRecord, reportUrl: string): Promise<void>`
    - Build HTML email with audit ID, totals, per-tool breakdown table, Claude summary (if non-empty), and report link
    - Throw on Resend error so the caller can return HTTP 500
    - _Requirements: 6.2, 6.3, 6.6_

- [~] 7. Implement the POST /api/audit Route Handler
  - Create `app/api/audit/route.ts` exporting `POST`
  - Parse and validate request body with `auditRequestSchema`; return 400 with `fieldErrors` on failure
  - Run `AuditEngine.compute(entries)` → `AuditResult`
  - Generate `auditId = crypto.randomUUID()`
  - Write audit record to Supabase; return 500 if write fails
  - Call `generateAuditSummary` (non-blocking on failure); update `audits.summary` in Supabase (log failure, continue)
  - Call `redirect(\`/audit/\${auditId}\`)` **outside** any `try/catch` block per Next.js 16 docs
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.4, 5.5, 5.6_

- [~] 8. Implement the POST /api/email Route Handler
  - Create `app/api/email/route.ts` exporting `POST`
  - Validate body with `emailRequestSchema`; return 400 on failure
  - Fetch audit by `auditId` from Supabase; return 404 if not found
  - Check for duplicate `(auditId, email)` in `audit_emails`; return 409 with informational message if found
  - Call `sendAuditReport`; return 500 if Resend throws (do NOT persist email)
  - Insert `(auditId, email)` into `audit_emails`; return `200 { success: true }`
  - _Requirements: 6.2, 6.4, 6.5, 6.6, 6.7, 6.8_

- [~] 9. Checkpoint — Ensure API route integration tests pass
  - Run `npx vitest run __tests__/integration/` and confirm all tests pass before proceeding.

- [ ] 10. Implement the Audit Form UI components
  - [~] 10.1 Create `components/tool-entry-row.tsx` — `'use client'` component
    - Props: `entry: ToolEntryDraft`, `index: number`, `onChange`, `onRemove`, `disableRemove: boolean`
    - Render tool name dropdown (15 options from Req 1.2), plan selector (Free/Pro/Team/Enterprise), seats number input (min 1), monthly cost number input (min 0), Remove button
    - Disable Remove button when `disableRemove` is true
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.13_

  - [~] 10.2 Create `components/audit-form.tsx` — `'use client'` component
    - Manage `ToolEntryDraft[]` state; initialize with one empty row
    - "Add Tool" button appends empty row; disabled when `entries.length >= 15`
    - "Remove" on each row removes it; disabled when `entries.length <= 1`
    - On submit, serialize entries to JSON and `POST` to `/api/audit` via `fetch`; follow redirect on success
    - Display per-field validation errors returned from the server (400 response)
    - Display a general error message on 500 response
    - _Requirements: 1.1, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13_

  - [~] 10.3 Update `app/page.tsx` to render `<AuditForm />`
    - Replace the default Next.js placeholder content with the `AuditForm` component
    - Update `app/layout.tsx` metadata: title "AI Spend Auditor", description "Audit your AI tool subscriptions"
    - _Requirements: 1.1_

- [ ] 11. Implement the Report Page components
  - [~] 11.1 Create `components/report-metrics.tsx` — displays total spend, optimized spend, and savings
    - Format all monetary values as USD with 2 decimal places (e.g., `$1,234.56`)
    - _Requirements: 4.2_

  - [~] 11.2 Create `components/report-breakdown-table.tsx` — per-tool breakdown table
    - Columns: tool name, current plan, current monthly cost, optimized plan name, optimized cost, savings
    - Format monetary values as USD
    - _Requirements: 4.3_

  - [~] 11.3 Create `components/report-suggestions.tsx` — savings suggestions list
    - Render only tools where `savings > 0`
    - Each suggestion includes tool name and recommended optimized plan name
    - _Requirements: 4.4_

  - [~] 11.4 Create `components/copy-link-button.tsx` — `'use client'` component
    - Call `navigator.clipboard.writeText(url)` on click
    - Show "Copied!" confirmation for 2 seconds, then revert
    - _Requirements: 4.8_

  - [~] 11.5 Create `components/email-form.tsx` — `'use client'` component using `useActionState`
    - Single email input + submit button
    - On success: display confirmation message and disable the form
    - On error: display error message and re-enable the form
    - On 409: display informational "already sent" message
    - Calls `POST /api/email` via fetch with `auditId` and `email`
    - _Requirements: 6.1, 6.5, 6.6, 6.7, 6.8_

- [ ] 12. Implement the Report Page (Server Component) and error boundaries
  - [~] 12.1 Create `app/audit/[id]/page.tsx` as an async Server Component
    - `params` must be `await`ed: `const { id } = await params` (Next.js 16 requirement)
    - Fetch audit record from Supabase using `id`; call `notFound()` if record is null
    - Render `ReportMetrics`, `ReportBreakdownTable`, `ReportSuggestions`, Claude summary section (only if `summary` is non-empty), `CopyLinkButton`, and `EmailForm`
    - Export `generateMetadata` function: `params` is `Promise<{ id: string }>`; fetch audit and return `openGraph.title` and `openGraph.description` containing the `total_savings` USD amount; include canonical URL
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 8.1, 8.2, 8.3_

  - [~] 12.2 Create `app/audit/[id]/not-found.tsx`
    - Render a human-readable "Audit not found" message with a link back to `/`
    - _Requirements: 4.7, 8.4_

  - [~] 12.3 Create `app/audit/[id]/error.tsx` — must be `'use client'`
    - Render a human-readable data retrieval failure message with a link back to `/`
    - _Requirements: 4.9, 8.5_

  - [~] 12.4 Write property test for Open Graph metadata
    - **Property 9: Open Graph metadata contains audit savings**
    - **Validates: Requirements 8.3**
    - File: `__tests__/unit/report-metadata.test.ts`
    - Use `fc.record` to generate arbitrary `AuditRecord` values; assert `generateMetadata` returns `openGraph.title` or `openGraph.description` containing the `total_savings` formatted as USD

- [~] 13. Create the proxy.ts file
  - Create `proxy.ts` at the project root (replaces deprecated `middleware.ts` in Next.js 16)
  - Export a `proxy` function (not `middleware`) per the Next.js 16 file convention
  - Configure matcher to exclude `_next/static`, `_next/image`, `favicon.ico`
  - _Requirements: (infrastructure — supports all routing requirements)_

- [~] 14. Final checkpoint — Ensure all tests pass
  - Run `npx vitest run` to execute all unit and integration tests
  - Fix any failures before considering the implementation complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at natural boundaries
- Property tests validate universal correctness properties using fast-check (min 100 iterations each)
- Unit/integration tests validate specific examples and edge cases
- **Next.js 16 critical notes:**
  - `params` in pages and route handlers is a `Promise` — always `await` it
  - `redirect()` must be called **outside** `try/catch` blocks
  - `middleware.ts` is deprecated — use `proxy.ts` with exported `proxy` function
  - `cookies()` and `headers()` from `next/headers` are async — always `await` them
- Supabase, Anthropic, and Resend clients must be mocked in all unit/integration tests using `vi.mock`
- Environment variables required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "5.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "5.2"] },
    { "id": 3, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 4, "tasks": ["10.1", "11.1", "11.2", "11.3", "11.4"] },
    { "id": 5, "tasks": ["10.2", "11.5"] },
    { "id": 6, "tasks": ["10.3", "12.1", "12.2", "12.3"] },
    { "id": 7, "tasks": ["12.4"] }
  ]
}
```
