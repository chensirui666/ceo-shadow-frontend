# Relevance AI 定价策略调研

> 核验时间：2026-08-26
> 范围：Relevance AI 当前公开的 Free、Pro、Team 与 Enterprise 方案，以及 Actions、Vendor Credits、BYOK、超额补购和用量控制。
> 口径：只使用 Relevance AI 官方定价和文档。模型供应商价格会变化；某一次任务的最终扣费以产品内的 Task / Plan & Billing 明细为准。

## 结论

Relevance AI 不是「只按模型 Token 收费」，而是给一个组织同时开了两本账：

```text
实际付款 = 组织订阅费
         + Actions 补购包（若工具执行次数不够）
         + Vendor Credits 补购包（若模型 / 付费工具成本不够）
         + 用户自带 API Key 在模型供应商侧的费用（若启用 BYOK）
```

一次 Agent 任务可能同时扣两种余额：

```text
Agent 调用模型思考 / 生成回答      → 扣 Vendor Credits
Agent 每运行一个 Tool              → 扣 1 Action
该 Tool 本身有第三方成本            → 还会扣 Vendor Credits
```

所以它把「平台执行能力」和「第三方可变成本」拆开卖：

| 账本 | 用户可以把它理解成 | 怎么扣 | 补购价格 |
| --- | --- | --- | ---: |
| Actions | Agent 动手做事的次数 | 每个 Tool 实际运行 1 次，扣 1 个；失败也扣 | $80 / 1,000 个，即 **$0.08 / Tool 运行** |
| Vendor Credits | 模型和有成本的第三方工具的钱 | 按选用的模型 Token、缓存和工具实际成本扣 | $20 / 10,000 Credits，即购买汇率 **500 Credits = $1** |

这里的 **Vendor Credits 不是固定 Token 包**。同样是 10,000 Credits，选择不同模型、输入输出比例、是否命中缓存，以及用了哪些付费工具，能完成的工作量都不同。官方承诺这部分按供应商成本原样转付、无加价。

**最重要的商业含义：** Relevance 把昂贵且波动的模型 / 工具成本透明地交给用户承担；而 $0.08 / Action 是它自己单独收取的平台执行费。两种余额独立见底、独立补货，不能互相兑换。

## 1. 套餐：按组织卖，不是按席位卖

Free、Pro、Team 的订阅都作用于 **Organization**。该组织中所有项目、成员共用同一份 Actions、Vendor Credits 和功能权限；不是像 Cursor Team 那样按活跃成员逐席收费。

| 套餐 | 月付 | 年付折算月价 | 已含 Actions | 已含 Vendor Credits | 成员 / 功能的关键边界 |
| --- | ---: | ---: | ---: | ---: | --- |
| Free | $0 | — | 200 / 月 | 1,000（一次性，约 $2） | 1 Build User、1 Project、1 Workforce；不能 BYOK 或补购 |
| Pro | $29 | $19 | 2,500 / 月；年付为 30,000 / 年 | 10,000 / 月（约 $20）；年付为 $240 / 年 | 2 Build Users；可建不限 Workforces；可 BYOK、定时任务、Chat 等 |
| Team | $349 | $234 | 7,000 / 月；年付为 84,000 / 年 | 35,000 / 月（约 $70）；年付为 $840 / 年 | 5 Build Users + 45 End Users、5 Shared Projects、Calling / Meeting 等 |
| Enterprise | 定制 | 定制 | 定制 | 定制 | 无限用户 / 项目及企业治理、实施服务 |

年付页写的是「每月折算价」：Pro $19、Team $234；按年付费比月付便宜约 33%。年付和月付的区别不仅是付款节奏，也决定了计划赠送量显示为「每年」或「每月」的额度。

### 1.1 「Vendor Credits $20」和「10,000 Credits」到底是什么关系？

官方在 Pro 中同时写「每月 $20 Vendor Credits」和「每月 10,000 Vendor Credits」；两者是同一份余额：

```text
$20 的供应商成本预算 = 10,000 Vendor Credits
1 Vendor Credit = $0.002 的采购计价单位
```

