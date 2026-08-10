# Connect apps visual refresh

## Goal

Refresh only onboarding Step 1 so the first screen feels more lively and intentionally guided, while preserving the existing connection flow and all local-demo limits.

## Scope

- Keep the four-step onboarding shell and its fixed desktop height.
- Recompose Step 1 as a desktop two-column panel: 52% task content on the left and 48% illustration on the right.
- Use muted violet as the Step 1 accent for the current step, primary actions, connected state, and the illustration glow.
- Generate one project-local, text-free illustration: Friday as the central node, visibly connected to DingTalk, Feishu, and Teams.
- Stack the content and illustration on narrow screens without changing connection behavior.

## Interaction and product boundaries

- Keep the existing real app names, source scopes, connector marks, confirmation modal, and “connect at least one app” gate.
- Keep the local-demo disclosure visible. Connecting still only changes in-memory frontend state; it does not authorize, read, write, or send anything externally.
- Do not alter Steps 2–4, the Home event area, Trial behavior, or formal-mode boundaries.

## Visual behavior

- The left column keeps the title, explanatory text, source rows, and footer action in their current information order.
- Source rows stay compact and readable. Purple is an emphasis color, not a replacement for status semantics elsewhere in the product.
- The right illustration is decorative and has no user data, UI text, fake activity, or claims of live connection success.
- At mobile widths, the panel may scroll internally but its outer frame remains stable across all four steps.

## Implementation and verification

- Add one raster illustration asset under the project and render it only in Step 1.
- Limit layout and color rules to onboarding Step 1 selectors so the rest of Friday does not change.
- Extend the onboarding SSR test to assert the Step 1 illustration is present, then run `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check`.
