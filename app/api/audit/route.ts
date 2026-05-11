import { redirect } from 'next/navigation';
import { auditRequestSchema } from '@/lib/validations';
import { compute } from '@/lib/audit-engine';
import { insertAudit, updateAuditSummary } from '@/lib/supabase';
import { generateAuditSummary } from '@/lib/claude';

export async function POST(request: Request) {
  // 1. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = auditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: 'Validation failed',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // 2. Run the Audit Engine
  const auditResult = compute(parsed.data.entries);

  // 3. Generate a UUID for this audit
  const auditId = crypto.randomUUID();

  // 4. Write audit record to Supabase
  try {
    await insertAudit({
      id: auditId,
      tool_results: auditResult.toolResults,
      total_spend: auditResult.totalSpend,
      total_optimized_spend: auditResult.totalOptimizedSpend,
      total_savings: auditResult.totalSavings,
      summary: '',
    });
  } catch (err) {
    console.error('Supabase insertAudit failed:', err);
    return Response.json(
      { error: 'Failed to save audit. Please try again.' },
      { status: 500 }
    );
  }

  // 5. Generate Claude summary (non-blocking on failure)
  let summary = '';
  try {
    summary = await generateAuditSummary(auditResult);
  } catch {
    // generateAuditSummary already catches internally and returns ""
    // This outer catch is a safety net
    summary = '';
  }

  // 6. Update summary in Supabase (log failure, continue)
  if (summary) {
    try {
      await updateAuditSummary(auditId, summary);
    } catch (err) {
      console.error('Supabase updateAuditSummary failed:', err);
      // Non-blocking — continue to redirect
    }
  }

  // 7. Redirect to the report page — MUST be outside try/catch per Next.js 16
  redirect(`/audit/${auditId}`);
}