这只是余额的购买 / 结算换算，不代表每个 Token 都是固定 $0.002。不同模型会按不同的 Credit 单价扣余额。

例如官方 GPT-4o 示例的价格是：未缓存输入 0.63 Credits / 1K Token、缓存输入 0.063 Credits / 1K Token、输出 5 Credits / 1K Token。也就是说，输出 Token 比输入 Token 更贵，命中缓存则更便宜。

## 2. Action：不是模型调用次数，是 Tool 运行次数

官方定义很直接：**一个 Tool 跑一次，就是一个 Action。**

| 场景 | Action 怎么扣 |
| --- | --- |
| 用户手动运行一个 Tool | 1 次运行 = 1 Action |
| Agent / Workforce 在任务里运行 Tool | 每跑 1 个 Tool = 1 Action |
| 一个工作流依次跑搜索、写 CRM、发邮件 3 个 Tool | 扣 3 Actions |
| Tool 失败 | 仍扣 1 Action |
| 只发生模型推理、没有 Tool 运行 | 官方的 Action 定义不触发；但模型仍会扣 Vendor Credits |

它不按「创建了几个 Agent、几个 Tool、多少次对话」收费。Free、Pro、Team 都允许不限量创建 Agents 和 Tools；真正计费的是它们被执行时的次数和执行时产生的第三方成本。

### 2.1 Action 的本质和边界

Action 可以理解成 Relevance 收的「让 Agent 真正做一次外部动作 / 流程节点」的平台费。公开补购单价是 $0.08 / 次，明显不是某个模型的 Token 价格。

官方**没有公开**以下项目的完整映射，因此不能自己估算成一张绝对准确的「每个功能多少 Action」表：

- 某个 Marketplace Tool 内部嵌套多步时，是否会拆成多个可见 Tool 运行；
- 触发器、排队、失败重试是否额外形成 Action；
- 单纯 Agent 对话中不调用 Tool 时，是否存在未披露的基础 Action；
- 每一种第三方工具是否还带有 Vendor Credits 成本。

他们提供了任务级明细：在某个 Agent Run 中，可以查看每个 Tool 用了多少、Agent LLM 花了多少，以及 base run cost。核算时应以此明细为准，而不是只数用户看到的按钮点击次数。

## 3. Vendor Credits：模型费 + 有成本工具费的统一余额

Vendor Credits 是 Relevance 替用户向模型和工具供应商结算的余额，覆盖：

- LLM 的输入 / 输出 Token；
- 缓存 Token（如果模型供应商提供缓存折扣）；
- 使用时本身有供应商成本的工具。

官方承诺是 **wholesale / no markup**：按 LLM 和工具供应商的实际价格转付，不在这层额外加价。因此这本账能解释「为什么某个 Agent 没跑多少工具，但余额掉得快」——可能是选了更贵模型、输出很长、上下文很大，或调用了付费工具。

### 3.1 模型按什么扣？可以选模型吗？

可以。定价页写明「Use any LLMs with credits」；集成文档也分别公开了 OpenAI、Gemini、Anthropic、Azure、OpenRouter 等路径。用户选择模型后，Relevance 按该模型的 Token 规则折算 Vendor Credits，而不是把所有模型按一次调用一个固定价。

以官方 GPT-4o 示例为例：

```text
模型成本（Credits）
= 未缓存输入 Token / 1,000 × 0.63
+ 缓存输入 Token / 1,000 × 0.063
+ 输出 Token / 1,000 × 5
```

它对重复的 Agent 指令和 Tool 定义做隐式缓存；缓存输入的价格是未缓存输入的 10%。因此不要以 UI 中可见的未缓存输入 Token 单独倒推出账单，官方说明总成本还会包含以折扣价计算的缓存 Token。

### 3.2 一次模型调用的具体算例

沿用官方 GPT-4o 的示例：一个 Agent 有 19,000 Token 的指令，先后进行了两次模型调用。

| 调用 | Token 构成 | 扣除 Vendor Credits |
| --- | --- | ---: |
| 第 1 次 | 19K 未缓存输入 + 2K 输出 | 21.97 |
| 第 2 次 | 6K 未缓存输入 + 13K 缓存输入 + 1.5K 输出 | 12.10 |
| 合计 | — | **34.07** |

