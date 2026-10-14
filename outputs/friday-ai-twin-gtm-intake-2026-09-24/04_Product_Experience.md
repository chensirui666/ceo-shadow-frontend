# 4. Product Experience — What the User Sees

## Activation and scope

The Friday product PRD specifies a connected work identity and an explicit path from initial Trial/Draft mode to enabled operation. The current Onboarding PRD specifies **connector-account scoping**, a user-confirmed source range, background Memory construction, and a confirmed work-style setup. This establishes a product setup concept; the feature owner separately confirms that the proactive risk-to-resolution workflow runs, but has not provided a verified UI capture or rollout scope.

For this feature, activation must also establish which group conversations and document locations Friday may read, which risks it may surface, whether it may contact contributors and project leads, and which outbound messages require approval. The exact controls and number of setup clicks for this risk workflow are **not confirmed**. The current Friday frontend is a prototype and is not evidence of real connectors, outreach, or completion checks.

| Setup question | Known answer |
|---|---|
| What is connected? | The Friday PRD prioritizes DingTalk as the first real work channel; the Onboarding PRD scopes Memory by connector and account. |
| What can be monitored? | Group messages, minutes, and relevant documents are in the feature-owner scenario; actual risk-monitoring source scope and trigger conditions require confirmation. |
| What permissions are needed? | Read permission to each source and appropriate send permission for the target conversation. Friday must not infer wider access from a connected account. |
| Does it run automatically after setup? | The feature owner confirms the complete risk workflow runs and scans ordinary messages in authorized groups on a fixed schedule. The exact interval is not supplied. Routine's scheduled risk report is a separate specified capability. |
| Setup time? | **Not yet measured** for this feature. The broader PRD's setup target is not a measured risk-workflow time. |

## First-use flow to validate

**User action:** The project lead connects and authorizes the work sources, reviews the planned read/send scope, and enables the permitted mode.  
**Friday response:** Friday shows the source-linked promise: contributor, expected document, deadline, project consequence, and the evidence for each.  
**User action:** The user corrects missing ownership or approves an outbound action if the policy requires it.  
**Friday action:** Friday checks current messages and the permitted document location, then posts a targeted reminder to the contributor and notifies the responsible lead when allowed.  
**Final output:** A visible risk record shows the evidence, who was contacted, actual delivery receipts, next check, and either verified resolution or a clear open/blocked state.

This is the **experience described by the feature owner**, not a verified screenshot-by-screenshot account of the running product. The exact confirmation screen and action path are to be supplied by the team.

## Before and after on screen

| Without Friday | With Friday, if the complete feature is enabled |
|---|---|
| Open group chat to find the promise. | See a risk card or work item with the promise and source link. |
| Open meeting minutes to confirm owner and deadline. | See owner, deadline, and their supporting source excerpts. |
| Open the expected folder and check for the file. | See the last checked location and whether delivery was actually found. |
| Compose a reminder and separately brief the project lead. | Review or inspect the sent contributor reminder and lead notification. |
| Return later to check the reply and file. | See current status, next check, and completion evidence or uncertainty. |

No Friday screen can be asserted from the prototype alone. In particular, the first-version Friday Task PRD explicitly describes manual completion and no owner-assignment interface. A demo of the complete risk workflow must therefore be recorded from the **actual connected system**, or clearly marked as a concept.

## Product evidence to request

1. A capture of the original group promise or meeting-minutes commitment, redacted where needed.
2. The expected document location and the time-stamped missing/delivered state.
3. Friday's source-linked risk item, including owner and deadline evidence.
4. The actual group reminder to the contributor and actual notification to the lead, with message IDs or channel read-back.
5. The reply, artifact, or structured task state that changed the risk status.
6. The final completion or unresolved state, with a reason and time stamp.

The strongest five-second view is **“Promised document due soon → no current artifact → Friday contacted the contributor and alerted the lead”**, provided the captures are real. A 15–20 second recording can then show follow-through and verified closure.

## Quantification

Clicks, screens, setup duration, time to first value, time to resolve a risk, and the number of user interventions are all **Not yet measured**. For the pilot, count only real user actions; background reads and AI tool calls do not count as human clicks. Time to value should start at authorized activation and end at the first **correct, actionable risk** rather than the first generated card. Time to completion should end only when the defined deliverable is verified, not when a reminder is sent.

**Sources:** [Onboarding PRD](../../doc/feature0-onboarding%20page/00-Onboarding%20PRD.md), [Message PRD](../../doc/feature3-message%20page/03-Message%20PRD.md), [Task PRD](../../doc/feature4-task%20page/04-Task%20PRD.md), and feature-owner scenario (2026-09-24).
