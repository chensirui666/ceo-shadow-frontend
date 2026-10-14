# 1. Feature Definition — Proactive Project Risk Resolution

**Feature name:** Proactive Project Risk Resolution (working name; product owner has not confirmed an official name).  
**Internal technical name:** Not confirmed. Do not invent a service or model name.

**For a business user:** Friday watches authorized work discussions and materials for commitments that may jeopardize a project, alerts the people who can act, and follows the issue toward a verified outcome.

**For a technical audience:** The operating workflow correlates source-grounded commitments, due dates, responsible people, and expected deliverables across authorized group messages, meeting minutes, and documents; it evaluates a current risk signal, coordinates outreach, and updates the work state only after checking current evidence.

## What enters, what happens, and what leaves

| Stage | Concrete content | Evidence status |
|---|---|---|
| Inputs | Ordinary messages in authorized work groups, reviewed on a fixed schedule; meeting minutes recording a commitment or owner; a promised deliverable, due date, and relevant document location. | Feature-owner description in this intake; Friday Onboarding PRD specifies group messages, minutes, and documents as Memory sources. |
| Interpretation | Associate the promise with a project, identify the person who committed and other participants, identify the person responsible for the project, reason about a resolution path, and infer a concrete acceptance standard from the work context. | Underlying work-tracking rules describe evidence-backed ownership and completion conditions. The feature owner confirms the complete Friday workflow is operating; a run trace was not supplied. |
| Risk check | On a fixed-time scan near the due time, compare the promise with current messages and the expected document location. Absence of a file at one location is a **risk signal**, not proof that nothing was delivered anywhere. | Feature-owner scenario; risk threshold, exact scan interval, and document search scope are not yet specified. |
| Action | Tell the contributor in the relevant group what is still needed and when; notify the responsible project lead so they can help remove the blocker. | Feature-owner scenario; the feature owner says safety and privacy boundaries determine whether user confirmation is required; exact policy thresholds are not supplied. |
| Follow-through | Observe reply, file, task status, or another current source; keep the issue open, update the owner or plan, escalate when appropriate, and close only with sufficient evidence. | Underlying work-tracking logic documents this lifecycle; the feature owner confirms the full loop runs; exact escalation rules remain unconfirmed. |
| Outputs | A traceable risk, contextual outreach, a leader notification, current state, and eventually an evidence-backed resolution or an explicit unresolved status. | Product objective; no actual customer output package provided yet. |

The product outcome is **work advanced without the manager repeatedly noticing, searching, and chasing it**. Memory and style distillation may improve interpretation and wording, but they are enabling mechanisms rather than the feature's primary customer value.

## Problem and new capability

A project leader often learns late that a promised artifact has not arrived. The information needed to catch it may be split between an earlier group conversation, meeting minutes, and a document location. Without Friday, someone must remember the promise, check the right place, contact the contributor, tell the project lead, and check again. Friday turns that into a persistent work item that can surface a material gap and coordinate the next action in the original work environment.

| Step | Without Friday | With Friday | Human role that remains |
|---|---|---|---|
| Recall the commitment | Manager searches messages/minutes or remembers it. | Friday connects the promise to the project and due time. | Correct an ambiguous or incorrect commitment. |
| Check delivery | Manager opens the expected document location and asks for status. | Friday checks accessible current sources and reports uncertainty. | Provide access or identify an unobserved delivery location. |
| Contact people | Manager writes to the contributor and briefs the project lead. | Friday prepares or sends a contextual reminder and lead notification under the applicable authorization rule. | Approve any gated outbound message; decide on high-stakes changes. |
| Resolve | Manager checks again and decides whether to close. | Friday watches for evidence and updates the tracked issue. | Resolve disputes or accept work that requires judgment. |

**Step count and time:** No measured before/after count exists. The table names four human responsibility groups, not measured clicks or minutes. A pilot should record each human touch, source opened, elapsed time from first risk signal to owner contact, and time to evidence-backed closure.

## Comparison with alternatives

- **Manual coordination:** A person can exercise judgment and relationships, but must maintain the reminder and context across days. Friday's intended advantage is continuous, source-linked follow-through; this has not yet been measured.
- **ChatGPT or Claude in a chat window:** They can analyze pasted context, but the user must supply the context, return later, and carry out the outreach unless a separate connected workflow is configured.
- **Keyword search or basic RAG:** They can retrieve “due Friday” or a related message. Retrieval alone does not decide whether the deliverable is missing, identify the accountable person from evidence, or maintain an open issue.
- **Conventional automation:** A fixed due-date rule can send a reminder. The harder task is deciding whether a promise is material, whether a newer message changed the plan, and whom to contact.
- **Project software:** It can track explicit tasks and risks well. The described Friday difference is extracting a commitment from the work conversation and checking the surrounding conversation and artifacts. Current competitors also offer AI agents and risk detection; superiority requires a same-task test.
- **Previous Friday product scope:** The current Friday Twin Task PRD describes a narrower, unimplemented personal Task page with manual completion. That PRD does not describe the owner-confirmed operating risk loop.

## Required concrete example

**Situation:** In a launch group, Maya committed in Monday's meeting to place the final compliance document in the shared launch folder by Thursday. The meeting minutes identify Maya as contributor and Alex as project lead. On Thursday, the file is absent from the authorized location and no later group message changes the commitment.  
**Without Friday:** Alex must remember the promise, inspect the folder, ask Maya, and keep checking while the launch schedule is exposed.  
**With Friday:** In the feature-owner scenario, Friday flags the delivery gap, posts a specific reminder to Maya in the relevant group, and notifies Alex to check whether Maya needs help. Friday then looks for current completion evidence before marking the issue resolved.  
**Result:** Alex can intervene before the missed artifact becomes a project delay; the actual outcome in this example has **not been observed**.  
**Why the existing method could not do the same thing as effectively:** Manual coordination can do it but demands repeated attention; a one-off search or generic LLM answer does not own the follow-through. No empirical efficiency comparison exists yet.  
**Metric / evidence:** **Illustrative scenario supplied by the feature owner; not a customer case.** Detection lead time, correct-owner rate, delivery rate, and closure time: **Not yet measured.**  
**Current limitation:** The source may be incomplete, the owner may have changed, the file may be stored elsewhere, and the exact scan interval and approval policy thresholds remain to be specified.

## Sources and status

- Feature-owner description in this intake (2026-09-24).
- [Friday AI Twin product PRD](../../Friday%20%E5%B7%A5%E4%BD%9C%E5%88%86%E8%BA%AB%20PRD.md), [Friday Onboarding PRD](../../doc/feature0-onboarding%20page/00-Onboarding%20PRD.md), and [Friday Task PRD](../../doc/feature4-task%20page/04-Task%20PRD.md).
- [Underlying work-tracking product logic](/Users/stardust/ceo/docs/product-logic.md) and [work-tracking decision rules](/Users/stardust/ceo/skills/ceo-work-tracking/SKILL.md).

**Current product status:** Operational, confirmed by the feature owner; independently verifiable run evidence was not supplied. **Public claim status:** Requires qualification until action controls and an end-to-end case can be reviewed.
