import Anthropic from '@anthropic-ai/sdk';
import type { AuditResult } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Generates a ~100-word personalized audit summary using Claude.
 * Returns an empty string on any failure (timeout, API error, etc.)
 * so the audit result is never blocked by Claude availability.
 */
export async function generateAuditSummary(result: AuditResult): Promise<string> {
  const prompt = buildPrompt(result);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const message = await client.messages.create(
      {
        model: 'claude-haiku-4-5',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      },
      { signal: controller.signal }
    );

    return extractText(message);
  } catch {
    // Graceful degradation per Req 5.5 — never block the audit result
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function buildPrompt(result: AuditResult): string {
  const breakdown = result.toolResults
    .map(
      (r) =>
        `- ${r.toolName}: currently paying $${r.userMonthlyCost}/mo, optimized cost $${r.optimizedMonthlyCost}/mo, savings $${r.savings}/mo`
    )
    .join('\n');

  return `You are an AI spending advisor. Write a personalized audit summary for a startup founder.
Keep it between 90 and 110 words. Write in second person (use "you" and "your").
Focus on the biggest savings opportunities and give a clear call to action.

Audit data:
- Total monthly spend: $${result.totalSpend}
- Total optimized spend: $${result.totalOptimizedSpend}
- Total potential savings: $${result.totalSavings}/month

Per-tool breakdown:
${breakdown}

Write the summary now:`;
}

function extractText(message: Anthropic.Message): string {
  const block = message.content[0];
  if (block?.type === 'text') {
    return block.text;
  }
  return '';
}
