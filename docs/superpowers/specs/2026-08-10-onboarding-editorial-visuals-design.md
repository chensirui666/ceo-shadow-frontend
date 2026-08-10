# Onboarding editorial visual system

## Goal

Give all four Home onboarding steps one coherent, high-end visual language without changing the local-demo interaction model, progression rules, or Trial safety boundary.

## Confirmed approach

Each step occupies the existing fixed-height onboarding panel. A project-local, text-free editorial raster spans the panel; the real UI remains semantic HTML on the left. The imagery is decorative only and never represents a connection, read, Memory write, answer, or external send as having happened.

## Visual rules

- Use EB Garamond for onboarding headings, with the existing CJK serif fallback.
- Use espresso, ivory, caramel, amber, and muted petrol teal. Purple is not an interface accent; the Teams mark may retain its native brand color.
- Preserve the Step 1 composition: dark, readable content region on the left; a quiet product-specific visual on the right; ivory actions on the dark surface.
- Keep all visual copy out of the generated raster. Existing translated UI copy remains the single source of truth.

## Per-step subject matter

- Step 1 — Connect apps: connector choices, already implemented.
- Step 2 — Build Memory: abstract message, calendar, and document signals converge into a bounded Memory collection.
- Step 3 — Confirm work style: a calm work-style summary and an original-Prompt document are represented as structured editorial cards.
- Step 4 — Trial: a private, unsent drafting surface with a discreet lock cue, never a claim of a live message or reply.

## Scope and safety

- Keep `OnboardingHome` state transitions, the confirmation dialogs, Memory read/build modal, Prompt modal, activation modal, Home event detail, and all translated copy unchanged.
- Preserve the 468px desktop panel height and the existing narrow-screen internal scrolling behavior.
- Trial remains session-local and never sends externally. Connected apps remain local frontend mock state.

## Verification

- Extend the SSR test to assert a decorative asset is present for each of Steps 2–4.
- Run `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check`.
- Inspect Step 2, Step 3, and Step 4 at desktop and narrow widths; ensure the action text remains readable and the panel stays stable.
