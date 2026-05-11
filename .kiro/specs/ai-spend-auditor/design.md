# Design Document: AI Spend Auditor

## Overview

The AI Spend Auditor is a Next.js 16 web application that lets startup founders audit their AI tool subscriptions. Users fill in a form listing their current tools, plans, seat counts, and monthly costs. A server-side Audit Engine compares each entry against a static Pricing Catalog to find the cheapest viable plan, calculates savings, persists the result to Supabase, generates a Claude AI summary, and redirects the user to a shareable report page at `/audit/[uuid]`. From the report page, users can copy a share link and optionally email the report to themselves via Resend.

### Key Technical Decisions

- **No client-side routing for form submission**: The audit form submits to a Next.js Route Handler (`POST /api/audit`). On success the handler returns a redirect to `/audit/[id]`. This keeps the audit logic entirely server-side and avoids exposing Supabase credentials to the browser.
- **Server Components for the report page**: `app/audit/[id]/page.tsx` is an async Server Component that fetches directly from Supabase. No client-side data fetching is needed for the initial render.
- **Static Pricing Catalog**: A TypeScript constant in `lib/pricing-catalog.ts` — no runtime fetch, no database table. This makes the catalog trivially testable and version-controlled.
- **Claude summary is non-blocking**: The audit record is written to Supabase first. The Claude call happens in the same Route Handler request but its result is written in a second Supabase update. If it fails, the audit record already exists with an empty summary.
- **Next.js 16 async APIs**: All `params` and `searchParams` props are `Promise`s and must be `await`ed. `cookies()` and `headers()` are also async. The `proxy.ts` file replaces the deprecated `middleware.ts`.

---

## Architecture

```mermaid
graph TD
    Browser -->|POST /api/audit| AuditRoute[Route Handler\napp/api/audit/route.ts]
    AuditRoute --> AuditEngine[Audit Engine\nlib/audit-engine.ts]
    AuditEngine --> PricingCatalog[Pricing Catalog\nlib/pricing-catalog.ts]
    AuditRoute --> Supabase[(Supabase\nPostgreSQL)]
    AuditRoute --> ClaudeAPI[Anthropic Claude API]
    AuditRoute -->|redirect /audit/id| ReportPage[Report Page\napp/audit/[id]/page.tsx]
    ReportPage --> Supabase
    ReportPage --> EmailForm[Email Form\ncomponents/email-form.tsx]
    EmailForm -->|POST /api/email| EmailRoute[Route Handler\napp/api/email/route.ts]
    EmailRoute --> Resend[Resend Email API]
    EmailRoute --> Supabase
```

### Request Flow

1. User fills the audit form on `/` and submits.
2. Browser `POST`s JSON to `/api/audit`.
3. Route Handler validates input, runs the Audit Engine, generates a UUID, writes to Supabase, calls Claude (with 30 s timeout), updates the summary in Supabase, then redirects to `/audit/[id]`.
4. Browser follows the redirect to `/audit/[id]`.
5. Next.js renders the Server Component, which fetches the audit record from Supabase and renders the full report.
6. User optionally submits their email via the client-side Email Form, which calls `POST /api/email`.

---

## File / Directory Structure

```
app/
  page.tsx                          # Home page — renders AuditForm
  layout.tsx                        # Root layout (already exists)
  globals.css                       # Global styles (already exists)
  audit/
    [id]/
      page.tsx                      # Report page (Server Component)
      not-found.tsx                 # Rendered when audit ID not found
      error.tsx                     # Rendered on Supabase fetch failure
  api/
    audit/
      route.ts                      # POST /api/audit — run audit, persist, redirect
    email/
      route.ts                      # POST /api/email — send report via Resend

components/
  audit-form.tsx                    # Client Component — multi-row form with validation
  tool-entry-row.tsx                # Client Component — single tool entry row
  report-metrics.tsx                # Server/Client Component — summary metrics display
  report-breakdown-table.tsx        # Server Component — per-tool breakdown table
  report-suggestions.tsx            # Server Component — savings suggestions list
  copy-link-button.tsx              # Client Component — clipboard copy with "Copied!" state
  email-form.tsx                    # Client Component — email capture with useActionState

lib/
  pricing-catalog.ts                # Static TypeScript constant — all 15 tools + plans
  audit-engine.ts                   # Pure functions — plan selection + savings calculation
  supabase.ts                       # Supabase client singleton (server-side)
  claude.ts                         # Anthropic API wrapper with 30 s timeout
  resend.ts                         # Resend API wrapper
  validations.ts                    # Zod schemas for form and API input validation
  uuid.ts                           # UUID v4 generation (crypto.randomUUID wrapper)

proxy.ts                            # Next.js 16 proxy (replaces middleware.ts)
```

