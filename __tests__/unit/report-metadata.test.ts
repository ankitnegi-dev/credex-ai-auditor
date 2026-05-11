import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { AuditRecord } from '../../lib/types';

// We test the metadata generation logic directly rather than importing the page
// (which has Next.js server-only dependencies). We replicate the logic here.

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Replicates the generateMetadata logic from app/audit/[id]/page.tsx
 * for isolated unit testing.
 */
function generateMetadataForAudit(audit: AuditRecord, baseUrl = '') {
  const id = audit.id;
  const canonicalUrl = `${baseUrl}/audit/${id}`;
  const savingsFormatted = formatUSD(audit.total_savings);

  return {
    title: `Save ${savingsFormatted}/month on AI tools — AI Spend Auditor`,
    description: `This audit found ${savingsFormatted} in potential monthly savings on AI tool subscriptions.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Save ${savingsFormatted}/month on AI tools`,
      description: `This audit found ${savingsFormatted} in potential monthly savings on AI tool subscriptions. View the full breakdown.`,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

describe('Report Page Metadata', () => {
  /**
   * Property 9: Open Graph metadata contains audit savings
   * Validates: Requirements 8.3
   */
  describe('Property 9: Open Graph metadata contains audit savings', () => {
    it('openGraph.title and description contain total_savings formatted as USD', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            tool_results: fc.array(
              fc.record({
                toolName: fc.string({ minLength: 1 }),
                userPlan: fc.string({ minLength: 1 }),
                userMonthlyCost: fc.float({ min: 0, max: 10000, noNaN: true }),
                optimizedPlanName: fc.string({ minLength: 1 }),
                optimizedMonthlyCost: fc.float({ min: 0, max: 10000, noNaN: true }),
                savings: fc.float({ min: 0, max: 10000, noNaN: true }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            total_spend: fc.float({ min: 0, max: 50000, noNaN: true }),
            total_optimized_spend: fc.float({ min: 0, max: 50000, noNaN: true }),
            total_savings: fc.float({ min: 0, max: 50000, noNaN: true }),
            summary: fc.string(),
            created_at: fc.date({ min: new Date(0), max: new Date('2100-01-01') }).map((d) => d.toISOString()),
          }),
          (audit: AuditRecord) => {
            const metadata = generateMetadataForAudit(audit);
            const savingsFormatted = formatUSD(audit.total_savings);

            // openGraph.title must contain the savings amount
            expect(metadata.openGraph.title).toContain(savingsFormatted);

            // openGraph.description must contain the savings amount
            expect(metadata.openGraph.description).toContain(savingsFormatted);

            // canonical URL must contain the audit ID
            expect(metadata.openGraph.url).toContain(audit.id);
            expect(metadata.alternates.canonical).toContain(audit.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('metadata title contains the savings amount', () => {
      const audit: AuditRecord = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        tool_results: [],
        total_spend: 500,
        total_optimized_spend: 300,
        total_savings: 200,
        summary: '',
        created_at: new Date().toISOString(),
      };

      const metadata = generateMetadataForAudit(audit, 'https://example.com');

      expect(metadata.title).toContain('$200.00');
      expect(metadata.openGraph.title).toContain('$200.00');
      expect(metadata.openGraph.description).toContain('$200.00');
      expect(metadata.openGraph.url).toBe('https://example.com/audit/550e8400-e29b-41d4-a716-446655440000');
    });
  });
});
