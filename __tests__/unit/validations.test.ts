import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { toolEntrySchema, auditRequestSchema, emailRequestSchema } from '../../lib/validations';

describe('Validations', () => {
  /**
   * Property 8: Form validation rejects invalid entries universally
   * Validates: Requirements 1.7, 1.8, 1.9, 1.10
   */
  describe('Property 8: Form validation rejects invalid entries', () => {
    it('rejects entries with seats < 1', () => {
      fc.assert(
        fc.property(
          fc.record({
            toolName: fc.string({ minLength: 1 }),
            planType: fc.string({ minLength: 1 }),
            seats: fc.integer({ max: 0 }),
            monthlyCost: fc.float({ min: 0, noNaN: true }),
          }),
          (entry) => {
            const result = toolEntrySchema.safeParse(entry);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects entries with monthlyCost < 0', () => {
      fc.assert(
        fc.property(
          fc.record({
            toolName: fc.string({ minLength: 1 }),
            planType: fc.string({ minLength: 1 }),
            seats: fc.integer({ min: 1 }),
            monthlyCost: fc.float({ max: Math.fround(-0.001), noNaN: true }),
          }),
          (entry) => {
            const result = toolEntrySchema.safeParse(entry);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects entries with empty toolName', () => {
      fc.assert(
        fc.property(
          fc.record({
            toolName: fc.constant(''),
            planType: fc.string({ minLength: 1 }),
            seats: fc.integer({ min: 1 }),
            monthlyCost: fc.float({ min: 0, noNaN: true }),
          }),
          (entry) => {
            const result = toolEntrySchema.safeParse(entry);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('rejects entries with empty planType', () => {
      fc.assert(
        fc.property(
          fc.record({
            toolName: fc.string({ minLength: 1 }),
            planType: fc.constant(''),
            seats: fc.integer({ min: 1 }),
            monthlyCost: fc.float({ min: 0, noNaN: true }),
          }),
          (entry) => {
            const result = toolEntrySchema.safeParse(entry);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('accepts valid entries', () => {
      fc.assert(
        fc.property(
          fc.record({
            toolName: fc.string({ minLength: 1 }),
            planType: fc.string({ minLength: 1 }),
            seats: fc.integer({ min: 1, max: 1000 }),
            monthlyCost: fc.float({ min: 0, max: 10000, noNaN: true }),
          }),
          (entry) => {
            const result = toolEntrySchema.safeParse(entry);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('auditRequestSchema', () => {
    it('rejects empty entries array', () => {
      const result = auditRequestSchema.safeParse({ entries: [] });
      expect(result.success).toBe(false);
    });

    it('rejects more than 15 entries', () => {
      const entries = Array.from({ length: 16 }, () => ({
        toolName: 'ChatGPT',
        planType: 'Pro',
        seats: 1,
        monthlyCost: 20,
      }));
      const result = auditRequestSchema.safeParse({ entries });
      expect(result.success).toBe(false);
    });

    it('accepts 1 to 15 valid entries', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 15 }),
          (count) => {
            const entries = Array.from({ length: count }, () => ({
              toolName: 'ChatGPT',
              planType: 'Pro',
              seats: 5,
              monthlyCost: 100,
            }));
            const result = auditRequestSchema.safeParse({ entries });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('emailRequestSchema', () => {
    it('rejects invalid email addresses', () => {
      const invalidEmails = ['notanemail', 'missing@', '@nodomain', '', 'spaces in@email.com'];
      for (const email of invalidEmails) {
        const result = emailRequestSchema.safeParse({
          auditId: '550e8400-e29b-41d4-a716-446655440000',
          email,
        });
        expect(result.success).toBe(false);
      }
    });

    it('rejects invalid UUID format for auditId', () => {
      const result = emailRequestSchema.safeParse({
        auditId: 'not-a-uuid',
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid UUID and email', () => {
      const result = emailRequestSchema.safeParse({
        auditId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'founder@startup.com',
      });
      expect(result.success).toBe(true);
    });
  });
});
