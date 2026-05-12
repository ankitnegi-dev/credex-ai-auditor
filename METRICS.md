# Success Metrics: AI Spend Auditor

## Primary Metric
**Audits completed per week**

This is the north star metric. Every other metric is downstream of this. If founders are completing audits, the tool is delivering value and generating leads.

Target: 25 audits/week by end of Week 4

## Secondary Metric
**Email capture rate**

Of all completed audits, what percentage of users submit their email to receive the report.

Target: >35% capture rate

## Supporting Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Audit completion rate | >70% | Users who start the form should finish it |
| Share rate | >15% | Viral coefficient — each shared audit URL can bring new users |
| Return visit rate | >10% | Users revisiting their audit URL (sharing with team) |
| Claude summary display rate | >95% | API reliability — summary should appear on almost every audit |
| Email delivery rate | >98% | Resend reliability check |
| Time to complete audit | <2 min | UX quality signal |

## Anti-Metrics (Things We Don't Optimise For)
- Page views (vanity metric — we want completions, not visits)
- Social media followers (not directly tied to lead generation)
- Time on site (we want fast, efficient audits — not engagement farming)

## Measurement
- Supabase `audits` table row count → audits completed
- `audit_emails` table row count / `audits` row count → email capture rate
- Audit URL visits tracked via Vercel Analytics (free tier)

## Week-by-Week Targets

| Week | Audits | Emails Captured | Notes |
|------|--------|-----------------|-------|
| Week 1 | 15–25 | 6–10 | Community seeding |
| Week 2 | 30–50 | 12–20 | Product Hunt launch |
| Week 3 | 20–30 | 8–12 | Direct outreach |
| Week 4 | 15–25 | 6–10 | Content + referral |
| **Total** | **80–130** | **32–52** | **Target: 100 audits** |
