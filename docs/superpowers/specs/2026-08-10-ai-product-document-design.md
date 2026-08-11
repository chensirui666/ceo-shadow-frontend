# Project Detail and Document Surface Design

## Goal

Keep the project detail page focused on current execution while moving editable project narrative into a file-like document. Project detail and AI Product use the same document preview/edit surface, so future project-related content has one interaction path without introducing a general-purpose CMS.

## Information hierarchy

1. **Project heading** keeps the project name and current status adjacent.
2. **Facts bar** remains the first content block and has five equal-purpose columns: Started, Owner, Participants, Priority, and Detail. The first four show their existing concise values. Detail is a file-style action that opens the project-detail document.
3. **Current progress** is the existing milestone track, renamed from Execution path. It remains one component: selectable milestone steps above, selected-stage explanation below. The two areas have a shared outer boundary and an internal divider so the explanation never competes with or visually overlaps the steps.
4. **Todos** remain the project execution table. The first columns are Todo and Owner; Todo titles use normal text weight. Header text may use a deep warm gray; every body row uses the same warm off-white background. Green state semantics remain available. Each Todo owns direct source IDs; its compact source icon/count reveals linked file names and original excerpts on hover or keyboard focus. Detail stays in the facts bar rather than occupying a Todo column; open Todos use a three-dot menu for completion or cancellation.
5. **Project sources** remain a compact horizontal material rail. Each source type has a conventional icon, label, count, and chevron. There are no interior divider lines; hover or keyboard focus reveals that type's titles only.

## Shared document surface

The shared document surface is a single React page component, not a generic document platform.

- It opens directly in **editable** mode: title and body are native form controls, with no Preview/Edit switch, no exposed document-kind context label, and no manual Save control.
- Each title or body change schedules a session update five seconds after the user stops typing. This debounce avoids repeated writes while the user is actively editing and keeps saving invisible.
- It accepts a document record and save callback from the owning feature. It does not own persistence, version history, uploads, collaboration, rich text, or source-file retrieval.
- The project facts and the narrative currently shown in Project overview move into a project-detail document fixture. The project landing page no longer renders the overview table.
- AI Product uses the same page surface and may open a right-side Copilot conversation panel. The project Detail document does not receive a Copilot in this iteration.
- The Copilot panel follows the supplied reference: a subtle one-step background contrast from the editor, a compact conversation header, scrollable conversation above, and a fixed composer at the bottom. It replaces the prior suggestion-card and feedback-list arrangement.
- The local demo may retain typed messages in the current session, but it does not invent assistant replies or imply a live model call.

This gives project detail and AI Product a common user journey — open a file, preview, edit, save, return — while keeping their data ownership separate and typed.

## Interaction flows

`Project detail → Detail file in facts bar → editable project document → idle for five seconds → session save → return`

`Project detail → AI Product → editable draft → idle for five seconds → session save → optional Copilot conversation → return`

The local demo stores document edits only in the current browser session. A refresh restores fixtures; no external project, file, AI, or delivery system is accessed.

## Layout rules

- The facts bar is preserved; Detail is its fifth column, not a card placed beneath it.
- Current progress preserves the existing milestone behavior. Each marker has a fixed center aligned to the connector, and its status, title, and date sit in a separate text column. The selected-stage detail remains a second row within the same panel, separated by a real boundary.
- Action-item body rows use the lightest warm off-white (`#fffefd`); the header uses the page's outer warm beige (`#f7f4ed`). Green remains reserved for meaningful state/status and action feedback, never as inconsistent row backgrounds.
- Sources use standard file, headphones, presentation, audio-wave, folder, and chevron icons. The rail has spacing but no separators between material types. Hover/focus shows a plausible type-specific filename, for example `.md`, `.pptx`, or `.mp3`; folders retain folder semantics.
- The editable document keeps readable typography, native controls, accessible labels, and an unobtrusive autosave state for assistive technology only.
- All routes and triggers remain keyboard-accessible, with visible focus and an accessible return action.

## Boundaries

- No rich-text dependency, collaboration, history, upload, real model call, source-file access, external send, or backend persistence is added.
- No generic database, document registry, or content-type factory is introduced. The shared UI surface and a small typed document record are sufficient for the two current owners.
- Existing task completion/cancellation, milestone selection, and project sorting remain unchanged. Source hover now presents file-like names, while the AI Product replaces feedback cards with the local conversation layout described above.

## Acceptance criteria

- The facts bar shows Started, Owner, Participants, Priority, and a keyboard-accessible Detail file action in one consistent row.
- The Project overview table is absent from the project landing page; its project information is available in the editable Detail document instead.
- Execution path is renamed Current progress without creating a duplicate milestone feature; selected-stage explanation is clearly below the steps within the same panel.
- Project Detail and AI Product both open the same directly editable document experience and save changes after five seconds of editing inactivity, only for the current frontend session.
- Action-item rows have one warm off-white body background while green status meaning remains visible. Hovering or focusing an action item's source icon/count reveals only that item's linked filenames and original excerpts.
- Sources have no internal divider lines and show type-appropriate filenames on hover/focus.
- The AI Product Copilot is a right-side conversation layout with header, conversation region, and bottom composer; it has no fabricated assistant response and does not appear on Project Detail in this iteration.
