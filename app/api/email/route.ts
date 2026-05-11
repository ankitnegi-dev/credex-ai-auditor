import { emailRequestSchema } from '@/lib/validations';
import { getAuditById, checkDuplicateEmail, insertAuditEmail } from '@/lib/supabase';
import { sendAuditReport } from '@/lib/resend';

export async function POST(request: Request) {
  // 1. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = emailRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: 'Validation failed',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { auditId, email } = parsed.data;

  // 2. Fetch audit record from Supabase
  let audit;
  try {
    audit = await getAuditById(auditId);
  } catch (err) {
    console.error('Supabase getAuditById failed:', err);
    return Response.json({ error: 'Failed to retrieve audit.' }, { status: 500 });
  }

  if (!audit) {
    return Response.json({ error: 'Audit not found.' }, { status: 404 });
  }

  // 3. Check for duplicate (auditId, email)
  let isDuplicate = false;
  try {
    isDuplicate = await checkDuplicateEmail(auditId, email);
  } catch (err) {
    console.error('Supabase checkDuplicateEmail failed:', err);
    return Response.json({ error: 'Failed to check email status.' }, { status: 500 });
  }

  if (isDuplicate) {
    return Response.json(
      { error: 'This report has already been sent to that email address.' },
      { status: 409 }
    );
  }

  // 4. Send email via Resend — do NOT persist if this fails
  const reportUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/audit/${auditId}`;
  try {
    await sendAuditReport(email, audit, reportUrl);
  } catch (err) {
    console.error('Resend sendAuditReport failed:', err);
    return Response.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }

  // 5. Persist the email address
  try {
    await insertAuditEmail(auditId, email);
  } catch (err) {
    console.error('Supabase insertAuditEmail failed:', err);
    // Email was sent but we couldn't record it — log and continue
    // The user got their email; this is a non-critical failure
  }

  return Response.json({ success: true }, { status: 200 });
}
