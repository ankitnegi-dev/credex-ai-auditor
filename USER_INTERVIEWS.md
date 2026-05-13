# User Interviews: SpendLens - AI Spend Auditor

Conducted: May 13, 2026
Method: WhatsApp / direct message, 10-15 minutes each

---

## Interview 1

**Name:** Yashwanth S.
**Role:** Software Development Engineer
**Company:** Promptli Inc.
**Date:** May 13, 2026

**Tools and plans:**
- Claude Pro ($20/month)

**Q1: Which AI tools do you pay for and what plan?**
"Claude pro. 20 dollars."

**Q2: Do you know your exact monthly total across all tools?**
"Worth ig." (Implied he knows the cost and considers it worth it)

**Q3: Have you ever felt you were overpaying or could downgrade?**
"Free models might not think well." — He justifies staying on paid plans because free models don't meet his quality bar for professional work.

**Q4: Would a free audit tool be useful? Would you share it?**
Implied yes — engaged with the questions and provided his role/company when asked.

**Q5: What would stop you from entering your data into a tool like this?**
"Private data like .env keys, api keys and company specific data shouldn't be shared." — His concern is not about subscription cost data but about the tool potentially asking for sensitive technical credentials.

**Most surprising thing he said:**
His concern was not about financial privacy (which most users cite) but specifically about API keys and .env files. As an SDE, his mental model of "sensitive data" is technical credentials, not billing amounts. This is a different threat model than a non-technical founder would have.

**What it changed about the design:**
Added explicit copy to the form: "We only ask for tool name, plan, seats, and monthly cost - no API keys, no account access, no sensitive credentials." This directly addresses the concern Yashwanth raised and should reduce drop-off from technical users.

---

## Interview 2

**Name:** Anurag Chaubey
**Role:** AI Engineer
**Company:** Gutbut
**Date:** May 13, 2026

**Tools and plans:**
- ChatGPT Plus
- GitHub Copilot (development work)
- AI image/design tools (student/basic plans)

**Q1: Which AI tools do you pay for and what plan?**
"I currently use a few AI tools regularly for learning and productivity. The main ones are ChatGPT Plus for general assistance, coding help, and research, and sometimes tools like GitHub Copilot for development-related work. Most of the subscriptions I choose are monthly because they are easier to manage and flexible if my requirements change later."

**Q2: Do you know your exact monthly total across all tools?**
"Not exactly, but I usually have a rough idea of how much I spend every month on AI tools and subscriptions. Sometimes smaller subscriptions are easy to forget because they renew automatically. I generally estimate my spending instead of calculating the exact number."

**Q3: Have you ever felt you were overpaying or could downgrade?**
"Yes, I have felt that a few times, especially when I stopped actively using a tool but still continued paying for the subscription. Some AI tools look very useful initially, but after a while I may end up using only a small portion of their features."

**Q4: Would a free audit tool be useful? Would you share it?**
"Yes, I think a free audit tool for AI subscriptions would be genuinely useful, especially for students and professionals who use multiple tools regularly. Many people lose track of small recurring payments, so having everything organized in one dashboard would save both time and money. I would probably share a tool like this with friends or teammates if it provided clear insights, was easy to use, and actually helped reduce unnecessary spending."

**Q5: What would stop you from entering your data into a tool like this?**
"The biggest concern would be privacy and security of personal financial data. Before using a tool like this, I would want to know how securely the information is stored and whether the data is shared with third parties or not. Trust plays a very important role, so clear transparency, secure authentication, and a simple explanation of how the data is used would make me feel more comfortable using it."

**Most surprising thing he said:**
He mentioned that "smaller subscriptions are easy to forget because they renew automatically." This confirmed that the problem is not just overpaying on big tools - it's the accumulation of small forgotten subscriptions. The audit tool's value is as much about surfacing forgotten spend as it is about finding cheaper plans.

**What it changed about the design:**
This reinforced the decision to show a "total monthly spend" figure prominently at the top of the results page. Seeing the aggregate number ($X/month across all tools) is often more impactful than the per-tool breakdown. Also added a note in the form: "Include tools you might have forgotten about."

