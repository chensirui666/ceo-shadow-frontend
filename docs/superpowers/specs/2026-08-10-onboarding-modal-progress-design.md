# Onboarding Modal and Progress Design

## Scope

Refine the existing local-demo onboarding flow without adding connector reads, persistent profile writes, or external sending.

## Decisions

- Every onboarding modal uses the same warm off-white surface. Secondary actions use a pale cream fill with dark text; primary confirm actions use a near-black fill with white text.
- Memory reading begins at zero and advances in small, visible increments over several seconds. The black progress bar stays visible after it reaches 100%; the result and its action appear directly below it in the same modal.
- Step 2 shows each connected app as a logo-led, read-only source card followed by compact message, document, and calendar signals. The panel itself does not repeat the local-demo note.
- Step 3 shows four icon-led distilled habits. Its main action area contains only "Distill work style" and "Skip"; extraction keeps the same black progress bar above an editable Prompt preview in one modal.
- The editable Prompt is drafted in component state, then copied to the current-session `OnboardingState` when the user confirms the work style. It is not persisted or sent outside the demo.
- Skipping the work-style distillation opens Trial but does not enable formal mode. The user can return to Step 3 and complete the distillation later.

## Validation

- Server-render tests assert the new extraction action and editor affordance are present for Step 3.
- Browser verification covers a gradual progress state, modal button hierarchy, editing the Prompt, and confirming the four-step flow on desktop and mobile.
