# 13. Trust, Security, and Control — Permission Before Proactive Action

A proactive agent needs more trust than a dashboard: it reads work conversations and can address people without a fresh user prompt. The product must therefore prove **where it looked, why it chose the people, what it sent, and why it considered the issue resolved**. The feature owner says user confirmation depends on the safety and personal-privacy boundary. A precise public security claim requires a verified Friday deployment and policy description, not just this intake.

## Data access and permissions

For the supplied scenario, Friday needs the authorized project's group messages, relevant meeting minutes, and the expected document location. It does **not** need unrestricted access to every group, private conversation, personnel record, or finance folder. The Friday Onboarding PRD specifies user-confirmed source scope, connector-account isolation, and an active work identity. It describes group messages and incremental source updates. The exact per-group/folder exclusion controls for the running risk workflow have not been supplied.

Every owner or participant claim must be tied to current source evidence. A person's appearance in minutes is not permission to contact them or proof that they own the deliverable. The target conversation and intended audience must be verified before sending. Authorization to **read** a source does not itself authorize external disclosure from that source.

| Action class | Necessary control for this feature | Confirmed status |
|---|---|---|
| Read | Scope to authorized work identity and relevant project sources. | Specified in Friday Onboarding PRD; actual deployment configuration not supplied. |
| Remember | Retain only necessary project context and provenance; separate identities. | Product-specified separation; exact retention unverified. |
| Reason | Use source context to infer risk, participants, resolution route, and acceptance standard. | Feature-owner-confirmed workflow. |
| Generate | Prepare concise reminders and leader notices grounded in the issue. | Feature-owner-confirmed workflow. |
| Modify | Update a tracked risk or work item only with current evidence. | Underlying work-tracking rule; Friday trace not supplied. |
| Send externally | Verify audience and apply safety/privacy confirmation decision. | Feature owner confirms conditional confirmation; detailed policy unavailable. |
| Execute transactions | No transaction such as payment or personnel change is part of this feature. | Out of scope for this deep dive. |

## Storage, models, retention, and internal access

The reviewed product material does **not** establish a verified answer for data region, encryption algorithm and key management, tenant isolation design, model providers, exact model payloads, training-use restrictions, employee access, employee-access logs, default retention period, export, or full deletion time. Do not infer those answers from a local frontend prototype or from the separate underlying CEO Agent installation.

The Friday Onboarding PRD says P0 Memory is scoped per connector-account and that removal/revocation of previously ingested material is **not automatically back-cleaned** in that P0 scope. This is a material limitation for a promise such as “delete everything immediately.” The product/security team must verify the deployed deletion path before such a claim is made.

**Not available yet — owner: Friday security/engineering — material required:** current data-flow and deployment diagram; permission matrix; provider and model subprocessors; encryption/key controls; retention/deletion test; employee access policy and audit sample.

## Auditability to demonstrate

A real issue should let an authorized reviewer inspect the triggering promise, checked sources and their timestamps, current owner evidence, acceptance standard, reason for risk, authorization path, exact outward message, actual send result, follow-up changes, and closure evidence. The underlying product logic requires external execution and read-back before calling an action executed. A generated draft, HTTP success without a provider receipt, or an “I sent it” model sentence is not proof of delivery.

## Required security scenarios

1. **Employee without Finance permission asks for payroll data:** Friday should neither read nor use inaccessible payroll material to explain a project risk. If a connected tool unexpectedly exposes it, stop and route to access review. The deployment test proving this is **not supplied**.
2. **Confidential data in an outbound reminder:** Friday should use the minimum necessary statement and seek user confirmation or decline according to its privacy policy. The feature owner confirms conditional confirmation; exact policy categories are **not supplied**.
3. **Conflicting permissions:** Use the narrower current permission and stop the dependent action until the access conflict is resolved. The running implementation's conflict behavior is **not supplied**.
4. **Request to delete all Memory:** Do not promise immediate complete erasure; the P0 PRD explicitly lacks automatic retroactive cleanup for revoked/deleted sources. The deletion process and time must be verified with engineering.
5. **Uncertain authorization:** Do not guess. Keep the risk visible, withhold the outward action, and ask for a specific decision or access correction.

## Answer to the customer trust question

> “Why should I let Friday access contracts, financial information, project discussion, and decisions?”

Friday should ask only for the sources needed for the work you delegate, keep each connected work identity separate, show the evidence behind a risk and every outward action, and require confirmation where safety or privacy calls for it. For this feature, access to broad financial or personnel records is not inherently required. Before a customer is asked to enable it, Friday must provide the exact deployed permission, storage, model-use, deletion, and audit facts above. **Those deployment proofs are not in this intake yet**, so no blanket “enterprise-grade” or “zero data risk” claim is justified.

**Sources:** Feature-owner answers (2026-09-24); [Friday Onboarding PRD](../../doc/feature0-onboarding%20page/00-Onboarding%20PRD.md); [Friday product PRD](../../Friday%20%E5%B7%A5%E4%BD%9C%E5%88%86%E8%BA%AB%20PRD.md); [underlying work-tracking logic](/Users/stardust/ceo/docs/product-logic.md).
