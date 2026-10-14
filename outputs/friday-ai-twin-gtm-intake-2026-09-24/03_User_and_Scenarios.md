# 3. User and Scenarios — Where Proactive Risk Resolution Matters

## Strongest candidate user

**Candidate, not validated ICP:** A founder, CEO, chief of staff, operations lead, or program lead accountable for work that crosses multiple contributors. The current internal GTM strategy proposes leaders in **10–200-person organizations** as an initial segment; that is a target segment, **not customer evidence**. A more specific pilot user would be a program lead who owns one launch with several interdependent deliverables, uses a shared chat channel and document space daily, and attends recurring decision meetings.

| Required persona dimension | Current factual answer |
|---|---|
| Role and seniority | Cross-functional project or program lead with authority to unblock work; candidate from internal GTM strategy. |
| Company and team size | 10–200-person organization is a proposed target segment. Actual customer distribution and team size are not available. |
| Industry | No validated industry preference. A document-heavy launch, delivery, or operations team is an appropriate test environment. |
| Projects and stakeholders | Multiple concurrent dependencies are expected for this role; exact project and stakeholder counts are not measured. |
| Communication channels and meetings | At least a work group, meeting minutes, and a document location are needed for the feature-owner example. Weekly volume not measured. |
| Geography, time zones, travel | Not established. Cross-time-zone coordination is a plausible pain amplifier, not a proven product requirement. |
| Responsibility | Accountable for milestone visibility, ownership, timely escalation, and helping contributors clear blockers. |

This role has stronger pain than an average employee because one missed handoff can affect several people's work and because the leader must detect problems **before** the milestone, not merely answer a question after someone asks. A likely adoption trigger is a recent deadline surprise despite all the relevant facts already existing somewhere in chat, minutes, or documents. That adoption trigger remains a hypothesis until interviews confirm it.

## Scenario 1 — Promised document is absent near a deadline

**Trigger:** Meeting minutes and a project group show that Maya promised a compliance document by Thursday; the agreed document location has no matching file near the deadline.  
**Without Friday:** The lead finds the earlier promise, checks the folder and later messages, asks Maya, and tells another responsible manager.  
**Manual workload:** The example spans three source types and at least two contacts; clicks, minutes, and number of people in an actual case are **Not yet measured**.  
**Friday behavior:** Correlate the commitment, due time, project dependency, expected output, contributor, and lead; check for a changed plan or alternate delivery; surface a risk; contact the contributor and notify the lead under the actual action policy; keep checking for evidence.  
**Human involvement:** The lead can help remove a blocker and decides any material deadline or resource change. User confirmation is conditional on the safety and privacy boundary, according to the feature owner.  
**Outcome:** A potential missed handoff becomes an explicit, actionable issue; whether the document arrives on time is unknown.  
**Metric:** Risk detection lead time; correct-owner rate; time to owner response; artifact delivery before deadline; false-alert rate. **Not yet measured.**  
**Best visual:** A source-linked promise, an empty expected artifact location, then a targeted group reminder and lead notification, followed by actual document evidence or an unresolved state. A prototype animation must be labeled as such.

## Scenario 2 — A blocker emerges in a meeting and stalls the next step

**Trigger:** A meeting participant says the launch plan cannot be finalized until Legal confirms a clause; the action is recorded in minutes but no owner update follows.  
**Without Friday:** The project lead replays notes, asks who owns the Legal decision, and checks whether anyone acted.  
**Manual workload:** Number of searches, contacts, and elapsed time are **Not yet measured**.  
**Friday behavior:** Treat the statement as a dependency candidate, check whether an owner and deliverable were explicitly assigned, connect it to the affected milestone, and ask for the missing decision or owner evidence. If ownership remains ambiguous, escalate to the lead instead of contacting a guessed person.  
**Human involvement:** A manager may name the owner, interpret a contested legal point, or change the plan.  
**Outcome:** The unresolved dependency becomes visible before the next meeting; an automatic resolution is not assumed.  
**Metric:** Percentage of true blockers surfaced, owner-assignment accuracy, time from meeting to first useful action, and false assignment count. **Not yet measured.**  
**Best visual:** Meeting decision → identified missing owner → focused question to the lead → owned next step.

## Scenario 3 — The apparent owner is wrong or the work was completed elsewhere

**Trigger:** Friday prepares a reminder from an old meeting record, but a later group reply says another team now owns the deliverable, or the file was delivered in a different workspace.  
**Without Friday:** The recipient complains or the lead manually repairs the task record and stops the reminder.  
**Manual workload:** Actual time and frequency are **Not yet measured**.  
**Friday behavior:** Read the correction and current source; stop the stale reminder; repair the existing work item rather than duplicate it; identify the new owner only if evidence is sufficient; check the alternate file before declaring the item done.  
**Human involvement:** Confirm ambiguous ownership or a disputed completion standard.  
**Outcome:** The workflow avoids further contact to the wrong person and retains an accurate open/closed state.  
**Metric:** Wrong-owner correction time, repeated-wrong-contact rate, duplicate work-item rate, and premature-closure rate. **Not yet measured.**  
**Best visual:** A correction reply changes the owner path and cancels the stale follow-up while the risk stays open.

The third scenario is grounded in an [underlying work-tracking design's internal wrong-owner feedback case](/Users/stardust/ceo/docs/superpowers/specs/2026-06-29-follow-up-reply-task-agent-design.md). Names and business details above are illustrative; no Friday customer case or production result is claimed.

**Source boundary:** The 10–200-person segment comes from the [internal GTM strategy](../../doc/LOGAN-GTM-Strategy-CN.md), not measured adoption. The risk flow comes from the feature-owner example. The feature owner confirms the full loop is operational; deployment breadth and measurable outcomes are not supplied.
