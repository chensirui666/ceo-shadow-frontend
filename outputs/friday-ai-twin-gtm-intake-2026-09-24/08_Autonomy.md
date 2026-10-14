# 8. Autonomy — Work Friday Takes Over, and Decisions It Returns

## Autonomy by use case

| Level | Use case in the risk workflow | Human control |
|---|---|---|
| 1. Recommend | Surface a possible project risk when the promise, owner, or missing artifact is uncertain. | User reviews and corrects the facts. |
| 2. Draft | Prepare a reminder or lead notification when content or audience needs review. | User may edit or discard it. |
| 3. Execute with approval | Send an outreach message that crosses a safety or personal-privacy boundary. | The feature owner says these boundaries determine whether user confirmation is required; exact categories and thresholds are not supplied. |
| 4. Execute automatically within predefined rules | Perform an authorized scheduled scan; for allowed cases, contact the contributor and relevant lead. | Requires established source and send scope; confirm the precise low-risk policy before using this as a public claim. |
| 5. Own the workflow / outcome | Keep the issue open, recheck current evidence, follow up, and compare the result with a derived acceptance standard. | This means operational stewardship, **not a guarantee that the human contributor will deliver or the project will finish on time**. |

The feature owner confirms that the complete risk-to-resolution loop operates. We still need a real trace showing which cases were automatic and which required confirmation.

## Before / after

Without Friday, a manager or coordinator decides whether a promise matters, searches old and current sources, determines the right people, composes contacts, returns for updates, and decides whether the issue is resolved. With Friday, scanning, context reconstruction, candidate risk detection, routine status checks, permitted outreach, and evidence comparison can occur in the background. The human remains responsible for disputed facts, sensitive disclosure, changes to commitments, resource trade-offs, and acceptance that requires business judgment.

No measured counts exist for human decisions, actions, checks, approvals, or follow-ups before and after. The minimum evaluation should count separately: **Friday read/decision actions**, **external sends**, **user approvals**, **human corrections**, **leader interventions**, and **verified resolutions**. A message sent is an action; it is not a completed project outcome.

## Same workflow compared

| Stage | Manual | With Friday |
|---|---|---|
| Notice | Lead recalls the promise or discovers the gap at a review. | Fixed-time scan checks authorized ordinary group messages and related sources. |
| Understand | Lead reconstructs history and current document state. | Friday retrieves source-linked history, participants, changed decisions, and current evidence. |
| Decide | Lead judges risk and whom to ask. | Friday derives risk, audience, resolution route, and acceptance standard; uncertain cases return to the user. |
| Act | Lead reminds contributor and briefs project owner. | Friday sends allowed messages or requests confirmation at a boundary. |
| Recheck | Lead returns later. | Friday continues monitoring and revalidates before another follow-up. |
| Close | Lead checks the final deliverable. | Friday compares current evidence with the standard; human judgment remains where necessary. |

**Steps, time, touchpoints, and final outcome:** The table is a process comparison, not an observed improvement. Actual baseline and Friday run counts are **Not yet measured**. Use one real project risk, time-stamped from first detectable signal to evidence-backed closure, to quantify them.

## Required autonomy metrics

- Automatic-action share = allowed external actions executed without per-action approval / all eligible external actions.
- Mean approvals per risk; human intervention and correction rates.
- Escalation rate and reason; wrong-person contact rate.
- Autonomous workflow success = risks correctly detected, appropriately contacted, and closed against valid evidence without avoidable human rescue / eligible risks.
- Evidence-backed resolution rate and median time to resolution.
- False closure and repeated reminder rate.

All current values, sample sizes, and comparison deltas are **Not yet measured**. The safety policy must be reported beside any autonomy rate; broadening allowed actions can raise autonomy while also raising risk.

**Sources:** Feature-owner answers (2026-09-24); [Friday product PRD](../../Friday%20%E5%B7%A5%E4%BD%9C%E5%88%86%E8%BA%AB%20PRD.md); [underlying work-tracking Skill](/Users/stardust/ceo/skills/ceo-work-tracking/SKILL.md).
