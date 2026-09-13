# Cursor 定价策略调研

> 核验时间：2026-08-19
> 范围：Cursor 当前公开的个人、团队与企业套餐；不覆盖历史的按请求计费套餐。
> 口径：价格、用量和模型均优先采用 Cursor 官方定价页与文档。模型价格会变化，实际购买或核算时以 Cursor 账户内的 Spending Dashboard 为准。

## 结论

Cursor 的收费结构不是单一订阅，而是：

```text
套餐席位费 + Cursor Models 已含容量池 + 第三方模型美元额度池 + BYOK 自带模型费用 + 可选超额按量付费 + 团队治理能力
```

其中，第三方模型池是公开、可按 token 单价计算的美元额度；Cursor Models 池是独立的已含容量，Cursor 不公开其每档 token 上限、美元等价或明确倍率。
## 1. 个人套餐

| 套餐 | 月价 | 套餐内容 | 第三方模型池 | Cursor Models 池 |
| --- | ---: | --- | ---: | --- |
| Hobby | 免费 | Composer、有限 Agent 请求，无需绑卡 | 未公开 | 较小的可用模型集合；固定请求数未公开 |
| Pro | $20 | 无限 Tab 补全、扩展 Agent 限额、前沿模型、MCP、Skills、Hooks、Cloud Agents、Bugbot | $20 / 账单月 | 已含容量，精确上限未公开 |
| Pro+ | $60 | 与 Pro 相同 | $70 / 账单月 | 高于 Pro，精确倍率未公开 |
| Ultra | $200 | 与 Pro 相同，优先获得新功能 | $400 / 账单月 | 高于 Pro+，精确倍率未公开 |

Cursor 的定价页以“Pro+ 为日常 Agent 用户、Ultra 为重度 Agent 用户”定位升级。其页面同时以整体 Agent 限额描述 Pro+ 为 Pro 的 3 倍、Ultra 为 Pro 的 20 倍；这不是 Cursor Models 池的公开精确倍率，不能据此换算出该池的 token 额度。

付费套餐解锁全部可用模型；模型仍可能因模型供应商的地区限制而不显示。Hobby 只能使用较小模型集合。

## 2. 两个用量池如何工作

### 2.1 Cursor Models 池：自有模型的独立容量

当前包括：

- Cursor Grok 4.6
- Cursor Grok 4.5
- Composer 2.5

该池与第三方模型池分开追踪、按账单月重置。选择上述模型时，不会从 Pro 的 $20、Pro+ 的 $70 或 Ultra 的 $400 第三方额度中扣除。

Cursor 对三档只披露“generous included usage（充足的已含用量）”。公开资料**没有**说明：

- 每档具体包含多少输入、缓存或输出 token；
- 用量是否折算为某个固定美元值；
- Pro+ 相对 Pro、Ultra 相对 Pro+ 的 Cursor Models 池倍率；
- 不同的 effort、Fast 速度或 Agent 工具调用，在已含池内的扣减权重。

因此，正确的产品表述是“自有模型有独立的已含月度容量，且高档套餐更大”，而不是“Pro 含 $X Composer / Grok credit”。唯一可信的个体剩余量来自账户的 Spending Dashboard。

### 2.2 Other Models 池：第三方模型的美元预算

该池用于 OpenAI、Anthropic、Google 等第三方模型，按模型公开 API token 单价扣减。额度每个账单月清零且不结转：

| 套餐 | 每月已含第三方模型用量 |
| --- | ---: |
| Pro | $20 |
| Pro+ | $70 |
| Ultra | $400 |

一次请求的理论扣减公式为：

```text
消耗金额 = 输入 token × 输入单价
         + 缓存写入 token × 缓存写入单价
         + 缓存读取 token × 缓存读取单价
         + 输出 token × 输出单价
```

例如，Claude Sonnet 5 的价格为 $2 / M 输入 token、$10 / M 输出 token。一次无缓存的 10 万输入 + 2 万输出请求，消耗约 $0.40；Pro 的 $20 池会相应减少至约 $19.60。实际 Agent 工作会附带多轮上下文、工具调用与缓存，因此不能用“每次聊天”估算。

### 2.3 BYOK：Pro 用户可连接自己的 API Key

