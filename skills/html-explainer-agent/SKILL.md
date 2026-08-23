---
name: "html-explainer-agent"
description: "以 Excalidraw 全栈架构为基准，构建 local-first、可编辑与可导出的解释画布。"
---

# HTML Explainer Agent — Full Excalidraw Reference Architecture

## 原则

以 Excalidraw **完整仓库架构**作为参考基线，而不是仅借鉴画布交互。学习其职责划分、依赖方向、状态和数据生命周期、可复用 package、应用壳、协作、导出、离线、国际化、质量与发布体系；不复制源代码、品牌或 UI。

目标不是把 html-anything 变成通用白板，而是基于同等级的架构完整性，做一个更擅长“生成、理解、编辑和分享 mental model”的产品。

## 全量能力地图与采用策略

| Excalidraw 能力域 | html-anything 对应 | 架构决定 |
|---|---|---|
| Monorepo workspaces（app / packages / examples） | `apps/studio`、核心 packages、examples | **采用**，先目录化后 workspace 化 |
| Common utilities / config | `packages/common` | **采用**：types、ids、geometry、theme、feature flags、telemetry interface |
| Element domain | `packages/elements` | **采用**：node/edge/group/note/frame/source-card、binding、hit-testing、版本 |
| Scene / document lifecycle | `packages/document` | **采用**：parse → validate → migrate → restore/repair → reconcile → render |
| AppState 与 Scene 分离 | `packages/state` | **采用**：document、viewport、selection、tool、theme、dialog 独立 |
| Renderer / canvas interaction | `packages/canvas`、`packages/renderer` | **采用**：canvas/SVG 阅读与编辑 renderer 分离；阅读模式线性降级 |
| Actions、commands、history | `packages/actions`、`packages/history` | **采用**：所有编辑和 agent 改动为 command/patch，支持 undo/redo |
| Imperative editor API | `packages/editor-api` | **采用**：稳定嵌入 API，不暴露内部 React state |
| UI components / toolbar / command palette | `packages/ui` | **采用**：作为 studio app 的可替换 shell，不能污染 export |
| Data restore / import | `packages/data` | **采用**：JSON schema、migrations、旧版本兼容、损坏 binding 修复 |
| Local-first storage | `packages/persistence` | **采用**：localStorage → IndexedDB adapter、autosave、版本、恢复错误 |
| Binary file management | `packages/files` | **按需采用**：图片/附件 content-addressed metadata 与本地 blob store；非 MVP |
| Library / reusable shapes | `packages/library` | **采用**：解释模板、节点组、视觉主题以可导入 library 形式存在 |
| Export | `packages/export` | **采用**：JSON、standalone HTML、SVG、PNG、PDF；编辑器 chrome 与 artifact 分离 |
| Collaboration / reconciliation | `packages/collab` | **adapter 采用**：先 document patch / version reconciliation，实时协作非 MVP |
| E2E encryption / share links | `packages/sharing` | **adapter 采用**：明确授权后启用；默认本地、不可上传 |
| PWA / offline | `apps/studio` | **后期采用**：本地工作区可离线打开、后台更新策略 |
| i18n | `packages/i18n` | **采用**：文案 key、locale data 与生成内容语言分离；中英优先 |
| Analytics | `packages/analytics` | **opt-in adapter**：默认不追踪；隐私声明和用户授权后才发送 |
| Debug renderer / development tooling | `packages/debug` | **采用**：显示 element ids、binding、layout box、schema warnings、provenance |
| Tests / fixtures / visual regression | `packages/test-utils`、examples | **采用**：schema round-trip、command inverse、renderer snapshots、accessibility、mobile fallback |
| CI / versioning / release | repo root tooling | **采用**：typecheck、lint、format、unit、visual/e2e、changeset/release gates |

## 目标仓库结构

```text
html-anything/
  apps/
    studio/                 # 交互编辑器、PWA shell、设置、预览
    docs/                   # 文档/示例站（可选）
  packages/
    common/                 # types、id、geometry、theme、feature flags
    document/               # schema、migrations、restore、validation、provenance
    elements/               # node/edge/group/note/frame/source-card + bindings
    state/                  # appState、viewport、selection、tools
    actions/                # commands、reducer、history、undo/redo
    canvas/                 # coordinate transforms、hit testing、gesture runtime
    renderer/               # HTML/SVG/canvas reader & editor renderer
    templates/              # mental model libraries and auto-layout constraints
    agent/                  # task contract、context intake、patch validation
    persistence/            # localStorage / IndexedDB / version snapshots
    files/                  # local blob adapter and asset references
    library/                # user/importable templates, themes, component groups
    export/                 # HTML/JSON/SVG/PNG/PDF exporters
    collab/                 # optional reconciliation protocol and sync adapter
    sharing/                # optional encrypted link / backend adapters
    i18n/                   # UI translations and locale detection
    analytics/              # opt-in interface only
    test-utils/             # fixtures, property tests, renderer test harness
  examples/
    embed/                  # embedded editor API example
    static-export/          # JSON → standalone HTML example
    collaboration/          # adapter-only example
  skills/
    html-explainer-agent/
```