按 10,000 Credits = $20 的公开采购比例，这 34.07 Credits 对应约 **$0.068** 的供应商成本预算。这个例子没有把 Tool 的成本算进去；如果这个任务还运行了有供应商费用的搜索、数据或通信工具，会继续从 Vendor Credits 余额扣除。

## 4. BYOK：可绕过模型余额，但绕不过 Actions

Pro、Team、Enterprise 可以连接自己的模型供应商 API Key；Free 不行。官方将其描述为「bring your own LLM / API key」，并明确说可绕过 Vendor Credits。

实际应这样理解：

```text
连接自己的 OpenAI / Google / 云厂商凭证
→ 对应模型调用不从 Relevance 的 Vendor Credits 扣
→ 模型费用改由用户直接在 OpenAI / Google / 云厂商账单承担
→ Agent 运行的每一个 Tool，仍照常扣 Action
```

官方的 OpenAI、Gemini 文档都明确了这个细节：接入对应的自有 Key 后，调用该供应商模型不收 Relevance Credits，缓存折扣则直接体现在用户自己的供应商账单上。

**不要把 BYOK 理解成「Relevance 全部免费」。** Actions 仍是 Relevance 的平台计量；此外，官方没有逐一公开所有非模型付费工具在 BYOK 情况下的结算规则。对于这类工具，以任务内 Cost Breakdown 和连接器的供应商账单为准。

## 5. 余额从购买到花完：完整流程

### 5.1 先付订阅费，获得两个独立余额

以月付 Pro 为例：组织每月支付 $29，续费时获得 / 恢复计划规定的 2,500 Actions 和 10,000 Vendor Credits。组织中两个 Build Users、所有项目和 Agents 共用这两份余额。

### 5.2 每个任务分别扣两本账

假设一个「查公司资料 → 更新 CRM → 发邮件」任务：

```text
1. Agent 用 GPT-4o 理解需求、生成邮件
   → 按模型 Token / 缓存扣 Vendor Credits

2. 运行资料查询 Tool
   → 扣 1 Action
   → 若这个查询服务本身收费，再扣对应 Vendor Credits

3. 运行 CRM 更新 Tool
   → 扣 1 Action

4. 运行邮件发送 Tool
   → 扣 1 Action

本次任务至少：3 Actions + 模型的 Vendor Credits
```

若用了上一节 GPT-4o 的两次调用示例，且这 3 个 Tool 本身没有额外供应商成本，则 Pro 余额从：

```text
Actions:       2,500 → 2,497
Vendor Credits: 10,000 → 9,965.93
```

这次任务不需要立即额外付款，因为仍在订阅计划的两份已含余额内。

### 5.3 其中一本账先用完，会发生什么？

两本账相互独立，因此可能出现「工具次数还有，但模型钱没了」，也可能相反。

| 缺的是什么 | 付费用户的处理方式 | 最小补购 | 补购后余额怎么走 |
| --- | --- | ---: | --- |
| Actions | 升级套餐、手动购买或开启自动补货 | 1,000 Actions = $80 | 购买的 Action 可以带到下一次账期；计划原本赠送的 Action 不结转 |
| Vendor Credits | 升级套餐、手动购买、开启自动补货，或改用 BYOK | 10,000 Credits = $20 | 所有 Vendor Credits 都会在保持订阅期间无限结转 |
| Free 的任一种余额 | 不能购买补充包 | — | 必须升级到 Pro / Team |

例如某 Pro 组织已用掉 2,499 Actions，下一次任务需要运行 3 个 Tools：计划内只剩 1 个，不能按 2 个零散购买，最小需要买 1,000 Actions，支付 $80。同样地，Vendor Credits 余额不足以覆盖下一次模型调用时，最小补购为 10,000 Credits，支付 $20。

### 5.4 自动补货不是「封顶」，而是连续充值开关

Pro 和 Team 可分别对 Actions、Vendor Credits 配置 Spend Controls。设置两个数：

- **最低阈值**：余额低于它就触发；
- **补货量**：触发后希望在最低阈值之上再保留多少。

