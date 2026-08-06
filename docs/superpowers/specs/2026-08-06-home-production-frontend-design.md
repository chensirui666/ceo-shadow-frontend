# Home production frontend design

## Goal and scope

Implement Feature 3 from `doc/feature3-home page/03-Home PRD.md` as Friday's daily work-event experience. Home must make the current operating mode, recent 24-hour message processing, exceptions requiring a decision, and reply feedback understandable without exposing audit-log or model internals.

This branch is intentionally independent of the uncommitted Settings work. It therefore owns a typed, local implementation of the Home data boundary. It does not read Settings' browser storage, make live connector calls, or send external messages. The visible demo notice makes that limitation explicit.

## Chosen architecture

### `src/homeState.ts`

This is the Home domain model and pure behaviour. It defines:

- an `OperatingMode` of trial, active, or paused;
- a `HomeEvent` with independent event status and processing outcome, so `已处理` remains the normal terminal state while `已发送`, `已取消，Friday 未发送`, `你已回复，Friday 未发送`, and `无需回复` remain results;
- connected sources, source filtering, 24-hour bucket aggregation, countdown formatting inputs, and the data required by the list and detail views; and
- immutable transitions for changing run mode, resolving a confirmation by sending or cancelling, and recording owner feedback.

Connection exceptions remain events but are excluded from chart counts. Filtered chart totals and rows always derive from the same source filter. Transitions update one event by id; they never create a second history row.

### `src/homeService.ts`

This module is the only data dependency of Home components. It exports asynchronous operations to load a Home snapshot, change the operating mode, resolve a confirmation, and submit owner feedback. Its current implementation uses a reset-on-refresh fixture that includes all P0 states: waiting, processing, confirmation required, trial completion, no-reply, sent, send failure, and connection exception.

Components do not import fixture data or mutation helpers directly. When a backend contract is agreed, this one module changes from local fixture operations to requests and response mapping; component interfaces and `homeState.ts` stay stable. No speculative HTTP URLs, storage persistence, or repository abstraction are introduced before that contract exists.

### Components

- `HomeWorkspace.tsx` coordinates loading, failure and empty states, selected detail, source filter, operating-mode confirmation, and the service calls. It records the Home canvas scroll position before opening detail and restores it on return.
- `HomeActivityChart.tsx` renders exactly 24 stacked hourly bars. Each bar is keyboard-focusable, has a textual label with the three exact counts, and shares the filtered event input with the list.
- `HomeEventList.tsx` renders the compact, divider-separated three-line stream. Each complete row is a semantic button with a source mark, optional conversation, sender, time, status/countdown, one-line question, and one-line reply/result.
- `HomeEventDetail.tsx` renders the independent detail reading flow: event metadata, original message, plain-language rationale, response, conditionally available action, owner feedback, and recipient-feedback preview for sent replies.

All user-facing copy, including status labels and accessible names, belongs in `src/content/translations.ts` for English and Chinese. Components receive localized copy and domain objects; they do not hard-code product language.

## Interaction model

Home begins in the 24-hour list view with the run-mode control and `全部应用` selected. The source menu contains only the connected sources returned by the snapshot. Changing it refreshes the chart and rows together. If a selected source has no events, the page provides the scoped empty message and a return-to-all action.

Entering active mode or switching back to trial opens an explicit confirmation. The local action updates only the frontend snapshot, and the page keeps a persistent disclosure that no message is actually sent to DingTalk, Feishu, or Teams.

Opening a row replaces the list with the detail component inside the existing workspace canvas. Back returns to the same source filter and prior scroll position. Only `待你确认` exposes editable reply text with Send and Cancel. Either action changes the same event to `已处理` and sets the correct result. Failure and connection-exception details deliberately contain no retry or reconnect control.

Owner feedback is available only when a reply exists. `需要调整` reveals a text field; successful local submission confirms that feedback was recorded without changing the completed reply. Sent events render a recipient-feedback preview, including helpful/not resolved choices and the required explanation for the latter, but its controls have no submission path in this frontend-only stage.

## Visual and accessibility rules

The list, not a dashboard card grid, is the primary layout. The chart is compact and uses only the PRD semantic tokens: processed `#82957D`, pending `#B59663`, failed `#BC8D86`, grid `#D9D6CE`, focus `#839EB3`, and axis `#9990A8`. It always has a textual legend with filtered totals; colour never carries status alone.

Use the existing workspace typography, spacing, native select and textarea controls where sufficient, and the installed HeroUI Button and Modal primitives for actions and confirmations. List rows, chart bars, and controls retain visible focus and native keyboard operation. Narrow layouts preserve a readable activity chart and single-column detail reading order.

## Tests and verification

Before implementation, add focused Node tests for `homeState.ts` and watch each test fail first. They must prove that:

1. source filtering drives both visible events and 24-hour totals, while connection exceptions do not enter totals;
2. a send or cancel transition updates only the selected confirmation event into `已处理` with the correct distinct outcome;
3. the trial and active mode transition rules produce the required confirmation path; and
4. owner feedback is recorded without changing the reply or outcome.

Then run the full test suite, TypeScript check, production build, and a browser pass over source filtering, chart focus labels, mode confirmation, confirmation send/cancel, detail return/scroll, owner feedback, recipient preview, and loading/error/empty states.

## Explicit non-goals

No Settings integration, live API, real authorization, external sending, external-feedback submission, localStorage persistence, HTTP contract invention, event history/search/pagination/bulk operations, retry/reconnect controls, model/prompt/risk data, or user-facing scenario switcher is included in this change.