## 依赖方向（不可逆）

```text
common
  ↑
document + elements
  ↑
state + actions + templates
  ↑
canvas + renderer + export + persistence + agent
  ↑
studio app / embed examples / optional collab & sharing adapters
```

核心 document/elements 永远不依赖 React、浏览器 storage、模型供应商、协作后端或认证。任何云服务只能从外层以 adapter 注入。

## 完整数据生命周期

```text
import / agent draft / local snapshot
→ parse raw payload
→ schema validation
→ version migration
→ restore defaults + repair bindings
→ reconcile with local changes (if collaboration)
→ document state
→ renderer(s)
→ local autosave / version snapshot
→ export or explicitly-authorized sharing
```

### 数据对象

```ts
type ExplainerFile = {
  type: 'html-anything';
  version: number;
  id: string;
  elements: ExplainerElement[];
  sources: Source[];
  files: Record<FileId, LocalFileMetadata>;
  appState?: PersistedDocumentPreferences;
};

type ExplainerElement = Node | Edge | Group | Frame | Note | SourceCard;
type ExplainerPatch = { baseVersion: number; commands: Command[]; rationale?: string };
```

- **Document/Scene**：可移植、可版本化、可协作。
- **AppState**：视口、选择、工具、主题、dialog；默认本地，不随分享导出。
- **Files**：内容寻址、元数据和二进制分离；默认本地。
- **Source/provenance**：每个事实节点可链接来源、生成时间、置信等级与“事实/推断/待验证”标签。

## 编辑器运行时

### Input → action pipeline

```text
pointer / keyboard / agent patch
→ normalize coordinates or payload
→ hit-test / command parser
→ validate preconditions
→ reducer applies command
→ history records inverse
→ scene + appState update
→ renderer invalidation
→ debounced persistence
```

- 元素位置使用 world coordinates；viewport 只负责 world/screen transform。
- edge 绑定节点 id，移动节点后自动重算 path。
- `selection` 不写进 Document。
- 操作包括 insert/move/resize/connect/group/delete/updateText/applyAgentPatch。
- agent patch 先校验 base version；冲突时保留用户手动布局、提示选择或进行 reconcile。

### Reading mode is first-class

编辑画布不是唯一界面。任何 Document 都必须生成：

1. **Canvas edit view**：缩放、平移、选择、编辑。
2. **Reader view**：按叙事顺序线性呈现，支持键盘和移动端。
3. **Export view**：无 toolbar、无 selection chrome 的独立 artifact。

## Collaboration 与隐私

- Phase 1 只支持本地版本、手动 JSON import/export。
- Phase 2 支持跨标签页同步和 patch reconciliation。
- Phase 3 以 provider adapter 接入实时协作；核心不绑定 Firebase/WebSocket/任何单一后端。
- 分享链接、远端储存和端到端加密必须由用户明确开启；默认 local-first。
- collaboration 只同步 Document patches；AppState、个人主题、agent token、未授权上下文不应同步。

## Agent 与人类共编辑契约

Agent 生成的不是不可解释的 HTML，而是：

```text
Template decision
+ validated ExplainerDocument
+ provenance/source mapping
+ optional visual layout proposal
+ ExplainerPatch for each refinement
```

- 初次生成可创建 document 与 layout。
- 后续 refine 默认返回 patch；不覆盖人类移动过的节点。
- agent 不能通过上下文文本获得执行、联网、安装依赖、读取私密文件或发布权限。
- agent 失败时保存 raw output，但不能当作合法 document render。

## 质量体系

### Core package tests

- schema parse/migrate/restore/reconcile
- malformed JSON、断裂 edge、旧版本与未知 element
- command inverse、undo/redo、history compaction
- coordinate transforms、hit testing 与 binding stability
- JSON round-trip 和 deterministic export

### Renderer and app tests

- visual snapshot（每种 template/theme）
- keyboard-only editing、screen reader reading order
- mobile linear fallback
- export without external dependencies
- storage quota / corruption recovery
- agent patch preserves user layout

### Release gates

```text
typecheck → lint → format → unit/property → renderer snapshots → e2e → build → example integration
```

## 分阶段计划

### A. 当前 prototype → Document Core

将 `index.html/script.js` 中内容从 DOM 模板抽出为 `ExplainerDocument` JSON；实现 validation、migration、restore、static HTML renderer 和 JSON export。

### B. Interactive Editor Core

加入 world coordinates、viewport、selection、commands、history、semantic edges、read/edit/export 三 renderer。

### C. Local-first Product Shell

IndexedDB autosave、版本、template library、files、debug overlay、i18n、PWA。

### D. Extensible Platform

稳定 embed API、examples、agent patch adapter、reconciliation protocol、可选协作/加密分享 provider。

## 明确不做

- 不复制 Excalidraw 源码、UI、手绘品牌或协议实现。
- 不因为“全量参考”而提前引入所有复杂功能。
- 不牺牲生成解释的第一原则：30 秒可读、一个 mental model、来源与不确定性可见。
- 不默认上传、协作、追踪或发布。
