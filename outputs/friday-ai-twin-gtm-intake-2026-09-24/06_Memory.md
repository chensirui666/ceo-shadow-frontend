# 6. Memory — Context That Helps Friday Act, Not the Customer Outcome

## Before persistent context

A generic LLM given only today's group message may not know what document was promised in a meeting last week, which launch depends on it, or who owns that launch. A user must search, paste, and explain that context each time. Separate conversations and channels make the reconstruction harder, especially when a due date or owner changed after the original promise.

For this feature, the customer value is not “Friday remembers.” The value is that remembered, authorized context helps Friday **notice a material gap and take an appropriate next step**. Memory must never substitute for a current source check or action receipt.

## What may be retained

The relevant memory candidates are project identity, deliverables, commitments, decisions, deadlines, aliases for people and projects, relevant relationships, recurring review practices, and historical outcomes. Style preferences may shape wording, but they cannot establish whether a risk exists or whether a message may be sent. The Friday Onboarding PRD specifies a separate Memory per **connector + account** identity and source updates from authorized work materials; cross-account merging is outside its first scope.

The actual schema, retention period, correction behavior, memory count, and accuracy of the risk workflow have not been supplied. The feature-owner example says the contributor and responsible project lead can be learned from daily communication and meeting minutes. That is a candidate relationship, not an irrevocable assignment.

## Creation, update, and use

| Operation | Documented or described mechanism | Required caution |
|---|---|---|
| Initial construction | The Friday Onboarding PRD describes user-confirmed source scope and a background Memory build. | A successful setup screen is not proof that every relevant meeting or document was ingested. |
| New information | The PRD describes incremental handling of new group/private messages and updated minutes/documents. | Deleted or permission-revoked material is not automatically cleaned from P0 Memory according to that PRD; this must be disclosed and addressed before broad claims. |
| User correction | A participant may correct an owner or deadline in a current conversation. | The current correction must update or override old context; whether Friday product Memory itself is rewritten is unconfirmed. |
| Retrieval | Friday can use prior project context when interpreting a new promise or risk signal. | Retrieve only within the active authorized identity; cite the source and freshness. |
| Action trigger | An open commitment and deadline may cause a later check. | The watch and action require explicit workflow state, not just a remembered sentence. |
| Completion | Current artifact, structured task state, or direct evidence can justify closure. | Memory alone is never completion evidence. |

## Comparison

| Capability | Chat history | RAG / search | Friday Memory in the proposed risk workflow | Evidence |
|---|---|---|---|---|
| Finds old text | Manual scroll/search. | Can retrieve matching text. | Can provide a prior commitment with source reference. | Product/underlying design; quality unmeasured. |
| Understands person or entity | Reader infers manually. | May retrieve aliases. | Should connect contributor and lead, with explicit owner evidence. | Feature-owner example; accuracy unmeasured. |
| Connects events over time | Person reconstructs. | Several hits require interpretation. | Intended to connect promise, changed plan, risk, and outcome. | Proposed workflow; no benchmark. |
| Remembers preferences | Conversation-local. | Can retrieve preference text. | Work-style profile may guide phrasing. | Friday PRD; no style score. |
| Understands commitments | Manual judgment. | Finds mentions. | Work-tracking logic records durable deliverable and deadline. | Underlying Skill, not release proof. |
| Updates outdated information | Person rereads. | Index refresh may retrieve new text. | Current source should override stale Memory; update policy unverified. | Design requirement. |
| Uses memory proactively | No. | Usually on request. | Risk watch may recall context when a deadline approaches. | Feature-owner scenario; operating status owner-confirmed, with execution evidence pending. |
| Uses memory to trigger action | No. | No, without orchestration. | Intended to support a source-checked outreach decision. | Feature-owner-confirmed workflow; confirmation depends on safety and privacy boundaries. |

## Example across weeks

**Illustrative, not observed:** On Monday of week 1, minutes say Maya will provide the compliance document by Thursday of week 2 and Alex is the launch lead. Friday retains a source-linked project context. On Wednesday of week 2, it checks newer group messages and the authorized document location. If the promise is still current and the document is absent, the risk workflow can contact Maya and alert Alex under the applicable permission rule. A subsequent “I'll upload it” reply leaves the issue open; a verified final document can satisfy the completion condition. The action follows **new current evidence plus historical context**, not Memory alone.

## Metrics and benchmark needed

Memory extraction precision, retrieval precision/recall, person/entity matching accuracy, incorrect or stale memory rate, retrieval latency, memories per identity, proportion of risk decisions using Memory, correction rate, and relevance score are all **Not yet measured** for this feature. Build a time-split benchmark: freeze what Friday could know before the risk check, then score whether it retrieves the right commitment and prefers newer corrections. Include wrong-owner and changed-deadline negatives.

**Sources:** [Friday Onboarding PRD](../../doc/feature0-onboarding%20page/00-Onboarding%20PRD.md); [underlying work-tracking rules](/Users/stardust/ceo/skills/ceo-work-tracking/SKILL.md); feature-owner example (2026-09-24).