Cursor 支持 Bring Your Own Key（BYOK）。将 OpenAI、Anthropic、Google、Azure OpenAI 或 AWS Bedrock 的密钥填入 `Settings > Models` 后，所对应的模型会出现在模型选择器中。

- Cursor 官方文档将其表述为“以自己的成本发送无限 AI 消息”。模型推理费由用户在对应供应商的 API 账户中支付，**不消耗**个人 Pro / Pro+ / Ultra 的 Other Models 已含美元额度。
- 官方 BYOK 文档没有列出套餐门槛；但 Cursor 官方社区已明确 Ask 模式的 BYOK 需要 Pro。因而不应把 Hobby 视为一个可靠的 BYOK 入口；涉及 Agent 时，以实际模型选择器和账户提示为准。
- 供应商支持范围并不完全相同：OpenAI 仅限标准、非推理聊天模型；Anthropic 支持其 API 可用的 Claude；Google 支持 Google AI API 可用的 Gemini；Azure OpenAI 与 AWS Bedrock 取决于用户自己的部署或配置。
- BYOK 仅适用于供应商的聊天模型。Tab 补全仍使用 Cursor 内置模型；Cursor 自有的 Composer、Grok，以及 Auto 路由不应被当作可用自有 Key 替代的能力。
- 在个人 Pro 上，官方没有规定额外 Cursor Token Rate；但 Teams 与 Enterprise 对第三方请求（**包括 BYOK**）收取 $0.25 / 百万 token 的 Cursor Token Rate，且该费用另计于用户支付给模型供应商的推理费之外。
- API Key 不会由 Cursor 持久化存储，但每次请求会经 Cursor 后端完成 prompt 构建与路由；使用 BYOK 时不享受 Cursor 的 Zero Data Retention，数据处理以所选模型供应商的政策为准。

因此，个人 Pro 的完整成本模型是：

```text
$20 / 月 Cursor 订阅
+ Cursor 内含的自有模型容量
+ $20 / 月 Cursor 代付的第三方模型预算
+ 手动选择的 BYOK 模型在供应商侧产生的 API 费用
```

BYOK 不会让用户绕过 Cursor 的所有价值与限制：它不能替代 Tab、Cursor 自有模型或 Auto，也不能消除团队/企业的 Cursor Token Rate 与支出上限。

## 3. Cursor Models：公开单价与不可计算的内含额度

以下是 Cursor 公开的按百万 token 计费标准。它们是**超额按量使用的价格参考**，不是 Cursor 公布的已含池转换规则。

| 模型 | 速度 | 输入 | 缓存读取 | 输出 |
| --- | --- | ---: | ---: | ---: |
| Composer 2.5 | Standard | $0.50 | $0.20 | $2.50 |
| Composer 2.5 | Fast | $3.00 | $0.50 | $15.00 |
| Grok 4.5 | Standard | $2.00 | $0.50 | $6.00 |
| Grok 4.5 | Fast | $4.00 | $1.00 | $12.00 |
| Grok 4.6 | Standard | $2.00 | $0.50 | $6.00 |
| Grok 4.6 | Fast | $4.00 | $1.00 | $12.00 |


## 4. 当前主要第三方模型与单价

下表为当前模型文档中展示的主要第三方模型，单位均为美元 / 百万 token。`—` 表示当前表中未列缓存写入价格。

| 模型 | 输入 | 缓存写入 | 缓存读取 | 输出 |
| --- | ---: | ---: | ---: | ---: |
| Claude Fable 5 | $10.00 | $12.50 | $1.00 | $50.00 |
| Claude Opus 5 | $5.00 | $6.25 | $0.50 | $25.00 |
| Claude Sonnet 5 | $2.00 | $2.50 | $0.20 | $10.00 |
| Gemini 3.1 Pro | $2.00 | — | $0.20 | $12.00 |
| Gemini 3.7 Flash | $0.75 | — | $0.075 | $3.50 |
| GPT-5.6 Luna | $0.20 | $0.25 | $0.02 | $1.20 |
| GPT-5.6 Terra | $2.00 | $2.50 | $0.20 | $12.00 |
| GPT-5.6 Sol | $5.00 | $6.25 | $0.50 | $30.00 |

