import { z } from 'zod';

// Zod schema for a single tool entry in the audit form
export const toolEntrySchema = z.object({
  toolName: z.string().min(1, 'Tool name is required'),
  planType: z.string().min(1, 'Plan type is required'),
  seats: z.number().int().min(1, 'Seats must be at least 1'),
  monthlyCost: z.number().min(0, 'Monthly cost must be non-negative'),
});

// Zod schema for the audit request (POST /api/audit)
export const auditRequestSchema = z.object({
  entries: z.array(toolEntrySchema)
    .min(1, 'At least one tool entry is required')
    .max(15, 'Maximum 15 tool entries allowed'),
});

// Zod schema for the email request (POST /api/email)
export const emailRequestSchema = z.object({
  auditId: z.string().uuid('Invalid audit ID format'),
  email: z.string().email('Invalid email address'),
});

// Type exports for convenience
export type ToolEntryInput = z.infer<typeof toolEntrySchema>;
export type AuditRequestInput = z.infer<typeof auditRequestSchema>;
export type EmailRequestInput = z.infer<typeof emailRequestSchema>;
