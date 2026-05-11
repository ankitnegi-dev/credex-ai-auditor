import type { ToolEntry, PlanTier, CatalogTool, ToolAuditResult, AuditResult } from './types';
import { PRICING_CATALOG } from './pricing-catalog';

/**
 * Rounds a number to 2 decimal places using Math.round to avoid floating-point drift.
 */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Selects the optimized plan for a given tool and seat count.
 *
 * Algorithm:
 * 1. Filter plans where minSeats <= seats (eligible plans)
 * 2. If no eligible plans, fall back to the plan with the highest minSeats
 * 3. Among eligible plans, find the minimum pricePerSeat
 * 4. Among cheapest eligible plans, pick the one with the highest minSeats (tie-breaking)
 */
export function selectOptimizedPlan(tool: CatalogTool, seats: number): PlanTier {
  const eligiblePlans = tool.plans.filter((plan) => plan.minSeats <= seats);

  if (eligiblePlans.length === 0) {
    // Fallback: return plan with highest minSeats (Req 2.9)
    return tool.plans.reduce((best, plan) =>
      plan.minSeats > best.minSeats ? plan : best
    );
  }

  // Find minimum price among eligible plans
  const minPrice = Math.min(...eligiblePlans.map((p) => p.pricePerSeat));

  // Filter to cheapest eligible plans
  const cheapestPlans = eligiblePlans.filter((p) => p.pricePerSeat === minPrice);

  if (cheapestPlans.length === 1) {
    return cheapestPlans[0];
  }

  // Tie-breaking: pick highest minSeats among cheapest (Req 2.2)
  return cheapestPlans.reduce((best, plan) =>
    plan.minSeats > best.minSeats ? plan : best
  );
}

/**
 * Computes the savings for a single tool entry against its optimized plan.
 */
export function computeToolSavings(
  entry: ToolEntry,
  optimizedPlan: PlanTier
): ToolAuditResult {
  const optimizedMonthlyCost = round2(optimizedPlan.pricePerSeat * entry.seats);
  const rawSavings = round2(entry.monthlyCost - optimizedMonthlyCost);
  const savings = Math.max(0, rawSavings); // floor at 0 per Req 2.4

  return {
    toolName: entry.toolName,
    userPlan: entry.planType,
    userMonthlyCost: entry.monthlyCost,
    optimizedPlanName: optimizedPlan.name,
    optimizedMonthlyCost,
    savings,
  };
}

/**
 * Runs the full audit computation over all tool entries.
 */
export function compute(entries: ToolEntry[]): AuditResult {
  const toolResults: ToolAuditResult[] = entries.map((entry) => {
    const catalogTool = PRICING_CATALOG[entry.toolName];

    if (!catalogTool) {
      // Unknown tool: savings = 0, optimized plan = user's reported plan (Req 2.8)
      return {
        toolName: entry.toolName,
        userPlan: entry.planType,
        userMonthlyCost: entry.monthlyCost,
        optimizedPlanName: entry.planType,
        optimizedMonthlyCost: entry.monthlyCost,
        savings: 0,
      };
    }

    const optimizedPlan = selectOptimizedPlan(catalogTool, entry.seats);
    return computeToolSavings(entry, optimizedPlan);
  });

  const totalSpend = round2(
    toolResults.reduce((sum, r) => sum + r.userMonthlyCost, 0)
  );
  const totalOptimizedSpend = round2(
    toolResults.reduce((sum, r) => sum + r.optimizedMonthlyCost, 0)
  );
  const totalSavings = round2(
    toolResults.reduce((sum, r) => sum + r.savings, 0)
  );

  return { toolResults, totalSpend, totalOptimizedSpend, totalSavings };
}
