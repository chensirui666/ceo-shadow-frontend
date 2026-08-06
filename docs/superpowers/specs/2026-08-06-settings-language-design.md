# Settings language selection

## Goal

Let a signed-in user choose English or Chinese from a dedicated Language item in Settings.

## Experience

- Add `Language` / `语言` as a fourth top-level Settings navigation item, after General.
- Its detail view contains a compact `EN / 中文` segmented control matching the supplied reference.
- Choosing either option updates the entire interface immediately and persists the choice in the existing `friday-language` localStorage key. There is no Save action or confirmation.
- Remove the language switcher from the signed-in workspace header. Keep it on the sign-in page so a new user can choose a language before opening Settings.

## Implementation boundaries

- Reuse `Locale`, `loadLocale`, and `saveLocale`; do not add a second preference store or dependency.
- Keep `SettingsWorkspace` as the coordinator. Add a small `SettingsLanguagePanel` for the new detail view and pass the existing locale change callback from `Workspace`.
- Put all user-visible text and aria labels in `src/content/translations.ts`.

## Validation

- Add a state-level regression test proving invalid stored language falls back to English and a selected language survives save/load.
- Run the targeted test suite, full tests, TypeScript typecheck, production build, and a browser check that selecting Chinese in Settings changes visible copy and remains Chinese after reload.