---

## Components and Interfaces

### `AuditForm` (`components/audit-form.tsx`)

A `'use client'` component. Manages an array of `ToolEntryDraft` objects in local state. Uses `useActionState` from React to handle the server action response and display validation errors. Renders a list of `ToolEntryRow` components plus Add/Remove controls.

**Props:** none (standalone page component)

**State:**
```ts
type ToolEntryDraft = {
  id: string           // client-side key for React list rendering
  toolName: string
  planType: string
  seats: string        // string to allow empty input before parsing
  monthlyCost: string
}
```

**Behavior:**
- Initializes with one empty `ToolEntryDraft`.
- "Add Tool" appends a new empty row; disabled when `entries.length >= 15`.
- "Remove" removes the row at that index; disabled when `entries.length <= 1`.
- On submit, serializes entries to JSON and `POST`s to `/api/audit`.
- Displays per-field validation errors returned from the server action.

### `ToolEntryRow` (`components/tool-entry-row.tsx`)

A `'use client'` component rendering one row: tool dropdown, plan selector, seats input, monthly cost input, and a Remove button.

### `CopyLinkButton` (`components/copy-link-button.tsx`)

A `'use client'` component. Calls `navigator.clipboard.writeText(url)` on click and shows "Copied!" for 2 seconds.

### `EmailForm` (`components/email-form.tsx`)

A `'use client'` component using `useActionState`. Calls the `/api/email` route handler. Disables the form after a successful send. Shows error messages on failure.

---

## Data Models

### TypeScript Types

```ts
// A single tool entry as submitted by the user
export interface ToolEntry {
  toolName: string      // must match a key in PRICING_CATALOG exactly
  planType: string      // user-reported plan (Free | Pro | Team | Enterprise)
  seats: number         // >= 1
  monthlyCost: number   // >= 0, user-reported monthly cost in USD
}

// A plan tier within the Pricing Catalog
export interface PlanTier {
  name: string          // e.g. "Pro", "Team", "Business"
  pricePerSeat: number  // USD per seat per month, >= 0
  minSeats: number      // minimum seat threshold, >= 1
}

// A tool entry in the Pricing Catalog
export interface CatalogTool {
  plans: PlanTier[]
}

// The full Pricing Catalog
export type PricingCatalog = Record<string, CatalogTool>

// Result of running the Audit Engine on a single ToolEntry
export interface ToolAuditResult {
  toolName: string
  userPlan: string
  userMonthlyCost: number
  optimizedPlanName: string
  optimizedMonthlyCost: number  // optimizedPlan.pricePerSeat * seats, rounded to 2dp
  savings: number               // >= 0, rounded to 2dp
}

// Full audit computation result (before persistence)
export interface AuditResult {
  toolResults: ToolAuditResult[]
  totalSpend: number            // sum of userMonthlyCost, rounded to 2dp
  totalOptimizedSpend: number   // sum of optimizedMonthlyCost, rounded to 2dp
  totalSavings: number          // sum of savings, rounded to 2dp
}

// The record stored in Supabase
export interface AuditRecord {
  id: string                    // UUID v4
  tool_results: ToolAuditResult[]
  total_spend: number
  total_optimized_spend: number
  total_savings: number
  summary: string               // Claude-generated text, or "" if unavailable
  created_at: string            // ISO 8601 timestamp
}

// Email record stored in Supabase
export interface EmailRecord {
  id: string                    // UUID v4
  audit_id: string              // FK → audits.id
  email: string
  sent_at: string               // ISO 8601 timestamp
}
```

---

## Supabase Database Schema

### Table: `audits`