官方的例子：当前余额 1,000 Credits，阈值设为 10,000，补货量设为 1,000。系统会立即收费补到 11,000，也就是本次购买 10,000 Credits，而不是只买 1,000。

官方没有设置自动补货次数上限。也就是说，它保证不停机，但如果设置不谨慎，也可能连续扣款。它的「自动」是购买上述补购包，不是先用后按小数金额结算。

### 5.5 想限制风险：用 Usage Limits 硬停，而不只靠提醒

Relevance 还有两个单独功能：

| 功能 | 作用 | 边界 |
| --- | --- | --- |
| Usage Alerts | 到指定消耗量时发邮件 | 只提醒，不停机 |
| Usage Limits | 到指定消耗量时硬停止，并通知指定人 | 所有方案都可用；按自然月设置、每月月初重置 |

Usage Limits 可在组织级或项目级设置，适合避免一个项目把全组织共享的两本余额烧完。这里要注意：它按**自然月**重置，而订阅额度按**续费日**补给；两者不是同一个周期。

## 6. 续费、结转和清零：最容易误解的部分

| 余额来源 | 到下一个订阅续费日会怎样 | 适用范围 |
| --- | --- | --- |
| Free 的 200 Actions / 月 | 刷新为 200 | Free |
| Pro / Team 计划自带的 Actions | 未用部分清零，然后恢复为该套餐默认量 | Pro / Team |
| 手动 / 自动购买的 Action top-up | 结转到下一账期 | Pro / Team |
| Free 的 1,000 Vendor Credits | 注册时一次性发放，不续发 | Free |
| Pro / Team 计划自带的 Vendor Credits | 不清零，和新一期赠送量叠加 | Pro / Team |
| 购买的 Vendor Credit top-up | 在订阅保持有效时无限结转 | Pro / Team |

可以用一条账本公式概括：

```text
续费后剩余 Actions
= 新一期计划 Actions + 上一期剩余的「购买 Actions」
  （上一期没用完的「计划 Actions」不带过来）

续费后剩余 Vendor Credits
= 上一期剩余 Vendor Credits + 新一期计划赠送 Vendor Credits
  （包括计划赠送和购买补货，均可结转）
```

Enterprise 的 Actions / Vendor Credits 数量与结转条件由合同决定，官方要求直接向客户经理确认，不能套用上表。

## 7. Relevance 定价的关键判断

1. **不是按 Agent 数量收费。** Agents、Tools、Integrations 的创建是不限量；持续成本来自实际 Tool 运行和模型 / 工具供应商消耗。
2. **一次任务可以双扣。** 模型生成内容扣 Vendor Credits，工具运行扣 Actions；不要只看其中一项余额。
3. **Action 是固定价，Vendor Credit 是浮动价。** 前者永远是一次 Tool 运行；后者由模型、上下文、输出、缓存和付费工具决定。
4. **BYOK 只解决模型供应商成本。** 它把相关模型费用移出 Relevance 余额，仍需要付 Relevance 订阅和 Actions。
5. **它避免了「月末赠送模型费浪费」的问题。** Vendor Credits 会滚存；但基础 Actions 不滚存，鼓励有稳定、高频 Tool 执行需求的客户升级或补购。
6. **自动补货没有公开上限。** 真正的成本保护要配合 Usage Limits；且 Usage Limits 的自然月周期要与订阅日单独核对。

## 官方来源

- [Relevance AI Pricing](https://relevanceai.com/docs/get-started/pricing)
- [Plans and credits](https://relevanceai.com/docs/admin/subscriptions/plans)
- [Spend controls](https://relevanceai.com/docs/admin/subscriptions/spend-controls)
- [Credit and action usage limits](https://relevanceai.com/docs/admin/project-management/usage-limits)
- [Pricing and packaging changes（2025 年新模型说明）](https://relevanceai.com/docs/admin/subscriptions/new-pricing)
- [OpenAI LLM models（GPT-4o Vendor Credit 示例与缓存规则）](https://relevanceai.com/docs/integrations/llm-integrations/openai)
- [Google Gemini LLM models（BYOK 结算示例）](https://relevanceai.com/docs/integrations/llm-integrations/gemini)
