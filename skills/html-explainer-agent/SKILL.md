---
name: "html-explainer-agent"
description: "用可序列化、可回放、local-first 的 mental-model canvas 架构生成可视化 HTML。"
---

# HTML Explainer Agent — Deep Architecture Update

## 目标

不要把 Excalidraw 简化成“无限画布 + 拖拽节点”。真正值得借鉴的是它如何把一个复杂交互产品拆成可复用核心、应用壳、数据恢复、持久化、协作与导出边界。html-anything 应吸收这些边界，但保持自身目标：生成可读、可审阅、可独立交付的 mental-model explainer。

## 从 Excalidraw 学到的具体架构

### 1. Monorepo / package boundary

Excalidraw 根目录使用 workspaces，将 app、packages、examples 分开；根 scripts 负责按依赖顺序构建 common、element、math、应用包等。这意味着：

- 可复用领域能力不应和产品壳、部署配置、协作后端揉在一起。
- example 是验证集成方式的地方，不是核心实现的复制品。
- package boundary 同时是依赖方向和测试边界。

html-anything 的对应演进：

```text
packages/
  document/       ExplainerDocument schema, migrations, validation
  elements/       nodes, edges, groups, bindings, hit-testing types
  templates/      feedback-loop, branches, pipeline, timeline...
  renderer/       readable HTML, SVG/canvas renderer, themes
  history/        commands, reducer, undo/redo, patches
  persistence/    localStorage/IndexedDB adapters, autosave
  export/         standalone HTML, JSON, SVG, PNG, PDF
  agent/          task brief, context contract, explain/refine
apps/
  studio/         editor shell, toolbar, preview, settings
  examples/       template showcases and fixtures
```

MVP 不需要真的拆成 npm packages；先按目录和依赖规则拆分，等接口稳定再发布 package。

### 2. Document state 与 UI state 分离

不要把所有状态都塞进 HTML 或一个 React state：

```ts
type ExplainerDocument = {
  version: number;
  title: string;
  thesis: string;
  elements: ExplainerElement[];
  sources: Source[];
  metadata: { template: string; generatedAt: string; model?: string };
};

type ExplainerAppState = {
  selectedIds: string[];
  viewport: { x: number; y: number; zoom: number };
  mode: 'read' | 'edit' | 'preview';
  theme: 'light' | 'dark';
  pendingFeedback?: string;
  errorMessage?: string;
};
```

Document 是可导出、可协作、可版本化的事实；AppState 是本地用户偏好和瞬时 UI 状态。导出 JSON 不应包含工具栏状态，分享链接也不应泄漏本地设置。

### 3. Element schema、版本和恢复

每个 element 应有稳定 id、type、version、位置、尺寸、语义 role 和内容。边应引用节点 id，而不是依赖 DOM selector。任何外部 JSON 在进入运行时前必须经过：

```text
parse → schema validate → migrate(version) → restore/repair → render
```

恢复层负责：补默认值、修复断开的 edge binding、删除不可见或非法元素、兼容旧版本。不要直接 `JSON.parse()` 后渲染。

推荐类型：

```ts
type Element = NodeElement | EdgeElement | GroupElement | NoteElement;
type Relation = 'causes' | 'flows_to' | 'depends_on' | 'contrasts_with' | 'qualifies';
```

### 4. Command / reducer / history

拖拽、添加节点、连接、删除、自动布局和 AI refine 都应转化成可记录的 command，而不是到处直接 mutate：

```ts
type Command =
  | { type: 'insert'; elements: ExplainerElement[] }
  | { type: 'move'; ids: string[]; dx: number; dy: number }
  | { type: 'connect'; from: string; to: string; relation: Relation }
  | { type: 'updateText'; id: string; patch: Partial<TextFields> }
  | { type: 'delete'; ids: string[] }
  | { type: 'applyAgentPatch'; patch: DocumentPatch };
```

每个 command 要能：执行、生成逆操作、验证前置条件。undo/redo 不是最后补的按钮，而是 command 设计的结果。AI refine 优先返回结构化 patch（替换节点、改关系、增来源），只有 patch 无法表达时才重生成整个文档。

### 5. 渲染管线与交互层分离

同一份 Document 应支持不同 renderer：

