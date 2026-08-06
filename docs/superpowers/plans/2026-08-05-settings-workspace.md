# Settings workspace implementation plan

> Existing `doc/feature2-settings page/01-Settings PRD.md` is the approved product design. This plan keeps the app browser-local because no connector or preference API exists.

## Files and responsibilities

- `src/settingsState.ts`: validated demo defaults, summaries, and localStorage persistence.
- `src/settingsState.test.ts`: Node assertions for the preference contract.
- `src/components/SettingsWorkspace.tsx`: overlay navigation, details, draft edits, inline confirmations, and save feedback.
- `src/components/Workspace.tsx`: opens the Settings workspace while preserving the background route.
- `src/content/translations.ts`: complete English and Chinese user-visible Settings copy.
- `src/index.css`: compact, responsive modal-workspace styling.

## Tasks

1. Add failing Node tests for default preference values, safe normalization, notification counts, and persistent settings round-trip; run the focused test and confirm its expected missing-module failure.
2. Implement the smallest pure `settingsState` module to make those tests pass; run focused and full tests.
3. Build the focused Settings overlay and its three sections: connection list/details, General summary/editors, and Profile/Safety detail. Keep all confirmation flows in the right panel.
4. Connect the global Settings control without replacing the background route; persist saved settings and remember the selected primary section.
5. Add scoped styling and localizations, then verify desktop and narrow layouts with keyboard close, backdrop close, discard flow, saving, connecting, disconnecting, and cross-page links.
6. Run `npm test`, `npm run typecheck`, `npm run build`, and a fresh browser check before completing the work.
