# LLM Prompts: AI Spend Auditor

## Claude Audit Summary Prompt

### The prompt used in production (`lib/claude.ts`)

```
You are an AI spending advisor. Write a personalized audit summary for a startup founder.
Keep it between 90 and 110 words. Write in second person (use "you" and "your").
Focus on the biggest savings opportunities and give a clear call to action.

Audit data:
- Total monthly spend: $${result.totalSpend}
- Total optimized spend: $${result.totalOptimizedSpend}
- Total potential savings: $${result.totalSavings}/month

Per-tool breakdown:
${breakdown}

Write the summary now:
```

### Why I wrote it this way

**Second person ("you/your"):** Makes the summary feel personal and actionable, not like a generic report. Users are more likely to act on advice addressed directly to them.

**90–110 word constraint:** Long enough to be substantive, short enough to be read in 20 seconds. The constraint forces the model to prioritize the most impactful savings rather than padding with generic advice.

**"Clear call to action" instruction:** Without this, Claude tends to end summaries with vague observations. The explicit instruction produces endings like "Switch Cursor to Hobby for solo use and downgrade ChatGPT to Plus — you'll save $X this month."

**Structured data in the prompt:** I pass the exact numbers (totalSpend, totalOptimizedSpend, totalSavings) and per-tool breakdown rather than asking Claude to infer from raw input. This prevents hallucinated numbers and keeps the summary grounded in the actual audit results.

### What I tried that didn't work

**Attempt 1 — asking for bullet points:**
```
Write a 5-bullet summary of savings opportunities...
```
Result: Too listy, felt like a spreadsheet not a summary. Removed.

**Attempt 2 — no word count constraint:**
```
Write a personalized summary paragraph...
```
Result: Claude wrote 200–300 word essays. Users don't read that. Added the 90–110 word constraint.

**Attempt 3 — asking for "actionable recommendations":**
```
...give 3 actionable recommendations...
```
Result: Claude numbered the recommendations, which broke the paragraph format needed for the UI. Switched to "clear call to action" which produces flowing prose.

### Fallback behavior

If the Claude API call fails or times out (30-second timeout via `AbortController`), the summary field is stored as an empty string `""` in Supabase. The report page conditionally renders the summary section — if `audit.summary` is empty, the section is hidden entirely. The audit result is never blocked by Claude availability.

### Model choice

`claude-haiku-4-5` — fastest and cheapest Claude model. At ~200 output tokens per summary, cost is approximately $0.008 per audit. The quality is sufficient for 100-word summaries; using Sonnet or Opus would be 5–10x more expensive with no meaningful quality improvement for this use case.
