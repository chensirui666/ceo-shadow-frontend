# HeroUI Control Refactor Design

## Goal

Keep Friday's current visual design and behavior while using HeroUI for every suitable interactive control.

## Scope

- Replace native buttons with HeroUI `Button` where the control performs an action or navigation.
- Replace text/search/time inputs with HeroUI `Input`, source choices with `Select`, boolean settings with `Switch`, layer choices with `Tabs`, and the material menu with `Dropdown`.
- Use HeroUI `Modal` for the Settings workspace and existing confirmation prompts, retaining their current class names for Friday-specific visual treatment.
- Keep semantic layout elements, forms, SVG memory graph nodes, and ordinary text as native HTML.

## Behavior and Styling

The migration must preserve current callback flow, disabled states, form submission, labels, keyboard behavior, and localized copy. Existing Friday class names remain only as visual overrides around HeroUI components; obsolete native-control selectors are removed when no longer referenced. No dependency, API, state shape, or routing change is introduced.

## Verification

Existing state tests must remain green. Add a focused source-level regression test only if it can demonstrate a migration contract that existing tests cannot cover; otherwise verify with TypeScript, production build, and browser interaction checks for login, Memory controls, Settings navigation, toggles, selects, and confirmations.
