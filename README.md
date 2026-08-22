# ELI5 Studio

把复杂问题变成一张容易看懂的可视化解释卡片。

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

## 当前版本说明

这是一个无需构建工具、无需安装依赖的静态 prototype：

- `index.html`：页面结构
- `styles.css`：视觉设计与响应式布局
- `script.js`：交互、示例内容和 prompt 复制

当前生成内容使用内置示例，不会调用 AI API。下一步可以接入 Claude、OpenAI 或其他模型，让任意问题都能动态生成 HTML explainer。

## 设计原则

- **Big pictures**：让视觉结构承载理解。
- **Few words**：减少解释负担。
- **One mental model**：先理解整体形状，再补充细节。