---

## Interview 3

**Name:** Sachin Yadav
**Role:** AI Engineer
**Company:** Gutbut
**Date:** May 13, 2026

**Tools and plans:**
- Claude Pro (personally paying)
- ChatGPT Go (student access, not paying)
- GitHub Copilot Pro (student access, not paying)

**Q1: Which AI tools do you pay for and what plan?**
"I currently use Claude Pro, ChatGPT Go, and GitHub Copilot Pro. Out of these, I personally pay for Claude Pro. I received the student versions/access for ChatGPT Go and GitHub Copilot Pro, so I do not currently pay separately for those. I mainly use these tools for coding, interview preparation, debugging, learning new concepts, brainstorming ideas, and improving productivity."

**Q2: Do you know your exact monthly total across all tools?**
"Since I only actively pay for Claude Pro right now, I generally know my monthly spending. However, if I had to pay for all three subscriptions myself, I think it would become much harder to keep track of the total cost over time because subscription payments are easy to ignore once they become recurring."

**Q3: Have you ever felt you were overpaying or could downgrade?**
"Yes, sometimes. There are days where I use Claude heavily and feel that the subscription is absolutely worth it because it saves time and helps me work more efficiently. But there are also periods where I feel like I am not fully utilizing the subscription and could probably manage with a cheaper plan or less usage. I think this feeling is common with AI tools because their value is not always measured by daily usage. Sometimes a single important use case - like solving a difficult coding issue, preparing for interviews, or learning something quickly - can make the subscription feel valuable again."

**Q4: Would a free audit tool be useful? Would you share it?**
"Yes, I think a free audit tool would be genuinely useful, especially for people who use multiple AI subscriptions. A tool that could track AI subscription spending, compare usage across platforms, identify underused subscriptions, and suggest possible downgrades would help users make smarter decisions. I would also be willing to share such a tool with others if it was simple, trustworthy, and actually provided useful insights."

**Q5: What would stop you from entering your data into a tool like this?**
"The biggest concern would be privacy and trust. I would hesitate if the tool asked for sensitive financial information or direct access to banking/payment accounts. I would feel more comfortable using it if manual input was allowed, the privacy policy was transparent, minimal personal data was collected, and the platform clearly explained how user data would be stored and used. For a tool dealing with spending data, trust and transparency would be the most important factors."

**Most surprising thing he said:**
"Sometimes a single important use case - like solving a difficult coding issue, preparing for interviews, or learning something quickly - can make the subscription feel valuable again." This was unexpected. He is not evaluating his subscription on average daily value but on peak value moments. This means the audit tool should not just show savings - it should also validate when a subscription IS worth keeping, to build trust with the user.

**What it changed about the design:**
Added the "You're spending well" message for tools where the user is already on the optimal plan. Rather than manufacturing savings where there are none, SpendLens now explicitly tells users when they are making smart choices. This builds credibility and makes the savings recommendations more trustworthy when they do appear.

---

## Cross-Interview Insights

1. **Privacy concern is universal but the threat model differs** - Technical users (Yashwanth) worry about API keys; non-technical users worry about financial data sharing. The solution is the same: manual input only, no account access required.

2. **The forgotten subscription problem is real** - Anurag confirmed that small recurring payments are easy to forget. The aggregate total is as valuable as the per-tool breakdown.

3. **Peak value justifies subscriptions, not average usage** - Sachin's insight about single high-value use cases means the tool should validate good spending decisions, not just find savings. This led to the "You're spending well" message for already-optimal plans.

4. **Student/free tier users are a significant segment** - Sachin has access to tools through student programs. This suggests a future feature: showing users what they would pay at retail vs. what they currently pay, to help them understand the value of their student access before it expires.

5. **Sharing requires trust + clear value** - All three interviewees said they would share the tool only if it was simple, trustworthy, and provided clear insights. This validated the decision to show results immediately without requiring signup.
