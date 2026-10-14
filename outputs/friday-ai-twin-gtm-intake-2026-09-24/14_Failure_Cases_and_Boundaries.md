# 14. Failure Cases and Boundaries — When Friday Should Slow Down

The feature owner confirms the full workflow runs, but the following limits prevent a universal claim that every project risk can be detected or resolved automatically. Frequencies are **Not yet measured** in all cases.

## 1. Incomplete or inaccessible work context

**Problem:** The original promise, later decision, or final artifact is outside Friday's authorized sources. A missing file in one folder may actually exist elsewhere.  
**Frequency:** Not yet measured.  
**User impact:** False alert, missed risk, or premature claim that the deliverable was not provided.  
**Current mitigation:** Treat absent evidence as uncertainty; search only permitted likely locations, ask for the link or access, and keep the issue open when the acceptance standard cannot be checked.  
**Planned improvement:** Measure source coverage and allow explicit correction of expected artifact location; roadmap commitment not confirmed.  
**How we should / should not describe this publicly:** Say “Friday monitors the work sources you authorize.” Do not say “Friday sees everything happening in your company.”

## 2. Ambiguous or changed owner

**Problem:** A participant appears in a meeting, but the actual contributor or accountable lead is someone else; ownership later changes.  
**Frequency:** Not yet measured. An [underlying internal follow-up design](/Users/stardust/ceo/docs/superpowers/specs/2026-06-29-follow-up-reply-task-agent-design.md) records a wrong-owner complaint, but does not provide a denominator.  
**User impact:** Misaddressed reminder, wasted attention, and damaged trust.  
**Current mitigation:** Require explicit owner evidence; on correction, stop the old follow-up and repair the existing issue rather than creating a duplicate.  
**Planned improvement:** Benchmark owner matching and role-change handling; implementation plan not confirmed.  
**How we should / should not describe this publicly:** Say “Friday uses work evidence to identify whom to contact, and can ask when ownership is unclear.” Do not say it always knows the right person.

## 3. A deadline changed or work was already completed

**Problem:** Friday sees the old due date or an old draft while a newer conversation or external task state already resolved the issue.  
**Frequency:** Not yet measured.  
**User impact:** Stale or repeated reminders.  
**Current mitigation:** Refresh current project, task, conversation, and document state before contact; suppress an open reminder when current evidence satisfies the acceptance standard.  
**Planned improvement:** Measure stale-reminder rate and expand reliable current-state coverage where authorized.  
**How we should / should not describe this publicly:** Say “Friday rechecks before following up.” Do not claim zero duplicate messages without a measured result.

## 4. A false or overly broad acceptance standard

**Problem:** AI infers “document uploaded” while the actual work requires approval, a signed version, or an additional dependency.  
**Frequency:** Not yet measured.  
**User impact:** A risk appears resolved while the project is still exposed.  
**Current mitigation:** Tie the standard to the original commitment and newer decisions; ask a decision maker when quality acceptance is subjective; preserve source evidence.  
**Planned improvement:** Human-reviewed benchmark for acceptance-standard quality and false closure.  
**How we should / should not describe this publicly:** Say “Friday checks resolution against the agreed work context.” Do not say it independently guarantees business acceptance.

## 5. Sensitive or private material

**Problem:** The right explanation contains confidential or personal information that should not be posted in a group.  
**Frequency:** Not yet measured.  
**User impact:** Privacy exposure or loss of trust.  
**Current mitigation:** The feature owner says safety and personal-privacy boundaries determine whether user confirmation is required; minimize disclosure and withhold uncertain sends.  
**Planned improvement:** Publish the exact reviewed policy and test cases; not available in this intake.  
**How we should / should not describe this publicly:** Say “Some actions require your confirmation.” Do not imply every reminder is automatic.

## 6. The contributor cannot solve the blocker

**Problem:** Friday contacts the right person, but the blocker requires resources, a changed scope, or a management decision.  
**Frequency:** Not yet measured.  
**User impact:** Outreach alone does not complete the project.  
**Current mitigation:** Notify the responsible lead, capture the blocker, and return irreducible trade-offs to a human; leave the issue open until evidence meets the standard.  
**Planned improvement:** Track escalation quality and time to unblock.  
**How we should / should not describe this publicly:** Say “Friday helps move issues toward resolution.” Do not promise that it completes every project.

## Other limits

Language-specific quality, scale, scan-to-alert latency, and connector coverage have no results in the reviewed material. The Friday PRD prioritizes DingTalk; do not claim equivalent behavior in Slack, Teams, Feishu, or every document repository without a live integration and test. A highly structured project system with reliable owner and artifact state may already handle a given case well.

**Sources:** Feature-owner answers (2026-09-24); [underlying work-tracking Skill](/Users/stardust/ceo/skills/ceo-work-tracking/SKILL.md); [Friday product PRD](../../Friday%20%E5%B7%A5%E4%BD%9C%E5%88%86%E8%BA%AB%20PRD.md).
