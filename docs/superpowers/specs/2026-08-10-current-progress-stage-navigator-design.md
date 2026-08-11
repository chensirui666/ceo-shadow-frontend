# Current Progress Stage Navigator Design

## Goal

Replace the current horizontal milestone track and separate detail strip with the approved two-column stage navigator. A project owner can select a milestone and immediately read that stage's situation, completion fraction, deadline, and linked-action entry point.

## Scope and boundaries

- Applies only to the `Current progress` module in the project detail page.
- Reuse the existing `TaskMilestone`, `milestoneProgress`, localized milestone labels, and session-only Todo data.
- No new dependency, animation library, backend API, state store, or persistence is introduced.
- The generated image is a layout reference only, not a production asset.

## Desktop layout

The module stays within one warm-white bordered container with two columns.

1. **Stage navigator (36%)** — a vertical, keyboard-operable list of milestones. Each row contains a status icon, title, localized status, and date. A faint vertical connector joins icons. Every row reserves the same right-side gutter, so dates stay aligned while selection changes. The selected row uses the outer page's pale beige and a 3px amber inset marker; completed stays green and upcoming neutral.
2. **Selected-stage panel (64%)** — a single focused view, separated by one hairline. It contains the selected title, summary, labelled `x/y` progress, deadline, and an action that scrolls to Action items.

The right panel is the only place a milestone summary and fraction appear. The navigator must not render a second detail panel beneath itself.

## Interaction and accessibility

- The navigator uses tab semantics: each milestone button is a `role=tab` with `aria-selected` and controls one `role=tabpanel` detail region.
- Click, keyboard focus, and Enter/Space update the selected-stage panel. Selecting a new project restores its active milestone, falling back to the latest one.
- `View linked action items` scrolls to the existing Action items section. It never mutates Todo state or invents a filter.
- Completed, active, and upcoming states are communicated with text plus icons and color.

## Responsive layout

At 720px and below, the columns stack. The navigator appears first with a bottom separator; the selected-stage panel follows. Rows preserve a usable hit target without horizontal overflow.

## Visual rules

- Surfaces: `#fffefd` outer/detail, `#f5f4f1` selected row, `#e4e0d8` separators.
- Text: `#403b34` title, `#625d54` body, `#8d867c` metadata.
- State: `#5f8a60` completed and `#a77d35` active. No blue, gradients, drop shadows, dashboard charts, or decorative illustration.
- Keep one container, one inner separator, no nested empty cards, and no duplicate Current progress headings.

## Verification

- SSR component test verifies tablist/tab/panel semantics, selected-stage content, localized deadline/progress, and linked-action control.
- Existing Task tests, typecheck, production build, and whitespace diff check pass.