| Column                 | Type        | Constraints                  | Notes                                  |
|------------------------|-------------|------------------------------|----------------------------------------|
| `id`                   | `uuid`      | PRIMARY KEY                  | UUID v4, generated by the application  |
| `tool_results`         | `jsonb`     | NOT NULL                     | Array of `ToolAuditResult` objects     |
| `total_spend`          | `numeric`   | NOT NULL                     | Rounded to 2 decimal places            |
| `total_optimized_spend`| `numeric`   | NOT NULL                     | Rounded to 2 decimal places            |
| `total_savings`        | `numeric`   | NOT NULL                     | Rounded to 2 decimal places            |
| `summary`              | `text`      | NOT NULL, DEFAULT `''`       | Claude summary or empty string         |
| `created_at`           | `timestamptz` | NOT NULL, DEFAULT `now()`  | Auto-set on insert                     |

### Table: `audit_emails`

| Column     | Type          | Constraints                        | Notes                              |
|------------|---------------|------------------------------------|------------------------------------|
| `id`       | `uuid`        | PRIMARY KEY                        | UUID v4                            |
| `audit_id` | `uuid`        | NOT NULL, FK → `audits.id`         | References the parent audit        |
| `email`    | `text`        | NOT NULL                           | RFC 5322 validated before insert   |
| `sent_at`  | `timestamptz` | NOT NULL, DEFAULT `now()`          | Auto-set on insert                 |

**Unique constraint:** `(audit_id, email)` — prevents duplicate email sends for the same audit.

### SQL Migration

```sql
CREATE TABLE audits (
  id                    UUID PRIMARY KEY,
  tool_results          JSONB NOT NULL,
  total_spend           NUMERIC(10, 2) NOT NULL,
  total_optimized_spend NUMERIC(10, 2) NOT NULL,
  total_savings         NUMERIC(10, 2) NOT NULL,
  summary               TEXT NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_emails (
  id        UUID PRIMARY KEY,
  audit_id  UUID NOT NULL REFERENCES audits(id),
  email     TEXT NOT NULL,
  sent_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (audit_id, email)
);
```

---

## API Routes

### `POST /api/audit`

**File:** `app/api/audit/route.ts`

**Request body (JSON):**
```ts
{
  entries: Array<{
    toolName: string
    planType: string
    seats: number
    monthlyCost: number
  }>
}
```

**Validation (Zod):**
- `entries`: array, min length 1, max length 15
- Each entry: `toolName` non-empty string, `planType` non-empty string, `seats` integer >= 1, `monthlyCost` number >= 0

**Success response:** HTTP 307 redirect to `/audit/[id]`

**Error responses:**
- `400 Bad Request` — validation failure, JSON body `{ error: string, fieldErrors?: Record<string, string[]> }`
- `500 Internal Server Error` — Supabase write failure, JSON body `{ error: string }`

**Handler logic (pseudocode):**
```
1. Parse and validate request body with Zod
2. Run AuditEngine.compute(entries) → AuditResult
3. Generate auditId = crypto.randomUUID()
4. Write audit record to Supabase (audits table)
   - If write fails → return 500
5. Call Claude API with 30 s timeout → summary string
   - If Claude fails → summary = ""
6. Update audits.summary = summary in Supabase
   - If update fails → log error, continue (non-blocking)
7. redirect(`/audit/${auditId}`)
   - Note: redirect() must be called OUTSIDE try/catch per Next.js 16 docs
```

### `POST /api/email`

**File:** `app/api/email/route.ts`

**Request body (JSON):**
```ts
{
  auditId: string   // UUID v4
  email: string     // RFC 5322 email address
}
```

**Validation:**
- `auditId`: UUID v4 format
- `email`: RFC 5322 format (validated with Zod `z.string().email()`)

**Success response:** `200 OK`, JSON `{ success: true }`

**Error responses:**
- `400 Bad Request` — invalid email format or missing fields
- `409 Conflict` — email already sent for this audit ID
- `404 Not Found` — audit ID does not exist
- `500 Internal Server Error` — Resend API failure

**Handler logic (pseudocode):**
```
1. Parse and validate request body
2. Fetch audit record from Supabase by auditId
   - If not found → return 404
3. Check audit_emails for (auditId, email) duplicate
   - If exists → return 409 with informational message
4. Send email via Resend
   - If Resend fails → return 500 (do NOT persist email)
5. Insert (auditId, email) into audit_emails
6. Return 200 { success: true }
```

---

## Pricing Catalog Structure

**File:** `lib/pricing-catalog.ts`

The catalog is a `const` object typed as `PricingCatalog`. Keys are exact tool name strings matching the dropdown options in Requirement 1.2.

