# 2. Customer Problem — A Delivery Risk Hidden Across Work Sources

## Existing workflow

The triggering event is a **material promise with a deadline and a dependency**: for example, a contributor promises to upload a document required by a launch. The promise is made in a group discussion or meeting, while the expected output lives in a document workspace. As the deadline approaches, the expected artifact is still not visible to the project leader.

The leader or coordinator normally must (1) remember or find the original promise, (2) confirm what was promised and by whom, (3) open the expected document location, (4) check whether the plan changed in later messages or meetings, (5) contact the contributor, (6) interpret the response, (7) tell the project lead or another helper, and (8) check again until there is a usable deliverable or a new decision. These are **eight analytical steps in this example**, not an observed average. The number of systems varies with the channel and repository; a group chat, minutes, and document store imply **three source types**, not three measured app switches.

The context that must be remembered includes the exact deliverable, due time, project consequence, contributor, project lead, prior revisions, and any newer agreement. Copying or pasting often occurs when someone manually briefs the lead with excerpts or forwards the file link. Chasing begins when the promised output is not present and the contributor has not given a reliable status. Delay often arises at handoffs: the contributor thinks the document is still being edited, the leader assumes it was delivered, and no one connects the missing file to the launch dependency.

If no one intervenes, the dependency can remain invisible until the next review or milestone. A missed file does **not** automatically mean the overall project will be late; it means there is a credible risk that requires verification and an owner response.

## Pain measurement inventory

No production or customer study was supplied. Every quantity below is **Not yet measured** for Friday and should be collected from a bounded pilot:

| Quantity | What to record |
|---|---|
| Frequency | Material deadline risks detected per project per week, separated from ordinary overdue tasks. |
| Time per occurrence | Human minutes spent reconstructing context, checking sources, contacting people, and checking again. |
| People involved | Contributor, accountable lead, coordinator, and any dependency owner actually contacted. |
| Response delay | Time from first detectable risk signal to a useful reply from the contributor. |
| Missed-action rate | Share of eligible risks with no owner contact before the agreed intervention window. |
| System switching | Number of distinct apps or locations opened by a human to confirm each risk. |
| Follow-up count | Number of human and Friday contacts until the issue is resolved or explicitly escalated. |
| Error and rework | Wrong owner contacts, premature “done” states, duplicate nudges, and false risk alarms. |
| Cost of delay | Actual downstream milestone impact, if observed; no revenue effect can be assumed. |

## Before / after comparison

| Dimension | Without Friday | With Friday in the described workflow | Evidence / source |
|---|---|---|---|
| Number of steps | Eight analytical steps in the example, performed or orchestrated by people. | Friday could perform the context check, risk surfacing, and allowed outreach; humans retain exceptions and judgment. Actual click reduction unknown. | Feature-owner scenario; **illustrative, not measured**. |
| Human time | Recall, search, check, message, brief, and recheck. | Attention shifts to true exceptions and decisions. Minutes saved unknown. | Hypothesis / Not yet measured. |
| Systems opened | Chat, meeting record, and document location may all be needed. | Friday is intended to correlate authorized sources; human may still open a source for review. | Feature-owner scenario; count is source types. |
| Manual follow-ups | Leader or coordinator contacts contributor and checks again. | Friday contacts and monitors in the owner-confirmed workflow; confirmation is conditional on safety and privacy boundaries. | Feature-owner confirmation; exact rule thresholds unprovided. |
| Response time | Depends on when a person notices and acts. | Potential earlier contact when a risk signal appears. | Hypothesis / Not yet measured. |
| Risk of missing action | Promise can be buried in a conversation or minutes. | Persistent, source-linked risk could be surfaced. | Underlying work-tracking design; detection recall unknown. |
| Human attention required | Repeated monitoring and context reconstruction. | Review ambiguous evidence, sensitive sends, and material decisions. | Hypothesis / Not yet measured. |
| Error / rework risk | A person can forget or contact the wrong owner. | Friday can also misidentify the owner or file location; evidence checks are required. | Underlying work-tracking failure case; comparative rate unknown. |

## Concrete case

**Illustrative case supplied by the feature owner:** A group discussion and meeting minutes establish that a contributor will provide a document needed for a project milestone. Near the due date, the document is absent from the expected workspace and the contributor has not provided a new delivery update. The project lead may not be looking at that folder or the earlier meeting record. Friday's proposed role is to make the gap visible, ask the contributor for the deliverable or blocker, and inform the lead so they can help before the dependency delays the project. The case describes the intended workflow; no actual send receipt, customer outcome, or timing record was supplied.

## Boundary

The strongest pain occurs when the promise is important, the deadline is real, and the dependency is not already managed elsewhere. If an explicit project system already tracks the work with reliable status and notifications, incremental value must be measured rather than assumed. If the file may be in another location or the deadline changed, Friday should present uncertainty and verify before blaming a person or declaring a risk.

**Sources:** Feature-owner scenario (2026-09-24); [Friday AI Twin PRD](../../Friday%20%E5%B7%A5%E4%BD%9C%E5%88%86%E8%BA%AB%20PRD.md); [underlying work-tracking rules](/Users/stardust/ceo/skills/ceo-work-tracking/SKILL.md).
