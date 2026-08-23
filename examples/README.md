# User cases / 用户案例

这些案例展示 ELI5 Studio 不只是解释“知识点”，也可以作为一个把复杂材料整理成 mental model 的工作台。

## 1. 技术概念：API 是怎么工作的？

**输入**：`What is an API?`

**推荐模板**：Pipeline

```text
你的应用 → API → 服务
```

**适合谁**：产品经理、设计师、刚开始接触技术的人。

**价值**：把抽象的“接口”变成一次请求如何被接收、处理、返回的可见流程。

## 2. 宏观机制：美债如何影响经济？

**输入**：`美债如何影响经济？`

**推荐模板**：Feedback Loop + Transmission Branches

```text
财政部发债 → 买家要求收益率 → 全社会融资成本 → 财政利息支出 → 更多发债
                                      ├→ 家庭与企业
                                      ├→ 银行与资产估值
                                      └→ 美元与海外资金
```

**适合谁**：想理解宏观新闻，但不想先读一整本金融教材的人。

**价值**：把“美债收益率”从一个孤立数字还原成一个连接财政、金融市场和实体经济的系统变量。

**注意**：实时利率、债务规模和市场预测必须另行核验；可视化的是机制，不是投资建议。

## 3. 产品功能：一个新功能是如何工作的？

**输入**：`Explain the checkout flow in this repository`

**上下文**：

```bash
node cli.mjs explain "Explain the checkout flow" \\
  --repo ~/my-product \\
  --context src/checkout.ts \\
  --context README.md \\
  --agent claude \\
  --out checkout-flow.html
```

**推荐模板**：Pipeline 或 Branches

**适合谁**：新成员、客户、跨职能协作者。

**价值**：把代码库里的函数、接口和业务规则转换成不依赖源码阅读顺序的产品解释。

## 4. Bug 解释：为什么这个错误会发生？

**输入**：`Why does the payment timeout happen after the retry?`

**上下文**：错误日志、相关源码、请求链路截图。

**推荐模板**：Timeline + Decision Tree

```text
第一次请求 → 超时 → 重试条件 → 第二次请求 → 状态未清理 → 再次超时
                         ├─ token 已过期：刷新
                         └─ 服务端仍处理中：等待 / 幂等处理
```

**适合谁**：工程师、客服、技术支持。

**价值**：区分“发生了什么”“为什么发生”和“下一步检查什么”，避免把错误信息原样转发给用户。

## 5. 商业模式：一个产品为什么能赚钱？

**输入**：`How does this marketplace make money?`

**推荐模板**：Branches + Trade-off

```text
平台撮合 → 用户交易 → 平台抽佣
     ├→ 规模：更多交易
     ├→ 信任：降低交易摩擦
     └→ 代价：补贴、审核、履约成本
```

**适合谁**：创业者、投资人、竞品研究者。

**价值**：同时呈现价值流、收入来源和增长背后的成本约束。

## 6. 个人学习：把一篇文章变成 mental model

**输入**：文章标题或核心问题。

**上下文**：Markdown、网页摘录、播客 transcript。

**推荐模板**：根据文章选择 Feedback Loop、Timeline 或 Trade-off。

**验收问题**：

- 30 秒内能否说出作者的核心判断？
- 节点之间是因果关系，还是仅仅并列？
- 哪些是原文事实，哪些是解释器推断？
- 读者看完后能否提出一个更好的问题？

## 从案例到工作流

```text
选择问题
→ 选择主视觉模板
→ 加入最小必要上下文
→ 生成 ExplainerDocument
→ Reader 阅读
→ Canvas 编辑布局 / 关系
→ JSON 保存或 standalone HTML 导出
→ 用具体反馈 refine
```