```ts
export const PRICING_CATALOG: PricingCatalog = {
  "ChatGPT": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Plus",       pricePerSeat: 20,    minSeats: 1 },
      { name: "Team",       pricePerSeat: 25,    minSeats: 2 },
      { name: "Enterprise", pricePerSeat: 60,    minSeats: 150 },
    ]
  },
  "Claude": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 20,    minSeats: 1 },
      { name: "Team",       pricePerSeat: 30,    minSeats: 5 },
      { name: "Enterprise", pricePerSeat: 50,    minSeats: 25 },
    ]
  },
  "Cursor": {
    plans: [
      { name: "Hobby",      pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 20,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 40,    minSeats: 1 },
    ]
  },
  "GitHub Copilot": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 10,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 19,    minSeats: 1 },
      { name: "Enterprise", pricePerSeat: 39,    minSeats: 1 },
    ]
  },
  "Midjourney": {
    plans: [
      { name: "Basic",      pricePerSeat: 10,    minSeats: 1 },
      { name: "Standard",   pricePerSeat: 30,    minSeats: 1 },
      { name: "Pro",        pricePerSeat: 60,    minSeats: 1 },
      { name: "Mega",       pricePerSeat: 120,   minSeats: 1 },
    ]
  },
  "Gemini": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Advanced",   pricePerSeat: 19.99, minSeats: 1 },
      { name: "Business",   pricePerSeat: 24,    minSeats: 1 },
      { name: "Enterprise", pricePerSeat: 30,    minSeats: 1 },
    ]
  },
  "Perplexity": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 20,    minSeats: 1 },
      { name: "Enterprise", pricePerSeat: 40,    minSeats: 5 },
    ]
  },
  "Notion AI": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Plus",       pricePerSeat: 10,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 15,    minSeats: 1 },
      { name: "Enterprise", pricePerSeat: 20,    minSeats: 100 },
    ]
  },
  "Grammarly": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Premium",    pricePerSeat: 12,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 15,    minSeats: 3 },
      { name: "Enterprise", pricePerSeat: 25,    minSeats: 10 },
    ]
  },
  "Jasper": {
    plans: [
      { name: "Creator",    pricePerSeat: 39,    minSeats: 1 },
      { name: "Pro",        pricePerSeat: 59,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 99,    minSeats: 1 },
    ]
  },
  "Copy.ai": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 36,    minSeats: 1 },
      { name: "Team",       pricePerSeat: 186,   minSeats: 5 },
      { name: "Enterprise", pricePerSeat: 300,   minSeats: 10 },
    ]
  },
  "Runway": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Standard",   pricePerSeat: 12,    minSeats: 1 },
      { name: "Pro",        pricePerSeat: 28,    minSeats: 1 },
      { name: "Unlimited",  pricePerSeat: 76,    minSeats: 1 },
    ]
  },
  "ElevenLabs": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Starter",    pricePerSeat: 5,     minSeats: 1 },
      { name: "Creator",    pricePerSeat: 22,    minSeats: 1 },
      { name: "Pro",        pricePerSeat: 99,    minSeats: 1 },
    ]
  },
  "Synthesia": {
    plans: [
      { name: "Starter",    pricePerSeat: 18,    minSeats: 1 },
      { name: "Creator",    pricePerSeat: 64,    minSeats: 1 },
      { name: "Enterprise", pricePerSeat: 150,   minSeats: 3 },
    ]
  },
  "Otter.ai": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 10,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 20,    minSeats: 3 },
      { name: "Enterprise", pricePerSeat: 30,    minSeats: 10 },
    ]
  },
} as const
```

> **Note:** Prices are representative and should be verified against current vendor pricing before launch. The catalog is versioned in source control; updates require a code change and deployment.

---

## Audit Engine Algorithm

**File:** `lib/audit-engine.ts`

All functions are pure (no side effects, no I/O). This makes them straightforwardly testable.

### `selectOptimizedPlan(tool: CatalogTool, seats: number): PlanTier`

```
1. Filter tool.plans to only those where plan.minSeats <= seats
   → eligiblePlans
2. If eligiblePlans is empty:
   → Return the plan with the highest minSeats (fallback per Req 2.9)
3. Find the minimum pricePerSeat among eligiblePlans
   → minPrice
4. Filter eligiblePlans to those where pricePerSeat === minPrice
   → cheapestPlans
5. If cheapestPlans has one element → return it
6. If cheapestPlans has multiple (tie):
   → Return the one with the highest minSeats (Req 2.2 tie-breaking)
```

