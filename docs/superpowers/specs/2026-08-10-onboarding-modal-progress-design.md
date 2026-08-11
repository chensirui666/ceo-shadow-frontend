# Onboarding Modal and Progress Design

## Scope

Refine the existing local-demo onboarding flow without adding connector reads, persistent profile writes, or external sending.

## Decisions

- Every onboarding modal uses the same warm off-white surface. Secondary actions use a pale cream fill with dark text; primary confirm actions use a near-black fill with white text.
- Memory reading begins at zero and advances in small, visible increments over several seconds. It reaches the summary only after the visible bar reaches 100%.
- Step 3 adds an "Extract work style" action beside the existing confirmation action. Extraction shows the same gradual local-demo progress treatment, then opens an editable Prompt preview.
- The editable Prompt is drafted in component state, then copied to the current-session `OnboardingState` when the user confirms the work style. It is not persisted or sent outside the demo.
- "View original Prompt" remains available as a quick preview, but its content is also editable so users have one consistent editing surface.

## Validation

- Server-render tests assert the new extraction action and editor affordance are present for Step 3.
- Browser verification covers a gradual progress state, modal button hierarchy, editing the Prompt, and confirming the four-step flow on desktop and mobile.