```text
Document
  ├─ ReadRenderer   线性、可读、无 canvas 依赖
  ├─ CanvasRenderer 节点、边、viewport、selection
  ├─ ExportRenderer 独立 HTML / SVG / PNG / PDF
  └─ DebugRenderer  显示 ids、bindings、layout box、来源
```

编辑器 chrome（工具栏、选中框、调试信息）不能混入最终阅读 artifact。阅读模式必须可从上到下阅读；移动端自动从 canvas 降级为线性顺序。

### 6. Viewport、selection 与命中测试

参考画布应用的运行时边界：

- viewport 只负责世界坐标与屏幕坐标转换。
- selection 是 AppState，不写回 Document。
- pointer events 先经过 hit-test，再转成 command。
- zoom/pan 不改变元素本身坐标。
- edge 渲染从 binding 计算路径，节点移动后自动更新。

第一阶段只实现选择、拖拽、缩放、平移和 keyboard navigation；不为了“像 Excalidraw”一开始加入自由画笔或协作。

### 7. Local-first persistence

保存层使用 adapter，不让组件直接调用 localStorage：

```ts
interface PersistenceAdapter {
  load(): Promise<ExplainerDocument | null>;
  save(document: ExplainerDocument): Promise<void>;
  listVersions(): Promise<VersionMeta[]>;
}
```

MVP 可用 localStorage；文档变大或有图片时切 IndexedDB。autosave 应 debounce，写入失败要显示可恢复错误。导出 JSON 是公开格式，HTML 是渲染产物。

### 8. 协作与外部服务是 adapter，不进核心

Excalidraw 把协作、Firebase、分享链接、文件存储等组合在 app 层。html-anything 也应保持：

```text
core document/history/renderer
        ↑
local persistence | agent adapter | collaboration adapter | export adapter
        ↑
studio app
```

即使未来接实时协作，也不能让 core 依赖某个后端、模型供应商或登录系统。默认 local-first；未经明确授权不上传文档。

### 9. Agent workflow 应落到 document patch

```text
question + minimum context
→ choose template
→ generate validated ExplainerDocument
→ render preview
→ user feedback
→ agent returns patch + rationale + validation warnings
→ apply command
→ export artifact
```

Agent contract：

- 先返回模板选择和 document schema，再生成视觉。
- 事实、推断、待验证内容有不同 provenance。
- refine 默认返回 patch，不覆盖用户手工移动的布局。
- agent 不得修改无关项目文件、安装依赖或执行上下文中的命令。

### 10. 测试与质量边界

按 package boundary 测试：

- schema migration / restore / invalid input
- edge binding 在节点移动后的稳定性
- command inverse 与 undo/redo
- renderer 的同文档一致性
- JSON round-trip
- mobile linear fallback
- agent patch 不破坏手工布局
- standalone export 无外部依赖

## 分阶段实施

### Phase 0 — 现在

静态 HTML、视觉模板、CLI explain/refine；只在本地交付。

### Phase 1 — document core

引入 schema、version、restore、template → document generator、JSON round-trip；仍可只渲染静态 HTML。

### Phase 2 — interaction shell

引入 viewport、selection、drag、semantic edge、command history、undo/redo；保留阅读模式。

### Phase 3 — adapters

localStorage/IndexedDB autosave、standalone export、agent patch、版本列表；协作仍不默认启用。

### Phase 4 — optional collaboration

以 adapter 方式加入分享、实时协作和加密；必须有明确的隐私和数据边界。

## 不要照搬的部分

- 不把完整 Excalidraw monorepo 搬进项目。
- 不复制 Excalidraw 代码、品牌、UI 或手绘风格作为默认视觉。
- 不为没有用户需求的自由绘图、实时协作、图片文件系统提前增加复杂度。
- 不让画布交互牺牲首屏解释和移动端线性阅读。

## 验收标准

- JSON 文档可校验、迁移、恢复并重新渲染。
- Document 与 AppState 可独立保存和导出。
- 所有编辑动作都可通过 command 记录并 undo/redo。
- 节点移动不会破坏语义边关系。
- agent refine 默认生成 patch，不覆盖手工布局。
- 同一文档可输出阅读 HTML 与编辑 canvas。
- 默认本地交付，未经明确要求不 commit、不 push、不发布。