### `computeToolSavings(entry: ToolEntry, optimizedPlan: PlanTier): ToolAuditResult`

```
1. optimizedMonthlyCost = round(optimizedPlan.pricePerSeat * entry.seats, 2)
2. rawSavings = round(entry.monthlyCost - optimizedMonthlyCost, 2)
3. savings = max(rawSavings, 0)   // floor at 0 per Req 2.4
4. Return ToolAuditResult {
     toolName: entry.toolName,
     userPlan: entry.planType,
     userMonthlyCost: entry.monthlyCost,
     optimizedPlanName: optimizedPlan.name,
     optimizedMonthlyCost,
     savings
   }
```

### `compute(entries: ToolEntry[]): AuditResult`

```
1. For each entry in entries:
   a. Look up PRICING_CATALOG[entry.toolName]
   b. If not found:
      → toolResult = { ...entry fields, optimizedPlanName: entry.planType,
                       optimizedMonthlyCost: entry.monthlyCost, savings: 0 }
   c. If found:
      → optimizedPlan = selectOptimizedPlan(catalogTool, entry.seats)
      → toolResult = computeToolSavings(entry, optimizedPlan)
2. totalSpend = round(sum(entry.monthlyCost for all entries), 2)
3. totalOptimizedSpend = round(sum(result.optimizedMonthlyCost for all results), 2)
4. totalSavings = round(sum(result.savings for all results), 2)
5. Return AuditResult { toolResults, totalSpend, totalOptimizedSpend, totalSavings }
```

### Rounding

All monetary rounding uses `Math.round(value * 100) / 100` to avoid floating-point drift. This is equivalent to rounding to 2 decimal places.

---

## Claude API Integration

**File:** `lib/claude.ts`

```ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateAuditSummary(result: AuditResult): Promise<string> {
  const prompt = buildPrompt(result)
  
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)
  
  try {
    const message = await client.messages.create(
      {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      },
      { signal: controller.signal }
    )
    return extractText(message)
  } catch {
    return ''   // graceful degradation per Req 5.5
  } finally {
    clearTimeout(timeout)
  }
}

function buildPrompt(result: AuditResult): string {
  const breakdown = result.toolResults
    .map(r => `- ${r.toolName}: currently paying $${r.userMonthlyCost}/mo, optimized cost $${r.optimizedMonthlyCost}/mo, savings $${r.savings}/mo`)
    .join('\n')

  return `You are an AI spending advisor. Write a personalized audit summary for a startup founder.
Keep it between 90 and 110 words. Write in second person (use "you" and "your").
Focus on the biggest savings opportunities and give a clear call to action.

Audit data:
- Total monthly spend: $${result.totalSpend}
- Total optimized spend: $${result.totalOptimizedSpend}
- Total potential savings: $${result.totalSavings}/month

Per-tool breakdown:
${breakdown}

Write the summary now:`
}
```

**Model choice rationale:** `claude-3-5-haiku-20241022` is the fastest and cheapest Claude model suitable for short text generation. The 30-second timeout is enforced via `AbortController` since the Anthropic SDK respects the Web API `signal` option.

---

## Resend Email Integration

**File:** `lib/resend.ts`

```ts
import { Resend } from 'resend'
import type { AuditRecord } from './types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAuditReport(
  email: string,
  audit: AuditRecord,
  reportUrl: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: 'AI Spend Auditor <reports@yourdomain.com>',
    to: email,
    subject: `Your AI Spend Audit — Save $${audit.total_savings}/month`,
    html: buildEmailHtml(audit, reportUrl),
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}
```

The Route Handler catches the thrown error and returns HTTP 500 without persisting the email address (per Req 6.6).

**Email content includes:**
- Audit ID
- Total spend, optimized spend, total savings (USD formatted)
- Per-tool breakdown table (HTML table)
- Claude summary (if non-empty)
- Link to the report page

---

## Client-Side State Management

The application uses React's built-in state primitives — no external state library is needed.

| Component | State mechanism | What it manages |
|---|---|---|
| `AuditForm` | `useState` + `useActionState` | Array of `ToolEntryDraft`, form submission state, validation errors |
| `CopyLinkButton` | `useState` | "Copied!" confirmation timeout |
| `EmailForm` | `useActionState` | Email input, submission state, success/error message |

