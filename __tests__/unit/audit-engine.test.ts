import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { PRICING_CATALOG } from '../../lib/pricing-catalog';
import { selectOptimizedPlan, computeToolSavings, compute } from '../../lib/audit-engine';
import type { ToolEntry } from '../../lib/types';

const catalogKeys = Object.keys(PRICING_CATALOG) as Array<keyof typeof PRICING_CATALOG>;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

describe('Audit Engine', () => {
  /**
   * Property 1: Optimized plan satisfies seat count and minimizes cost
   * Validates: Requirements 2.2
   */
  describe('Property 1: Optimized plan selection', () => {
    it('selects the cheapest eligible plan with tie-breaking by highest minSeats', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...catalogKeys),
          fc.integer({ min: 1, max: 1000 }),
          (toolName, seats) => {
            const tool = PRICING_CATALOG[toolName];
            const selected = selectOptimizedPlan(tool, seats);

            const eligiblePlans = tool.plans.filter((p) => p.minSeats <= seats);

            if (eligiblePlans.length > 0) {
              // Selected plan must be eligible
              expect(selected.minSeats).toBeLessThanOrEqual(seats);

              // Selected plan must have the minimum price among eligible plans
              const minPrice = Math.min(...eligiblePlans.map((p) => p.pricePerSeat));
              expect(selected.pricePerSeat).toBe(minPrice);

              // Among cheapest, must have highest minSeats
              const cheapestPlans = eligiblePlans.filter((p) => p.pricePerSeat === minPrice);
              const maxMinSeats = Math.max(...cheapestPlans.map((p) => p.minSeats));
              expect(selected.minSeats).toBe(maxMinSeats);
            } else {
              // Fallback: must be the plan with highest minSeats
              const maxMinSeats = Math.max(...tool.plans.map((p) => p.minSeats));
              expect(selected.minSeats).toBe(maxMinSeats);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Savings are non-negative and correctly computed
   * Validates: Requirements 2.3, 2.4
   */
  describe('Property 2: Savings computation', () => {
    it('savings equal max(0, round(userMonthlyCost - optimizedCost, 2)) and are never negative', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...catalogKeys),
          fc.integer({ min: 1, max: 1000 }),
          fc.float({ min: 0, max: 10000, noNaN: true }),
          (toolName, seats, monthlyCost) => {
            const tool = PRICING_CATALOG[toolName];
            const optimizedPlan = selectOptimizedPlan(tool, seats);

            const entry: ToolEntry = {
              toolName,
              planType: 'Pro',
              seats,
              monthlyCost: round2(monthlyCost),
            };

            const result = computeToolSavings(entry, optimizedPlan);

            const expectedOptimizedCost = round2(optimizedPlan.pricePerSeat * seats);
            const expectedSavings = Math.max(0, round2(entry.monthlyCost - expectedOptimizedCost));

            expect(result.savings).toBeGreaterThanOrEqual(0);
            expect(result.savings).toBe(expectedSavings);
            expect(result.optimizedMonthlyCost).toBe(expectedOptimizedCost);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Audit totals are consistent with per-tool results
   * Validates: Requirements 2.5, 2.6, 2.7
   */
  describe('Property 3: Audit totals consistency', () => {
    it('totalSpend, totalOptimizedSpend, and totalSavings equal rounded sums of per-tool values', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              toolName: fc.constantFrom(...catalogKeys),
              planType: fc.constantFrom('Free', 'Pro', 'Team', 'Enterprise'),
              seats: fc.integer({ min: 1, max: 500 }),
              monthlyCost: fc.float({ min: 0, max: 5000, noNaN: true }).map(round2),
            }),
            { minLength: 1, maxLength: 15 }
          ),
          (entries: ToolEntry[]) => {
            const result = compute(entries);

            const expectedTotalSpend = round2(
              result.toolResults.reduce((sum, r) => sum + r.userMonthlyCost, 0)
            );
            const expectedTotalOptimizedSpend = round2(
              result.toolResults.reduce((sum, r) => sum + r.optimizedMonthlyCost, 0)
            );
            const expectedTotalSavings = round2(
              result.toolResults.reduce((sum, r) => sum + r.savings, 0)
            );

            expect(result.totalSpend).toBe(expectedTotalSpend);
            expect(result.totalOptimizedSpend).toBe(expectedTotalOptimizedSpend);
            expect(result.totalSavings).toBe(expectedTotalSavings);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Unknown tool produces zero savings
   * Validates: Requirements 2.8
   */
  describe('Property 4: Unknown tool handling', () => {
    it('unknown tool name produces savings=0 and optimizedPlanName=user plan', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter((s) => !(s in PRICING_CATALOG)),
          fc.constantFrom('Free', 'Pro', 'Team', 'Enterprise'),
          fc.integer({ min: 1, max: 500 }),
          fc.float({ min: 0, max: 5000, noNaN: true }).map(round2),
          (toolName, planType, seats, monthlyCost) => {
            const entries: ToolEntry[] = [{ toolName, planType, seats, monthlyCost }];
            const result = compute(entries);
            const toolResult = result.toolResults[0];

            expect(toolResult.savings).toBe(0);
            expect(toolResult.optimizedPlanName).toBe(planType);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Seat count exceeding all plan thresholds produces fallback plan
   * Validates: Requirements 2.9
   */
  describe('Property 5: Seat count exceeding all thresholds', () => {
    it('returns the plan with highest minSeats as fallback when no plan is eligible', () => {
      for (const toolName of catalogKeys) {
        const tool = PRICING_CATALOG[toolName];
        const maxMinSeats = Math.max(...tool.plans.map((p) => p.minSeats));

        // Use a seat count that is less than the highest minSeats to force fallback
        // (only if there's a plan with minSeats > 1)
        const plansWithHighThreshold = tool.plans.filter((p) => p.minSeats > 1);
        if (plansWithHighThreshold.length === 0) continue;

        // Find a seat count where NO plan is eligible (seats < min of all minSeats)
        const minOfAllMinSeats = Math.min(...tool.plans.map((p) => p.minSeats));
        if (minOfAllMinSeats <= 1) continue; // all plans eligible for seats=1

        // seats = 0 would be invalid, so we test with seats < minOfAllMinSeats
        // This scenario only applies when minOfAllMinSeats > 1
        const seats = minOfAllMinSeats - 1;
        if (seats < 1) continue;

        const selected = selectOptimizedPlan(tool, seats);
        expect(selected.minSeats).toBe(maxMinSeats);
      }
    });

    it('for any tool, selectOptimizedPlan always returns a valid plan', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...catalogKeys),
          fc.integer({ min: 1, max: 10000 }),
          (toolName, seats) => {
            const tool = PRICING_CATALOG[toolName];
            const selected = selectOptimizedPlan(tool, seats);

            // Must return one of the tool's plans
            const planNames = tool.plans.map((p) => p.name);
            expect(planNames).toContain(selected.name);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
