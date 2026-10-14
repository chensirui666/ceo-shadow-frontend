# 5. AI Intelligence — The Judgments Behind a Useful Intervention

## Decisions the AI must make

1. **Is there a real commitment?** “I can try to send a draft” is different from “I will upload the approved version by Thursday.” Friday must capture the promised artifact, speaker, deadline, and any conditions.
2. **Does the commitment matter to the project?** A late artifact is a project risk only when a milestone or dependent decision actually needs it.
3. **Is the risk still current?** A later message may move the due date, a file may have been delivered elsewhere, or the work may have been canceled. An absent file at one location is a clue, not a final verdict.
4. **Who is accountable for what?** The person who promised the artifact and the lead who can unblock the project may be different. Meeting attendance, message authorship, and a matching name alone do not prove responsibility.
5. **What action is proportionate?** Friday may ask for the document, ask for a status or blocker, notify a lead, seek user approval, or stay silent when evidence is insufficient.
6. **When can it close?** Friday derives an acceptance standard from the commitment and project context, then checks current evidence against that standard. A reply saying “working on it” is progress; a linked final artifact or verified structured completion may satisfy the deliverable. Friday must not equate a reassuring phrase with completion.

These are the judgments required by the feature-owner example. The underlying work-tracking Skill contains rules for material commitments, owner evidence, current-state refresh, follow-up, and completion evidence. The feature owner confirms that the complete workflow runs; the exact implementation and an execution trace were not supplied.

## Information used

The minimum useful record includes the triggering group message or minutes excerpt, time and conversation, exact promise, due time, project dependency, expected artifact, candidate contributor, candidate project lead, source for each ownership claim, later updates, and current accessible document or task state. Historical Memory can help connect aliases, projects, and earlier decisions. **Current source material outranks Memory for ownership and completion.** Friday should not use unrelated conversations merely because they are searchable; access scope and relevance are part of the decision.

## Simpler approaches and their limit

| Approach | What it can do | Where it breaks on this task | What Friday must add | Measured delta |
|---|---|---|---|---|
| Keyword or regex rule | Find “due Thursday” or “blocked.” | Cannot reliably distinguish promise, joke, changed plan, or project consequence. | Evidence-linked commitment and materiality judgment. | Not yet measured. |
| Embedding similarity | Find related chat and documents. | Similarity does not prove ownership or non-delivery. | Temporal and source-state reasoning. | Not yet measured. |
| RAG/search | Retrieve the old meeting line. | Retrieval alone does not monitor a due time or contact anyone. | Persistent issue state, action choice, and verification. | Not yet measured. |
| Single-shot LLM | Summarize a pasted thread and propose a reminder. | No durable watch, current-source refresh, or verified send by itself. | Scheduled/event-based follow-through and tool evidence. | Not yet measured. |
| Rule-based automation | Remind the named assignee on a fixed due date. | Requires a correctly entered task and may send after the plan changes. | Extract and revalidate the commitment and audience. | Not yet measured. |
| Generic agent | Can call tools if configured. | May lack the company's owner and send boundaries. | Specific work-tracking rules, source links, and action controls. | Not yet measured. |

## Required test cases

| Case | Input | Expected output | Actual output | Metric |
|---|---|---|---|---|
| Easy | “Maya will upload final compliance.pdf to the launch folder by Thu 17:00; Alex owns the launch.” At the check time, no newer update and the permitted folder has no file. | Flag an actionable risk; preserve both roles; ask Maya for the artifact or blocker and notify Alex only under the authorized send policy. | **Not available yet — no run trace supplied.** | Commitment extraction, owner accuracy, appropriate action. |
| Difficult | Earlier minutes assign Maya, but a newer group decision moves the deadline and owner; a file with a similar name appears in another location. | Prefer the newer decision, inspect the candidate artifact, and avoid a stale or misaddressed warning. | **Not available yet — no run trace supplied.** | Stale-alert rate, owner accuracy, artifact-match quality. |
| Failure | Minutes mention a person who attended but did not accept ownership; the expected folder is inaccessible. | State uncertainty, request owner/access evidence, and do not publicly blame or automatically close. | **Not available yet — no run trace supplied.** | False contact rate, safe abstention. |

The internal wrong-owner follow-up case in the [underlying work-tracking design](/Users/stardust/ceo/docs/superpowers/specs/2026-06-29-follow-up-reply-task-agent-design.md) shows why the failure case matters. It is an internal problem report and design input, **not a measured Friday Twin benchmark**.

**Source:** Feature-owner example (2026-09-24); [underlying work-tracking Skill](/Users/stardust/ceo/skills/ceo-work-tracking/SKILL.md).
