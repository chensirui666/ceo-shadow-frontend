# 7. Recipe and Workflow — From Risk Signal to Verified Resolution

## Definition and product boundary

A **Recipe** in the Friday Routine PRD is a Friday-provided, read-only core capability chosen for one scheduled Routine. One listed Recipe, **Risk and Blocker Review**, identifies current risks, blockers, and unconfirmed dependencies for a recurring output. The user can select it and configure the Routine's schedule and optional delivery target; the PRD does not say that this Recipe alone sends owner reminders or closes risks.

The selected deep-dive feature is the broader **operational risk-to-resolution workflow** confirmed by the feature owner: Friday performs fixed-time scans of ordinary messages in authorized groups, checks the related history and current evidence, identifies relevant participants and a way to resolve the issue, derives an acceptance standard, contacts the contributor and responsible lead when permitted, and follows through. Do not rename this whole workflow a shipped “Recipe” unless the product team confirms that packaging.

**Customer-facing explanation:** Friday notices a delivery at risk and keeps the right people moving toward an evidenced resolution.  
**Technical explanation:** A persistent, source-linked issue coordinates recurring scans, model judgments, guarded outbound actions, subsequent state checks, and evidence-backed closure.

## Components of the complete workflow

| Component | Role in this feature | Known boundary |
|---|---|---|
| Trigger | A fixed-time scan of ordinary messages in authorized groups finds or refreshes a relevant commitment. | Exact interval and lookback window not supplied. |
| Context | Original group promise, meeting minutes, project dependency, later changes, and expected document state. | Only authorized, relevant sources may be read. |
| Reasoning | Distinguish a material risk from normal work motion; identify contributor and responsible lead; infer resolution route and acceptance standard. | Owner identity and duty need evidence; do not infer from attendance alone. |
| Conditions | Is the deadline approaching? Is the deliverable really absent? Has the plan changed? Is outreach permitted? | Thresholds and sensitive-content policy details not supplied. |
| Actions | Reminder to contributor in group; notice to the relevant lead; possibly a status or blocker question. | Confirmation depends on security/privacy boundary. |
| Waiting and monitoring | Keep an open issue and recheck replies, documents, and structured task state. | Scan interval and maximum follow-up frequency not supplied. |
| Retry and escalation | Skip stale reminders, repair wrong-owner routing, or seek a human decision when needed. | Exact retry and escalation policy for Friday Twin not supplied. |
| Completion | Compare current evidence with the derived acceptance standard. | A send receipt or “in progress” reply is not issue resolution. |

## Full workflow

**Trigger →** At a scheduled scan, Friday reads eligible ordinary group messages.  
**Interpretation →** It extracts a promised document, deadline, contributor, dependent project, and potential lead; it discards ordinary chatter.  
**Context used →** It searches the related history and minutes, plus the authorized expected document location, and checks for newer changes.  
**Decision →** It determines whether the gap is material, who should act, how the issue can be resolved, and what observable evidence would satisfy that resolution.  
**Action →** Under the applicable privacy/security rule, it reminds the contributor in the group and informs the lead; it requests confirmation when the rule requires it.  
**Wait →** The issue remains open while work proceeds.  
**Monitor →** A later scan checks the reply, document, and any linked task state.  
**Follow-up →** If the acceptance standard is still unmet, Friday asks a concise status, blocker, or delivery-date question rather than repeating a stale message.  
**Escalation →** If the contributor is blocked or ownership is disputed, the lead is asked to help; unresolved management decisions return to the user.  
**Completion →** Friday closes the issue only when current evidence meets the derived standard, or records that it remains unresolved/canceled with the reason.

The feature owner confirms this complete loop runs. A redacted run trace and actual external receipts have not been supplied for this intake.

## Comparison with conventional automation

| Dimension | Manual SOP / fixed rule / Zapier-style flow | Friday workflow | Evidence |
|---|---|---|---|
| Setup time and configuration | A person defines the task, owner, due date, and rule in advance. | Friday is intended to infer a candidate from authorized work context; exact setup burden unknown. | Workflow description; no time study. |
| Technical skill | Rules or scripts may require configuration. | The user mainly authorizes sources and action scope. | Product goal; not measured. |
| Maintenance | Changed owners and dates must be updated in the configured system. | Friday checks later context and can revise the issue. | Underlying work-tracking rules; comparative rate unknown. |
| Ambiguity | Rules handle structured fields best. | AI can distinguish promise, dependency, changed plan, and blocker but can still be wrong. | Mechanism; accuracy unmeasured. |
| Waiting and monitoring | Timers and task statuses can work reliably when structured. | Friday also checks conversational and document evidence. | Feature-owner description; no benchmark. |
| Success and intervention | Depends on rule design and human response. | Depends on inference quality, permissions, outreach, and actual delivery. | **Not yet measured** for both in a same-task study. |

## Metrics

Setup time, valid-risk detection rate, workflow success rate, average human interventions, wrong-owner rate, false or duplicate outreach, send/retry error rate, time saved, number of actions performed, and evidence-backed resolution rate are **Not yet measured**. A future comparison must use the same projects, access scope, and time window for Friday and the baseline.

**Sources:** [Routine PRD](../../doc/Routine%20PRD.md), [underlying work-tracking logic](/Users/stardust/ceo/docs/product-logic.md), [work-tracking Skill](/Users/stardust/ceo/skills/ceo-work-tracking/SKILL.md), feature-owner answers (2026-09-24).
