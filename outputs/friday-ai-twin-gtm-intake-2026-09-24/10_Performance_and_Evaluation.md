# 10. Performance and Evaluation — Proving That Friday Moves Work Forward

## What counts as success

A successful case is **not** merely a risk card or a sent reminder. For an eligible commitment, Friday must: (1) identify a material, current risk before the useful intervention window closes; (2) state the correct deliverable, due time, and project consequence without invention; (3) select the contributor and responsible lead from evidence; (4) choose an allowed action and secure confirmation when required; (5) deliver the outreach to the intended targets; (6) process replies or changes without duplicate or stale follow-up; and (7) mark the issue resolved only when current evidence meets the inferred acceptance standard. If a person cannot deliver, a truthful open/escalated outcome is preferable to a false success.

## Baselines and study design

Use the **same source snapshot and project window** for: (a) a project lead's ordinary manual coordination, (b) a simple due-date or keyword rule operating on an explicit task list, and (c) Friday. A generic LLM given one pasted thread may be a secondary baseline, but it lacks the background watch and external action loop unless separately equipped. Include true risks, harmless late chatter, changed deadlines, wrong-owner cases, inaccessible folders, alternate artifact locations, sensitive content, and commitments that were canceled.

The feature owner confirms the full workflow is operating, but no scored benchmark, production metric, test conditions, or sample size were provided. The 9.17 AI Twin Eval Case package evaluates other core skills; it is not evidence for proactive risk resolution.

## Required reporting format

| Metric | Current Friday result | Baseline result | Improvement | Sample size / conditions / date / source or owner | Known limitation |
|---|---|---|---|---|---|
| Material-risk precision and recall | Not yet measured | Not yet measured | Not calculable | Create labeled, time-split cases; product/eval owner TBD. | Source access and materiality may vary. |
| Lead time before missed deadline | Not yet measured | Not yet measured | Not calculable | Real project cases with first detectable signal and intervention timestamps. | A scheduled scan creates a timing window. |
| Commitment, due-date, and artifact accuracy | Not yet measured | Not yet measured | Not calculable | Annotate exact source spans and later corrections. | Ambiguous promises. |
| Contributor and lead identification accuracy | Not yet measured | Not yet measured | Not calculable | Ground truth from project owner; include role changes. | Person mention is not ownership evidence. |
| Wrong-person contact rate | Not yet measured | Not yet measured | Not calculable | Sent-message receipts plus verified target identity. | A false contact has asymmetric harm. |
| Approval-policy correctness | Not yet measured | Not yet measured | Not calculable | Label sensitive/privacy cases; review gated vs. automatic actions. | Policy thresholds not supplied in this intake. |
| Tool-call and message-delivery success | Not yet measured | Not yet measured | Not calculable | Provider results and target-conversation read-back. | Unknown delivery must not be treated as sent. |
| Stale / duplicate follow-up rate | Not yet measured | Not yet measured | Not calculable | Track issue revisions and current state before sends. | Completion may be recorded outside observed sources. |
| Acceptance-standard quality and false closure | Not yet measured | Not yet measured | Not calculable | Human judge checks derived standard and final evidence. | “Done” language may be ambiguous. |
| Evidence-backed resolution rate | Not yet measured | Not yet measured | Not calculable | Follow issues until resolved, canceled, or still open. | Contributor behavior is outside Friday's control. |
| Human attention and time to resolution | Not yet measured | Not yet measured | Not calculable | Compare touches and timestamps with manual baseline. | Project mix must be comparable. |
| Model/tool cost and latency | Not yet measured | Not yet measured | Not calculable | Log per eligible risk and per full workflow. | Cost depends on sources searched. |

Do not merge detection quality with outcome quality. Report false negatives and false positives separately, and show cases where Friday correctly escalated but the human project still missed the deadline.

## Minimum evidence and guardrails

For each scored item, retain a redacted source bundle, frozen time of observation, expected answer, actual decision, send authorization, provider receipt, target-conversation read-back if available, later evidence, and final state. Evaluate at the time Friday could have known the facts; do not let future documents leak into an earlier detection score. Exclude unavailable sources from claims about what Friday “should have seen,” but measure coverage separately.

**Current conclusion:** Operational status is confirmed by the feature owner. **Quality and impact are unmeasured.** No accuracy percentage, hours saved, or increase in project completion can responsibly be stated.

**Sources:** Feature-owner answers (2026-09-24); [underlying work-tracking Skill](/Users/stardust/ceo/skills/ceo-work-tracking/SKILL.md); [Friday AI Twin Eval Case package](../../9.17%20Eval%20Case/%E5%9F%BA%E7%A1%80%E8%AF%B4%E6%98%8E%EF%BC%88ReadMe%EF%BC%89.md).
