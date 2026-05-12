# Unit Economics: AI Spend Auditor

## Cost Per Audit

| Component | Cost per Audit | Notes |
|-----------|---------------|-------|
| Anthropic Claude API | ~$0.008 | claude-3-5-haiku, ~200 tokens output, $0.80/M output tokens |
| Supabase storage | ~$0.0001 | ~2KB per audit record, free tier covers 500MB (~250K audits) |
| Vercel hosting | $0 | Free tier: 100GB bandwidth, 6000 build minutes/month |
| Resend email | ~$0.001 | Free tier: 3,000 emails/month, then $0.80/1000 |
| **Total per audit** | **~$0.009** | Under 1 cent per audit |

## Revenue Model (Credex Lead Generation)

| Metric | Estimate | Reasoning |
|--------|----------|-----------|
| Audits per month (target) | 500 | Conservative for a free tool with community distribution |
| Email capture rate | 35–45% | Industry standard for free tools with clear value |
| Emails captured per month | 175–225 | Based on 500 audits × 40% capture rate |
| Lead-to-customer conversion | 3–5% | Standard SaaS free-to-paid conversion |
| Customers per month | 5–11 | From audit-generated leads |
| Revenue per customer (Credex) | $30–50/mo | Credex credit subscription value |
| **Monthly revenue potential** | **$150–550** | From audit-generated leads alone |

## Break-Even Analysis

- Monthly infrastructure cost at 500 audits: ~$4.50 (Claude API) + $0 (Vercel/Supabase free tier)
- Break-even: 1 converted customer covers ~3 months of API costs
- The tool is effectively free to run at this scale

## Scaling Economics

| Scale | Monthly Cost | Emails Captured | Est. Revenue |
|-------|-------------|-----------------|--------------|
| 500 audits/mo | ~$5 | ~200 | $150–550 |
| 5,000 audits/mo | ~$50 | ~2,000 | $1,500–5,500 |
| 50,000 audits/mo | ~$500 | ~20,000 | $15,000–55,000 |

The unit economics improve significantly at scale — infrastructure costs grow linearly while revenue potential grows with the email list.

## Key Insight
At $0.009 per audit, this tool can run 10,000 audits for under $90. The real value is not the tool itself but the email list of founders who have self-identified as AI tool buyers — a highly qualified lead pool for Credex.
