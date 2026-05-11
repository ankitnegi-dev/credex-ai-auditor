import { Resend } from 'resend';
import type { AuditRecord } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the audit report email via Resend.
 * Throws on Resend error so the caller can return HTTP 500
 * and avoid persisting the email address (Req 6.6).
 */
export async function sendAuditReport(
  email: string,
  audit: AuditRecord,
  reportUrl: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: 'AI Spend Auditor <reports@credex.ai>',
    to: email,
    subject: `Your AI Spend Audit — Save $${audit.total_savings.toFixed(2)}/month`,
    html: buildEmailHtml(audit, reportUrl),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildEmailHtml(audit: AuditRecord, reportUrl: string): string {
  const breakdownRows = audit.tool_results
    .map(
      (r) => `
      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb;">${r.toolName}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${r.userPlan}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${formatUSD(r.userMonthlyCost)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${r.optimizedPlanName}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${formatUSD(r.optimizedMonthlyCost)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;color:#16a34a;">${formatUSD(r.savings)}</td>
      </tr>`
    )
    .join('');

  const summarySection =
    audit.summary
      ? `<div style="margin:24px 0;padding:16px;background:#f0fdf4;border-radius:8px;">
           <h3 style="margin:0 0 8px;color:#15803d;">AI Summary</h3>
           <p style="margin:0;color:#374151;">${audit.summary}</p>
         </div>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Your AI Spend Audit</title></head>
<body style="font-family:sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#111827;">
  <h1 style="color:#111827;">Your AI Spend Audit Report</h1>
  <p style="color:#6b7280;font-size:14px;">Audit ID: ${audit.id}</p>

  <div style="display:flex;gap:16px;margin:24px 0;">
    <div style="flex:1;padding:16px;background:#f9fafb;border-radius:8px;text-align:center;">
      <div style="font-size:12px;color:#6b7280;text-transform:uppercase;">Current Spend</div>
      <div style="font-size:24px;font-weight:bold;color:#111827;">${formatUSD(audit.total_spend)}/mo</div>
    </div>
    <div style="flex:1;padding:16px;background:#f9fafb;border-radius:8px;text-align:center;">
      <div style="font-size:12px;color:#6b7280;text-transform:uppercase;">Optimized Spend</div>
      <div style="font-size:24px;font-weight:bold;color:#111827;">${formatUSD(audit.total_optimized_spend)}/mo</div>
    </div>
    <div style="flex:1;padding:16px;background:#f0fdf4;border-radius:8px;text-align:center;">
      <div style="font-size:12px;color:#16a34a;text-transform:uppercase;">Potential Savings</div>
      <div style="font-size:24px;font-weight:bold;color:#16a34a;">${formatUSD(audit.total_savings)}/mo</div>
    </div>
  </div>

  ${summarySection}

  <h2 style="margin-top:32px;">Per-Tool Breakdown</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr style="background:#f3f4f6;">
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Tool</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Current Plan</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Current Cost</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Optimized Plan</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Optimized Cost</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Savings</th>
      </tr>
    </thead>
    <tbody>${breakdownRows}</tbody>
  </table>

  <div style="margin-top:32px;text-align:center;">
    <a href="${reportUrl}"
       style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
      View Full Report
    </a>
  </div>

  <p style="margin-top:32px;font-size:12px;color:#9ca3af;text-align:center;">
    AI Spend Auditor · <a href="${reportUrl}" style="color:#6b7280;">${reportUrl}</a>
  </p>
</body>
</html>`;
}
