# Unified Four-Step Onboarding Design

## Goal

Keep the existing welcome dialog, then present every onboarding step in one stable desktop frame inspired by the approved references. The frame must remain orderly while the user moves from connection through Trial: the top progress, left checklist, hero-card bounds, lower-card grid, and action zones do not resize or change style between steps.

This remains a local frontend demo. Connector actions, Memory reading, style extraction, Trial replies, and activation retain their existing state-machine behavior; the design must not imply real OAuth, content ingestion, or colleague message delivery.

## Scope and boundaries

- Keep the existing welcome dialog and its local/session behavior unchanged.
- Keep the existing English/Chinese translation structure. New visible copy belongs in `translations.ts`; no hard-coded language in components.
- Keep the four current state transitions: connect a source, confirm Memory, confirm work style, submit a Trial question, then complete activation.
- Do not add a dependency, API, persistence layer, or a generated image as a runtime asset.
- Preserve all unrelated dirty-worktree changes. This change only owns the unified onboarding layout and its focused tests.

## Layout contract

At desktop widths, `OnboardingHome` has one fixed visual hierarchy after the welcome dialog is dismissed:

1. A horizontal four-step progress row.
2. A single hero card with one fixed desktop height and consistent outer radius, border, background treatment, content column, and illustration column for all four steps.
3. A lower grid with a fixed-width checklist at left and four fixed support cards at right: supported apps, security and permissions, example Memory insights, and teams that use Friday.

The hero never changes outer height, width, padding, illustration split, or action-row position by step. Step-specific content may be shortened or omitted to fit its assigned content area; it may not introduce a second panel, expand the frame, or cause a lower-card reflow. The lower support cards are static across steps. The checklist changes only completed/current/future state and the `n / 4 completed` count.

On narrower screens, the same order becomes a vertical flow: progress, hero, checklist, then support cards. The hero may grow naturally only in this compact layout; all desktop invariants remain intact.

## Step content

| Step | Hero content | Checklist state | Primary action |
| --- | --- | --- | --- |
| 1. Connect work sources | Three existing source rows and the existing local-demo boundary note. | Step 1 current; 0/4. | Existing connect confirmation, then Continue. |
| 2. Build work Memory | Connected sources, read-only scope, concise signals, and the approved “Bring existing Memory with you” callout. | Step 1 complete; step 2 current; 1/4. | Existing Build Memory flow, then Confirm. |
| 3. Confirm work style | Four existing work-style points in a compact grid and the approved “Work style” benefit callout. | Steps 1–2 complete; step 3 current; 2/4. | Existing distill/review/Use Prompt flow. |
| 4. Try it out | Existing suggestion prompts and a compact 52px composer. | Steps 1–3 complete; step 4 current; 3/4. | `Send to Friday` is embedded at the composer’s right edge; no separate full-width send button. |

The activation action remains subordinate to the Trial result and keeps the existing confirmation and celebration flow.

## Color and typography rules

All new or changed onboarding color declarations use the existing Friday semantic tokens in `src/index.css`: canvas, surface, muted surface, selected surface, ink, muted text, border, success, pending, danger, button colors, radii, spacing, and focus ring.

The dark hero and its overlays are expressed as onboarding-scoped semantic variables derived from existing tokens and `color-mix`, rather than new raw hex values. The active/current accent uses the existing pending token; completed states use the existing success token; normal text, borders, surfaces, focus, buttons, and fields use their existing semantic equivalents. Connector logos and existing editorial illustrations are exceptions because they are image content, not authored UI color.

Use the current `EB Garamond` display face only for hero titles and the current Figtree-based UI font elsewhere. Existing radius and spacing tokens define the common visual rhythm; do not introduce per-step radius, padding, font-size, or shadow values.

## Implementation shape

Keep `OnboardingHome` as the state owner. Add only small local presentational markup or helpers when it eliminates real duplicated JSX; do not introduce a new state layer, service, route, or component hierarchy solely for the frame.

The existing onboarding illustrations remain the right-side hero artwork. CSS owns the shared frame, all static support cards, stable grid dimensions, and a common hero content column. Step-specific selectors may set content visibility only; they cannot redefine the frame dimensions. The fourth-step composer contains the existing textarea and its submit button in one control wrapper; `Enter` behavior remains whatever the current textarea supports, and click/press retains existing `submitTrial` validation.

## Accessibility and failure behavior

- Preserve native button and textarea semantics, visible keyboard focus, disabled states, modal focus behavior, and reduced-motion activation behavior.
- Step navigation remains unavailable for unreached steps and available for completed/reached steps.
- An empty Trial question leaves the embedded send button disabled.
- A connector or Memory action remains explicitly local-demo only in copy; no UI claims authorization, read access, stored content, or actual sending.
- Locale changes must keep each frame text coherent and avoid overflow at the supported desktop width.

## Verification

Extend the existing onboarding SSR tests to assert the shared frame hooks, all four support-card headings, the migration and work-style callouts, and that the send action is rendered inside the composer wrapper rather than as a separate full-width control. Retain state tests for all existing transition gates and add a focused assertion for checklist progress derived from each valid step state.

Run `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check`. Then use a desktop browser to verify all four reached steps: fixed hero/lower-grid geometry, progress/checklist synchronization, English/Chinese rendering, modal flows, disabled/embedded Trial send control, and no console errors. Compact-width inspection verifies the intentional vertical fallback.
