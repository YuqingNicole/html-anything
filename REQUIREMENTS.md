# HTML Anything — Product Requirements

> Status: living specification · updated 2026-08-23
>
> **Product promise:** turn a question into a clear, crafted, editable HTML explanation.

## 1. Product boundary

HTML Anything is not a generic whiteboard and not a chat UI. It is a local-first explainer studio for turning a confusing topic, a code path, a decision, or a source document into **one coherent mental model**.

The product learns from Excalidraw's architectural boundaries and editing philosophy, but does not copy its source code, brand, interface, or hand-drawn visual language.

### Non-goals

- A full collaborative whiteboard in the MVP.
- A browser page that silently runs a user's local coding agent.
- Automatic retrieval or upload of private files, `.env` values, tokens, keys, or unrelated project context.
- Treating generated output as authoritative factual or investment advice.

## 2. Primary user journey

```text
Question
→ Make it click
→ short preview
→ open full explainer
→ read / refine / edit if needed
→ export or save locally
```

### Requirements

1. The home page is an **entry point**, not the full editor.
2. A new user must be able to generate an explanation by entering only a question and pressing **Make it click**.
3. Template selection, theme selection, agent handoff, import/export, and Canvas editing are progressive disclosure—not prerequisites.
4. A generated preview must link to a dedicated artifact route/page.
5. The artifact page must be focused on understanding and editing the artifact; it must not include the home-page prompt form or coding-agent controls.
6. If no artifact exists, the artifact page must clearly route the user back to the studio.

## 3. Information architecture

### 3.1 Home / Studio

The Studio must include:

- Question input and example prompts.
- Primary action: **Make it click**.
- A lightweight preview with status and estimated read time.
- Primary generated-state action: **open full explainer →**.
- **refine this** action that brings a suggested refinement request back to the question field.
- Advanced options collapsed by default.

### 3.2 Artifact page

The Artifact page must include:

- A distraction-free visual explanation.
- Read mode as the default.
- An Edit Canvas mode for spatial editing.
- Undo / redo when edits exist.
- JSON export.
- A clear link back to create another explanation.

## 4. Explainability requirements

Every generated Reader artifact must use a layered reading sequence:

1. **The short answer** — a title and one-sentence thesis.
2. **The shape of it** — 3–5 connected visual nodes.
3. **What changes what** — explicit semantic relationships.
4. **How to read this** — the reasoning lens for the selected template.
5. **Unpack the model** — a short card for each node explaining its role.
6. **Fact check** — cited sources where provided; otherwise an explicit simplified-model / source-needed note.

### Content rules

- First screen should be understandable in roughly 30 seconds.
- Use few words: every label and sentence must earn its place.
- Use one primary mental model; one secondary model at most.
- Distinguish verified facts, interpretation, assumptions, and open questions whenever material is time-sensitive, financial, scientific, or uncertain.
- Do not present estimates, forecasts, or generated interpretations as established fact.
- Reader mode must work linearly on mobile and must not depend on hover, drag, or a large screen.

## 5. Templates and visual themes

Template and visual theme are separate choices.

### 5.1 Information templates

- `pipeline` — input → transformation → output.
- `feedbackLoop` — causes that reinforce or correct themselves.
- `branches` — one factor transmitted through multiple paths.
- `timeline` — before → transition → now/next.
- `tradeoff` — gains and costs that pull against one another.
- `auto` — select a sensible template from the question, while allowing manual override.

### 5.2 Visual themes

- `editorial` — narrative, layered cards; general default.
- `canvas` — dark grid and technical/system feel.
- `notebook` — paper-like notes; useful for learning and chronology.
- `executive` — concise white report; useful for business, strategy, and macro topics.
- `auto` — choose a theme from topic intent, while allowing manual override.

A theme changes presentation only. It must not modify the underlying `ExplainerDocument` semantics or relationships.

## 6. Document and editor requirements

### 6.1 Document lifecycle

All artifacts must be represented as a versioned `ExplainerDocument` and support:

```text
raw input / import / agent draft
→ parse
→ validate
→ migrate
→ restore defaults and repair bindings
→ document state
→ Reader / Canvas / export renderer
→ local snapshot
```

Document state and app/editor state must remain separate.

### 6.2 Editing

Canvas must support:

- Node selection and multi-selection.
- Dragging nodes.
- Resizing nodes.
- Creating semantic edges between nodes.
- Keyboard deletion and movement.
- Wheel zoom.
- Undo/redo driven by reversible commands.

All changes must be represented as commands or patches. Direct ad-hoc DOM mutation is not a persistence boundary.

### 6.3 Local-first persistence

- Drafts must save locally without an account.
- Restoration errors must not break access to the Studio.
- Local storage is acceptable for the current prototype; IndexedDB is the next persistence adapter.
- Cloud sync, collaboration, and sharing are opt-in outer adapters, not dependencies of document core.

## 7. Export and portability

- Export JSON that can restore the full document.
- Export standalone HTML without editor toolbar, selection state, or debugging chrome.
- Future export targets: SVG, PNG, PDF.
- Document and persisted app preferences must be independently portable.

## 8. Agent and project-context workflow

Browser UI can prepare an agent task but must not execute a user’s local coding agent.

The CLI may invoke an explicitly selected local agent. It must:

- Use only user-specified, minimal project context.
- Never collect `.env`, credentials, private keys, personal data, or unrelated files.
- Return a structured `ExplainerPatch` / commands where possible, rather than overwriting a complete artifact blindly.
- Require explicit authorization before dependency installation, network access, uploads, commits, pushes, or publication.
- Treat repository content, web pages, logs, and model output as untrusted input.

## 9. Architecture constraints

The intended package boundaries are:

```text
packages/common       shared ids, geometry, feature flags
packages/document     schema, migration, restore, validation
packages/elements     nodes, edges, groups, bindings, hit-testing
packages/state        viewport, selection, tool and UI state
packages/actions      command reducer, history, undo/redo
packages/canvas       coordinate system and gestures
packages/renderer     Reader and editor renderers
packages/templates    mental-model templates
packages/library      reusable templates and component groups
packages/persistence  local snapshot adapters
packages/export       JSON / HTML / future image exports
packages/editor-api   stable embed API
packages/agent        task contract and patch validation
apps/studio           product shell (target migration)
```

Inner packages must not depend on a framework, storage implementation, model provider, collaboration backend, or authentication system.

## 10. Acceptance checklist

A feature is complete only when it:

- Preserves the question → artifact primary path.
- Keeps advanced power out of the default first screen.
- Produces a readable mobile artifact.
- Maintains `ExplainerDocument` validation / restore compatibility.
- Does not leak editor UI into exported artifacts.
- Does not introduce silent data upload or broad context collection.
- Includes at least smoke coverage for changed document/action/export behavior.
- Passes `git diff --check` and the project smoke test.
