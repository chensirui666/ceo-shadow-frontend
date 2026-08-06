# Memory P0 design

## Scope

Implement the `Memory` route from `doc/feature2-memory page/02-Memory PRD.md` as a browser-local, bilingual interactive prototype. It makes the distinction between **上下文** and **用户 Memory** visible through one relationship map. It does not add a backend, real connector access, persistence, node interactions, a document library, or advanced filtering.

The existing Settings workspace remains unchanged. Memory is a normal workspace page.

## Chosen approach

Render the map as an SVG scene with curated, stable positions. Its node and edge data remain independent from visual positions: future API data should describe Memory, not encode screen coordinates. Filtering, searching, and switching layers keep surviving nodes in place and fade the scene rather than forcing a new layout.

This avoids two unsuitable alternatives:

- A force-directed layout would move the map on every filter and conflict with the PRD's stable, low-motion interaction.
- Canvas would add no useful capability for a small, non-interactive map and would make semantics and CSS styling less direct.

## Components and state

### `src/memoryState.ts`

This is the only source of Memory domain behaviour. It owns the five sources, two layers, fixture nodes, fixture edges, and the pure helpers used by the UI and tests:

- derive visible nodes from the selected layer, a single source filter, and a case-insensitive keyword search against title and summary;
- retain only edges whose endpoints are both visible;
- append the prepared fixture result for a completed file or migration task;
- represent an idle, processing, completed, or failed material task without exposing internal status controls.

The fixture records use the same conceptual fields as a future response: node id, layer, source, title, summary, and relationship endpoints. Coordinates stay out of this module.

### `src/components/MemoryWorkspace.tsx`

This component owns the current layer, source, keyword, add-menu visibility, modal step, and active material task. It assembles the page and delegates rendering of the diagram to `MemoryGraph`.

It does not persist Mock Memory into `localStorage`: refreshing returns the known baseline demo state instead of presenting simulated records as durable user memory.

### `src/components/MemoryGraph.tsx`

This is a pure visual component. It maps each fixture node id to a stable SVG position and renders the filtered edge set and visual node tiers. The scene has:

- a few labelled core nodes;
- quieter connection and leaf nodes;
- low-saturation source colours defined by semantic CSS variables;
- thin warm-grey edges; and
- an updating screen-reader summary of the active layer, source filter, and search result.

The SVG is non-interactive: no node click, hover detail, drag, edit, or delete handlers are added.

## Page behaviour

The existing workspace header provides the `Memory` page title. The page body adds the specified one-line explanation, then a single toolbar:

1. left: text tabs for `上下文` and `用户` with an underline for the active tab;
2. right: single-select source filter, labelled search field, and the only solid primary action, `添加资料`.

The map occupies all remaining primary content space directly below a thin divider. There are no statistic cards, map-card frame, bottom legend, side panel, or secondary primary action. Source names and coloured dots live inside or adjacent to the source filter.

Layer, source, and keyword filters compose with AND semantics. A source or keyword empty result shows its specified message and exactly one relevant clear action. An empty layer uses the layer-specific empty message.

## Adding material

`添加资料` opens a small menu with exactly `上传文件` and `数据迁移`.

- Upload opens a single modal. A file must be selected before `开始添加` becomes available.
- Migration opens a two-step modal: copy the fixed work-only Markdown prompt, then select a Markdown file before `开始迁移` becomes available.
- Both flows start the same local task. While processing, the old map stays visible with the in-page processing message. Completion appends the prepared fixture as `文件` or `对话`, respectively, and briefly shows `已加入 Memory`.
- An empty selected file is treated as material that could not form Memory. It produces the specified failure state and leaves the prior map untouched. `重试` repeats the same task. This is a user-triggerable, deterministic failure path, not a visible prototype scenario switch.

The brief async delay only makes the task transition perceptible; the Mock is the structured outcome and state transition, not an animation pretending to be a service.

## Visual and accessibility rules

- Add the five source colour tokens and an edge token once in scoped Memory CSS; components use source classes rather than scattered colour literals.
- Use the existing warm workspace, typography, focus treatment, button language, and HeroUI modal primitives.
- Keep desktop first while preserving a readable toolbar and full-width map at narrow widths.
- All controls have visible text or accessible labels. Keyboard focus remains visible. Reduced-motion users receive an immediate scene update.
- The SVG is presentation-only and has a nearby, live, concise text summary; colour is never the only source identifier.

## Tests and verification

Before production code, add focused Node tests for the pure state module. They must prove that:

1. layer, source, and keyword filtering retain only matching nodes;
2. hidden-node edges are removed;
3. clearing a keyword leaves the current layer and source unchanged;
4. successful upload and migration add the correct source; and
5. processing and failure preserve the prior graph.

After each test is observed failing, implement only the corresponding state behaviour. Then run the full test suite, TypeScript check, production build, and a browser pass covering tabs, filter/search empty states, both modals, success, failure/retry, and keyboard controls.

## Explicit non-goals

No D3, canvas, force engine, local persistence, backend API, actual file ingestion, document list, node detail, delete/export, ChatGPT/tool selectors, time/type/multi-select filters, or user-facing scenario controls are included in P0.