**Form submission approach:** The `AuditForm` uses a standard `fetch` call to `POST /api/audit` rather than a Server Action, because the response is a redirect that the browser needs to follow. `useActionState` is used for the `EmailForm` since it calls a Server Action that returns a result object (no redirect needed).

---

## Error Handling Strategy

| Scenario | Behavior |
|---|---|
| Form validation failure (client) | Inline error messages per field; form not submitted |
| Form validation failure (server, 400) | Error messages displayed in form; user can correct and resubmit |
| Supabase write failure (500) | Error message displayed in form; audit not created |
| Audit ID not found in Supabase | `app/audit/[id]/not-found.tsx` rendered via Next.js `notFound()` |
| Supabase fetch failure on report page | `app/audit/[id]/error.tsx` rendered via Next.js error boundary |
| Claude API timeout / failure | Empty summary stored; report page renders without summary section |
| Resend API failure | HTTP 500 returned to email form; error message shown; form re-enabled for retry |
| Duplicate email submission | HTTP 409 returned; informational message shown; no duplicate email sent |

**Next.js 16 specifics:**
- `notFound()` and `redirect()` must be called **outside** `try/catch` blocks.
- `error.tsx` must be a `'use client'` component.
- `params` in `app/audit/[id]/page.tsx` must be `await`ed: `const { id } = await params`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The Audit Engine (`lib/audit-engine.ts`) and Pricing Catalog (`lib/pricing-catalog.ts`) are pure functions and static data structures — ideal candidates for property-based testing. The properties below are derived from the acceptance criteria prework analysis.

**Property reflection:** After reviewing all testable criteria, Properties 5, 6, and 7 (total spend, total optimized spend, total savings) are all summation-with-rounding properties over a list of entries. They share the same structure and can be tested with a single comprehensive property (Property 5 below). Similarly, Properties 2 and 3 (savings formula and savings floor) are closely related and are combined into one property.

---

### Property 1: Optimized plan satisfies seat count and minimizes cost

*For any* tool in the Pricing Catalog and any seat count, the plan selected by `selectOptimizedPlan` shall be: (a) the cheapest plan whose `minSeats` is less than or equal to the seat count, and (b) among plans with equal cost, the one with the highest `minSeats`.

**Validates: Requirements 2.2**

---

### Property 2: Savings are non-negative and correctly computed

*For any* `ToolEntry` with a valid tool name in the catalog and any seat count, the computed savings shall equal `max(0, round(userMonthlyCost − (optimizedPlan.pricePerSeat × seats), 2))`. Savings shall never be negative.

**Validates: Requirements 2.3, 2.4**

---

### Property 3: Audit totals are consistent with per-tool results

*For any* list of `ToolEntry` values, the `totalSpend` returned by `compute()` shall equal `round(sum of all entry.monthlyCost values, 2)`, the `totalOptimizedSpend` shall equal `round(sum of all toolResult.optimizedMonthlyCost values, 2)`, and the `totalSavings` shall equal `round(sum of all toolResult.savings values, 2)`.

**Validates: Requirements 2.5, 2.6, 2.7**

---

### Property 4: Unknown tool produces zero savings

*For any* tool name that does not exist as a key in the Pricing Catalog, the `compute()` function shall return a `ToolAuditResult` for that entry with `savings = 0.00` and `optimizedPlanName` equal to the user's reported plan name.

**Validates: Requirements 2.8**

---

### Property 5: Seat count exceeding all plan thresholds produces zero savings

*For any* tool in the Pricing Catalog where the user's seat count exceeds the `minSeats` of every plan tier, the `selectOptimizedPlan` function shall return the plan with the highest `minSeats`, and the resulting `savings` shall be `0.00`.

**Validates: Requirements 2.9**

---

### Property 6: Pricing Catalog structural invariants

*For every* tool in the Pricing Catalog: (a) the tool has at least one plan tier, (b) every plan tier has `pricePerSeat >= 0` and `minSeats >= 1`, and (c) plan tier names are unique within each tool.

**Validates: Requirements 7.2, 7.3, 7.6**

---

### Property 7: Catalog reads are idempotent

*For any* tool name and seat count, calling `selectOptimizedPlan` twice with the same arguments shall return the same plan tier (same `name`, `pricePerSeat`, and `minSeats`).

**Validates: Requirements 7.5**

---

### Property 8: Form validation rejects invalid entries universally

