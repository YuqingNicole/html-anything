# ELI5 Studio

> 中文 / English

把复杂问题变成一张容易看懂的可视化解释卡片。

Turn complex questions into visual HTML explainers that are easy to understand.

> Inspired by the `/eli5` idea: explain a topic to someone who knows nothing about it, using an HTML artifact with big pictures and few words.

## 怎么用

### 在线打开

直接打开仓库中的 [`index.html`](./index.html) 即可使用。也可以用 GitHub Pages 部署后分享给别人。

### 本地运行

```bash
git clone https://github.com/YuqingNicole/html-anything.git
cd html-anything
open index.html
```

如果浏览器限制了本地文件功能，可以启动一个简单的静态服务器：

```bash
python3 -m http.server 8000
```

然后访问 <http://localhost:8000>。

## 使用流程

1. 在 **Your question** 输入想弄明白的问题，例如：`How does an API work?`
2. 选择受众和解释风格。
3. 点击 **Generate explainer**，或按 `⌘ + Enter`（Windows/Linux 使用 `Ctrl + Enter`）。
4. 右侧会生成一个视觉化的 mental model。
5. 点击 **copy AI prompt**，复制可用于 Claude 等 AI 工具的 `/eli5` prompt。

页面也提供了三个示例问题：the internet、airplanes 和 APIs，点击即可自动填入。

## User cases / 用户案例

更多完整案例见 [`examples/README.md`](./examples/README.md)：

- 用 Pipeline 解释 API、产品功能和数据流
- 用 Feedback Loop + Branches 拆解“美债如何影响经济”
- 用 Timeline + Decision Tree 解释 bug 与排错路径
- 用 Branches + Trade-off 拆解商业模式
- 把文章、播客 transcript 和代码库转成 mental model

```text
问题 + 最小必要上下文
→ 选择主视觉模板
→ ExplainerDocument
→ Reader 阅读
→ Canvas 编辑
→ JSON / standalone HTML 导出
```

## 当前版本说明

这是一个无需构建工具、无需安装依赖的静态 prototype：

- `index.html`：页面结构
- `styles.css`：视觉设计与响应式布局
- `script.js`：交互、示例内容和 prompt 复制

当前生成内容使用内置示例，不会调用 AI API。下一步可以接入 Claude、OpenAI 或其他模型，让任意问题都能动态生成 HTML explainer。

## Coding agent 工作流

页面下方的 **HAND OFF TO** 可以选择 Claude Code、Codex CLI、Gemini CLI、OpenCode、Cursor 或 Windsurf：

- **copy agent prompt**：复制适配过的命令或操作提示。浏览器不会直接执行本机命令。
- **download task .md**：下载一份可审阅、可提交给 coding agent 的任务包，包含问题、受众、风格和验收标准。

如果本机已安装 agent，也可以直接使用 CLI：

```bash
node cli.mjs explain "How does an API work?" --agent claude --out explainer.html
```

支持 `claude`、`codex`、`gemini` 和 `opencode`。CLI 只会把明确的任务交给本地 agent，并将返回的 HTML 写入指定文件；运行前请确认当前目录和 agent 权限。

## 设计原则

- **Big pictures**：让视觉结构承载理解。
- **Few words**：减少解释负担。
- **One mental model**：先理解整体形状，再补充细节。

---

# English

## What is ELI5 Studio?

ELI5 Studio turns a complex question into a visual HTML explainer: big ideas, few words, and one clear mental model. It is a dependency-free static prototype inspired by the `/eli5` idea.

## Quick start

Open `index.html` directly, or run a local server if your browser restricts local files:

```bash
git clone https://github.com/YuqingNicole/html-anything.git
cd html-anything
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## How to use it

1. Enter a question in **Your question**.
2. Choose the audience and explanation style.
3. Click **Generate explainer**, or press `⌘ + Enter` / `Ctrl + Enter`.
4. Review the visual mental model in the right panel.
5. Use **copy AI prompt** to continue the explanation with Claude or another AI tool.

The current browser prototype uses built-in examples and does not call an AI API.

## Coding agent workflow

The **Hand off to** panel prepares work for Claude Code, Codex CLI, Gemini CLI, OpenCode, Cursor, or Windsurf:

- **Copy agent prompt** copies an agent-specific command or instruction. The browser does not execute local commands.
- **Download task .md** downloads a reviewable task brief with the question, audience, style, and acceptance criteria.

You can also invoke a local coding agent from the CLI:

```bash
node cli.mjs explain "How does an API work?" --agent claude --out explainer.html
open explainer.html
```

Add project context when the explainer depends on an existing codebase:

```bash
node cli.mjs explain "Explain this feature" \\
  --repo ~/my-app \\
  --context src/app.ts \\
  --agent claude \\
  --out explainer.html
```

After previewing the result, iterate with feedback:

```bash
node cli.mjs refine "Make the diagram clearer and reduce the text" \\
  --input explainer.html \\
  --out explainer-v2.html \\
  --agent claude \\
  --open
```

Supported CLI agents: `claude`, `codex`, `gemini`, and `opencode`. The workflow is:

`question + project context → task brief → coding agent → HTML preview → feedback → refined HTML`

The CLI asks the selected local agent to return a self-contained HTML document and saves it to the output path. Review the task and confirm the agent's permissions before running it.

## Design principles

- **Big pictures** — let visual structure carry the explanation.
- **Few words** — every sentence should earn its place.
- **One mental model** — understand the shape first, then add detail.

## Files

- `index.html` — page structure and controls
- `styles.css` — visual design and responsive layout
- `script.js` — interactions, examples, and prompt adapters
- `cli.mjs` — local coding-agent runner


## Architecture status

The prototype now has a first document-core boundary inspired by Excalidraw:

```text
ExplainerDocument
  → validate / restore
  → reader renderer
  → local persistence
  → JSON export
```

- `packages/document/` — versioned document schema, validation, restore/repair, serialization
- `packages/renderer/` — reader renderer; the same document can later feed canvas and export renderers
- `packages/persistence/` — local-first browser draft adapter
- `script.js` — thin studio shell that coordinates document creation and UI state

The current implementation is Phase A: it deliberately does not yet include drag/selection, commands, undo/redo, or real-time collaboration. Those belong to the next document-core and editor phases rather than being faked inside the static prototype.

## Phase B status

The studio now includes a first interactive canvas layer:

- `packages/canvas/` — world/screen coordinates, SVG scene renderer, node drag and semantic edge hooks
- `packages/actions/` — command-based insert/move/connect/delete/text updates with undo/redo history
- `packages/export/` — standalone HTML export boundary
- `packages/templates/` — reusable visual model choices: pipeline, feedback loop, branches, timeline, trade-off
- Reader / Canvas mode — the same document can be read linearly or explored spatially

Canvas editing is intentionally small and local-first: choose a visual template, drag or resize nodes, shift-click to multi-select, double-click nodes to connect them, use arrow keys/Delete, zoom with the wheel, then export JSON or restore it later. Collaboration, encrypted sharing, binary files and PWA remain adapter phases rather than hidden dependencies.

### Architecture expansion

The editor now also has explicit Excalidraw-inspired boundaries for:

- `packages/common/` — shared IDs, geometry helpers and feature flags
- `packages/elements/` — element types, bounds and binding repair
- `packages/state/` — app state separated from document state
- `packages/data/` — migration, restore and validation pipeline
- `packages/library/` — reusable template items
- `packages/editor-api/` — stable imperative editor API

These packages remain browser/framework/vendor independent. The next architectural phase is to move the current page shell into `apps/studio`, then add IndexedDB snapshots, SVG/PNG export, and a structured agent patch contract.
