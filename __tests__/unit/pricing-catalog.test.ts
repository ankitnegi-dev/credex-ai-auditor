import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { PRICING_CATALOG } from '../../lib/pricing-catalog';
import { selectOptimizedPlan } from '../../lib/audit-engine';

const catalogKeys = Object.keys(PRICING_CATALOG);

describe('Pricing Catalog', () => {
  /**
   * Property 6: Pricing Catalog structural invariants
   * Validates: Requirements 7.2, 7.3, 7.6
   */
  describe('Property 6: Structural invariants', () => {
    it('every tool has at least one plan', () => {
      for (const [toolName, tool] of Object.entries(PRICING_CATALOG)) {
        expect(tool.plans.length, `${toolName} should have at least one plan`).toBeGreaterThanOrEqual(1);
      }
    });

    it('every plan has pricePerSeat >= 0 and minSeats >= 1', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...catalogKeys),
          (toolName) => {
            const tool = PRICING_CATALOG[toolName];
            for (const plan of tool.plans) {
              expect(plan.pricePerSeat).toBeGreaterThanOrEqual(0);
              expect(plan.minSeats).toBeGreaterThanOrEqual(1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('plan names are unique within each tool', () => {
      for (const [toolName, tool] of Object.entries(PRICING_CATALOG)) {
        const names = tool.plans.map((p) => p.name);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size, `${toolName} has duplicate plan names`).toBe(names.length);
      }
    });

    it('all 15 required tools are present', () => {
      const requiredTools = [
        'ChatGPT', 'Claude', 'Cursor', 'GitHub Copilot', 'Midjourney',
        'Gemini', 'Perplexity', 'Notion AI', 'Grammarly', 'Jasper',
        'Copy.ai', 'Runway', 'ElevenLabs', 'Synthesia', 'Otter.ai',
      ];
      for (const tool of requiredTools) {
        expect(PRICING_CATALOG[tool], `${tool} should be in catalog`).toBeDefined();
      }
    });
  });

  /**
   * Property 7: Catalog reads are idempotent
   * Validates: Requirements 7.5
   */
  describe('Property 7: Catalog reads are idempotent', () => {
    it('selectOptimizedPlan returns the same result for the same inputs', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...catalogKeys),
          fc.integer({ min: 1, max: 1000 }),
          (toolName, seats) => {
            const tool = PRICING_CATALOG[toolName];
            const result1 = selectOptimizedPlan(tool, seats);
            const result2 = selectOptimizedPlan(tool, seats);

            expect(result1.name).toBe(result2.name);
            expect(result1.pricePerSeat).toBe(result2.pricePerSeat);
            expect(result1.minSeats).toBe(result2.minSeats);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
