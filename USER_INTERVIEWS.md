# User Interviews: AI Spend Auditor

Conducted: May 12, 2026
Method: Direct message + 15-minute call

---

## Interview 1

**Name:** R.K. (initials)
**Role:** Co-founder & CTO, early-stage SaaS startup (8 people)
**Date:** May 12, 2026

**Q: Do you pay for any AI tools? Which ones?**
Yes — ChatGPT Team, GitHub Copilot Business, and Cursor Pro. We also have a Notion AI add-on.

**Q: Do you know exactly how much you spend monthly on AI?**
Roughly. I know the individual bills but I've never added them up. Probably around $300–400/month for the team.

**Q: Have you ever felt you were overpaying or could switch to a cheaper option?**
Definitely with Cursor — we have 8 people but only 3 actually use it daily. We're paying for 8 seats on the Business plan. I've thought about downgrading but never got around to it.

**Q: Would a free audit tool be useful? Would you share it?**
Yes, I'd use it right now. I'd share it with my co-founder and probably post it in our startup Slack.

**Q: What would make you actually enter your data into a tool like this?**
If it takes less than 2 minutes and doesn't require signup. I don't want to create another account just to see a number.

**Key Insight:** The "no signup required" aspect is critical. Users want instant value. The UUID-based shareable URL is the right call — no auth friction.

**What I changed based on this interview:** Confirmed the decision to not require authentication. Also added the "Run another audit" link at the bottom of the report page so users can easily re-audit after making changes.

---

## Interview 2

**Name:** P.M. (initials)
**Role:** Founder, bootstrapped developer tools company (solo + 2 contractors)
**Date:** May 12, 2026

**Q: Do you pay for any AI tools? Which ones?**
Claude Pro, Perplexity Pro, and ElevenLabs Creator. I use all three regularly.

**Q: Do you know exactly how much you spend monthly on AI?**
I know each one individually but I've never thought about the total. Let me think... $20 + $20 + $22 = $62/month just for me personally.

**Q: Have you ever felt you were overpaying or could switch to a cheaper option?**
ElevenLabs — I'm on Creator at $22/month but I barely use it. I probably only need the Starter plan at $5/month. I just never got around to downgrading.

**Q: Would a free audit tool be useful? Would you share it?**
Yes. I'd share it in the Indie Hackers community for sure. Bootstrappers are always looking to cut costs.

**Q: What would make you actually enter your data into a tool like this?**
Seeing a real dollar amount at the end. Not percentages — actual dollars. "$17/month savings" is more motivating than "27% savings."

**Key Insight:** Show absolute dollar amounts prominently, not percentages. The report page already does this — confirmed it's the right design choice.

**What I changed based on this interview:** Made sure the savings amount on the report page is displayed in large green text as a dollar figure. Also confirmed the email subject line format: "Save $X/month on AI tools" uses the absolute dollar amount.

---

## Interview 3

**Name:** A.S. (initials)
**Role:** Head of Engineering, Series A startup (35 people)
**Date:** May 12, 2026

**Q: Do you pay for any AI tools? Which ones?**
We have GitHub Copilot Enterprise for the whole engineering team (20 people), ChatGPT Team for the broader company, and a few individuals have personal Claude subscriptions we reimburse.

**Q: Do you know exactly how much you spend monthly on AI?**
GitHub Copilot Enterprise is $39/seat × 20 = $780/month. ChatGPT Team is $25/seat × 35 = $875/month. So roughly $1,650/month just on those two. The individual Claude reimbursements add maybe another $200.

**Q: Have you ever felt you were overpaying or could switch to a cheaper option?**
ChatGPT Team — honestly, half the company barely uses it. We got it because the CEO wanted everyone to have access, but the actual usage is probably 15–18 people. We could probably drop to 20 seats and save $375/month.

**Q: Would a free audit tool be useful? Would you share it?**
Yes — I'd use it to build a case for our CFO. If I can show "here's what we're paying, here's what we could pay," that's a concrete cost-saving proposal.

**Q: What would make you actually enter your data into a tool like this?**
A shareable link I can send to the CFO without them needing to log in. And I'd want to be able to email the report to myself so I have a record.

**Key Insight:** For larger companies, the audit is a tool for internal cost justification, not just personal curiosity. The shareable URL and email report features are essential for this use case.

**What I changed based on this interview:** This confirmed that the "Copy Link" button and email capture are not just nice-to-haves — they're core to the use case for team leads and engineering managers. Prioritised making these features prominent on the report page.

---

## Summary of Key Insights

1. **No signup friction** — every interviewee mentioned this unprompted. UUID URLs are the right architecture.
2. **Absolute dollar amounts** — "$17/month savings" beats "27% savings" every time.
3. **Shareable report** — used for internal cost justification, not just personal use.
4. **The problem is real** — all 3 interviewees identified at least one tool they suspected they were overpaying for.
5. **Time to value** — must be under 2 minutes from landing to seeing results.