付费用户还可选择 Auto。Auto Cost 以固定单价计费；Auto Balance 与 Auto Intelligence 按实际路由到的模型价格计费。Router 的一次请求可能从 Cursor Models 池或 Other Models 池扣减，取决于最终选中的模型。

## 5. 用完额度后的行为

- 两个池均随月度账单周期重置，未使用额度不结转。
- 当前按量套餐的公开商业额度以**整个月度账单周期**计算；Cursor 没有公布类似“每 5 小时 N 次”或“每周 N 次”的固定套餐配额。不要把早期 request-based 套餐或其他产品的短周期限额混入当前规则。
- 用完已含用量后，用户可升级套餐或主动开启 on-demand usage。
- Cursor 表示 on-demand 下请求不会被自动降质或降速；用户可设置月度超额消费上限。
- 达到超额消费上限时，该用户的 AI 功能暂停，到下一个账单周期自动恢复。
- 当前使用量、两个池的剩余量和超额费用在 Spending Dashboard 中查看。

当前使用量套餐不含历史的 Max Mode；不要把旧的“每月 N 次请求”或“Max Mode 加价 20%”说明当作新套餐规则。

这不等于 Cursor 承诺不存在技术性限流。服务仍可能因并发、异常流量、模型供应商可用性或安全风控而临时限制请求，但 Cursor 没有把这类保护机制公布为可购买、可预估的 5 小时或周度额度。

## 6. Teams 与 Enterprise

| 套餐 | 月价 | 内容与额度 |
| --- | ---: | --- |
| Teams Standard | $40 / 人 | 个人版能力，加上集中账单和管理、团队规则/Skills/插件市场、共享上下文 Cloud Agents、Bugbot、用量分析、团队隐私模式、SAML/OIDC；每席至少含 $20 / 月 Agent 用量 |
| Teams Premium | $120 / 人 | 功能相同；Agent 用量为 Standard 的 5 倍 |
| Unpaid Admin | $0 / 人 | 只能管理团队，不可使用 Cursor |
| Enterprise | 定制 | 共享用量池、发票/PO、SCIM、审计日志、模型/仓库/MCP 管控、成员级消费上限、优先支持等 |

Teams 的第三方模型在公开 API 单价上另加 Cursor Token Rate（$0.25 / 百万 token）；Cursor 自有模型与 Auto Cost 不收这项附加费。Teams 可以设团队级消费上限，Enterprise 额外支持成员和群组级上限。

Teams 按活跃付费席位收费，成员中途加入按比例计费。年付价格为 Standard $32 / 人 / 月、Premium $96 / 人 / 月；月付为 $40 / $120。

## 官方来源

- [Pricing](https://cursor.com/pricing)
- [Models & Pricing](https://cursor.com/docs/models-and-pricing)
- [Usage and limits](https://cursor.com/help/models-and-usage/usage-limits)
- [Available models](https://cursor.com/help/models-and-usage/available-models)
- [Bring your own API key](https://cursor.com/help/models-and-usage/api-keys)
- [Cursor Token Rate](https://cursor.com/help/models-and-usage/token-rate)
- [BYOK requires Pro for Ask — Cursor Community](https://forum.cursor.com/t/ask-mode-with-my-own-api-key-required-pro-subscription/150484/3)
- [Composer 2.5 pricing](https://cursor.com/docs/models/cursor-composer-2-5)
- [Grok 4.5 pricing](https://cursor.com/docs/models/grok-4-5)
- [Grok 4.6 pricing](https://cursor.com/docs/models/grok-4-6)
- [Team pricing](https://cursor.com/docs/account/teams/pricing)
- [Teams pricing update](https://cursor.com/blog/teams-pricing-june-2026)
- [Spend limits](https://cursor.com/help/account-and-billing/spend-limits)


## 7. 对 Cursor 定价策略的准确理解

1. **对外透明的是高成本第三方模型预算。** 用户能按 API 单价判断 $20、$70、$400 的价值。
2. **对外不透明的是 Cursor 自有模型容量。** 这是 Cursor 用来保证默认体验、弹性调整成本并引导用户优先使用自有模型的空间。
3. **升级包含两种价值。** 一部分是可明确计算的第三方预算；另一部分是不可精确换算的自有模型容量与更高 Agent 限额。
4. **团队溢价不只卖模型。** 它同时卖治理、可见性、安全和统一采购能力。