*For any* `ToolEntry` where `seats < 1` or `monthlyCost < 0` or `toolName` is empty or `planType` is empty, the Zod validation schema shall return a failure result for that entry.

**Validates: Requirements 1.7, 1.8, 1.9, 1.10**

---

### Property 9: Open Graph metadata contains audit savings

*For any* `AuditRecord`, the `generateMetadata` function for the report page shall produce an `openGraph.title` or `openGraph.description` that contains the `total_savings` value formatted as a USD amount.

**Validates: Requirements 8.3**

---

## Testing Strategy

### Dual Testing Approach

Unit tests cover specific examples, edge cases, and integration points. Property-based tests verify universal properties across many generated inputs. Both are needed for comprehensive coverage.

### Property-Based Testing Library

Use **[fast-check](https://fast-check.dev/)** — the standard PBT library for TypeScript/JavaScript. Each property test runs a minimum of **100 iterations**.

```bash
npm install --save-dev fast-check vitest @vitest/coverage-v8
```

### Property Test Configuration

Each property test is tagged with a comment referencing the design property:

```ts
// Feature: ai-spend-auditor, Property 1: Optimized plan satisfies seat count and minimizes cost
test('selectOptimizedPlan returns cheapest eligible plan with tie-breaking', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(...Object.keys(PRICING_CATALOG)),
      fc.integer({ min: 1, max: 1000 }),
      (toolName, seats) => {
        const tool = PRICING_CATALOG[toolName]
        const selected = selectOptimizedPlan(tool, seats)
        const eligible = tool.plans.filter(p => p.minSeats <= seats)
        
        if (eligible.length === 0) {
          // fallback: highest minSeats
          const maxMinSeats = Math.max(...tool.plans.map(p => p.minSeats))
          expect(selected.minSeats).toBe(maxMinSeats)
        } else {
          const minPrice = Math.min(...eligible.map(p => p.pricePerSeat))
          expect(selected.pricePerSeat).toBe(minPrice)
          // tie-breaking: among cheapest, highest minSeats
          const cheapest = eligible.filter(p => p.pricePerSeat === minPrice)
          const maxMinSeatsAmongCheapest = Math.max(...cheapest.map(p => p.minSeats))
          expect(selected.minSeats).toBe(maxMinSeatsAmongCheapest)
        }
      }
    ),
    { numRuns: 100 }
  )
})
```

### Test File Structure

```
__tests__/
  unit/
    audit-engine.test.ts        # Property tests for Properties 1–5, 7
    pricing-catalog.test.ts     # Property tests for Property 6
    validations.test.ts         # Property test for Property 8
    report-metadata.test.ts     # Property test for Property 9
  integration/
    api-audit.test.ts           # Example-based tests for POST /api/audit
    api-email.test.ts           # Example-based tests for POST /api/email
    supabase.test.ts            # Mock-based tests for Supabase write/read
  e2e/
    audit-flow.test.ts          # Full form → report page flow (Playwright)
```

### Unit Test Coverage (Example-Based)

Key example-based tests to complement the property tests:

- **Audit form renders with 15 tool options** (Req 1.2)
- **Add Tool button disabled at 15 entries** (Req 1.12)
- **Remove button disabled at 1 entry** (Req 1.13)
- **POST /api/audit returns 500 when Supabase throws** (Req 3.3)
- **POST /api/audit redirects to /audit/[id] on success** (Req 3.4)
- **Report page renders not-found for unknown UUID** (Req 4.7, 8.4)
- **Report page renders error page on Supabase failure** (Req 4.9, 8.5)
- **Copy link button shows "Copied!" after click** (Req 4.8)
- **Email form disables after successful send** (Req 6.5)
- **Email form shows error and re-enables on Resend failure** (Req 6.6)
- **Duplicate email returns 409 with informational message** (Req 6.8)
- **Claude timeout results in empty summary, audit still saved** (Req 5.5)
- **Pricing Catalog has exactly 15 tools with exact name matches** (Req 7.1)

### Integration Test Notes

- Supabase calls are mocked using `vi.mock` in unit/integration tests.
- Anthropic and Resend clients are mocked in all non-e2e tests.
- E2E tests use a dedicated test Supabase project with a separate database.

### Running Tests

```bash
# Unit + integration (single run, no watch mode)
npx vitest run

# With coverage
npx vitest run --coverage

# E2E
npx playwright test
```
