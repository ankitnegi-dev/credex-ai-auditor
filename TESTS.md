# Test Results: AI Spend Auditor

## Test Framework
Vitest + fast-check (property-based testing)

## Running Tests
```bash
npx vitest run
```

## Results Summary
- **4 test files, 24 tests — all passing**
- Run time: ~4.65s

---

## Unit Tests

### 1. Pricing Catalog Structural Invariants
**File:** `__tests__/unit/pricing-catalog.test.ts`

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Every tool has at least one plan | All 15 tools have ≥1 plan | All 15 tools pass | ✅ PASS |
| Every plan has pricePerSeat ≥ 0 and minSeats ≥ 1 | No negative prices or zero seats | All plans valid | ✅ PASS |
| Plan names are unique within each tool | No duplicate plan names per tool | No duplicates found | ✅ PASS |
| All 15 required tools are present | 15 tools in catalog | 15 tools confirmed | ✅ PASS |
| Catalog reads are idempotent (100 runs) | Same plan returned for same inputs | Consistent results | ✅ PASS |

### 2. Audit Engine Logic
**File:** `__tests__/unit/audit-engine.test.ts`

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Optimized plan selection (100 runs) | Cheapest eligible plan, tie-break by highest minSeats | Correct plan selected | ✅ PASS |
| Savings computation (100 runs) | savings = max(0, round(userCost - optimizedCost, 2)) | Correct, never negative | ✅ PASS |
| Audit totals consistency (100 runs) | totalSpend/totalOptimizedSpend/totalSavings = rounded sums | Totals match | ✅ PASS |
| Unknown tool produces zero savings (100 runs) | savings=0, optimizedPlanName=userPlan | Correct fallback | ✅ PASS |
| Seat count exceeding all thresholds | Returns plan with highest minSeats | Correct fallback plan | ✅ PASS |
| selectOptimizedPlan always returns valid plan (100 runs) | Plan exists in tool's plan list | Always valid | ✅ PASS |

### 3. Validation Schemas
**File:** `__tests__/unit/validations.test.ts`

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Rejects seats < 1 (100 runs) | safeParse returns success: false | Correctly rejected | ✅ PASS |
| Rejects monthlyCost < 0 (100 runs) | safeParse returns success: false | Correctly rejected | ✅ PASS |
| Rejects empty toolName (20 runs) | safeParse returns success: false | Correctly rejected | ✅ PASS |
| Rejects empty planType (20 runs) | safeParse returns success: false | Correctly rejected | ✅ PASS |
| Accepts valid entries (100 runs) | safeParse returns success: true | All valid entries pass | ✅ PASS |
| Rejects empty entries array | success: false | Correctly rejected | ✅ PASS |
| Rejects >15 entries | success: false | Correctly rejected | ✅ PASS |
| Accepts 1–15 valid entries (15 runs) | success: true | All pass | ✅ PASS |
| Rejects invalid email addresses | success: false | All 5 invalid emails rejected | ✅ PASS |
| Rejects invalid UUID format | success: false | Correctly rejected | ✅ PASS |
| Accepts valid UUID and email | success: true | Passes | ✅ PASS |

### 4. Report Page Metadata
**File:** `__tests__/unit/report-metadata.test.ts`

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| OG metadata contains savings (100 runs) | openGraph.title and description contain USD-formatted savings | Correct for all inputs | ✅ PASS |
| Metadata title contains savings amount | title contains "$200.00" for $200 savings | "$200.00" present | ✅ PASS |

---

## Edge Cases Verified Manually

1. **User on Team plan with 1 seat** — flagged as overpaying, savings calculated correctly
2. **Savings calculation accurate to 2 decimal places** — Math.round(value * 100) / 100 used throughout
3. **Tool with no cheaper alternative** — savings returns 0.00, not negative
4. **Zero monthly cost input** — handled without crash, savings = 0
5. **Multi-tool audit totals** — sum of per-tool values matches reported totals
