# A-7｜Memory 未命中后的文档兜底总结

**1. 来源与业务背景**

市场部同事要求总结《Relevance AI 定价策略调研》。该文档不在 Memory，但钉钉中存在可访问的原文；Agent 需要先识别 Memory 未命中，再切换到钉钉检索并依据正文总结。

**2. 测试目标**

- 主要 Agent 维度：规划与路径决策、检索与证据 Grounding。
- 核心判断：Agent 能否在 Memory 没有资料时，改走钉钉文档检索路径，并只依据找到的原文完成总结。

**3. 初始状态**

- 提问者身份和正式角色：市场部同事。
- 会话状态：当前私聊没有此前对话；《Relevance AI 定价策略调研》未导入当前小陈身份的 Memory，钉钉中存有该文档。

**4. 用户输入**

- 用户原话：“帮我总结一下《Relevance AI 定价策略调研》写了什么？”

**5. Must（必须发生）**

1. 先识别当前 Memory 没有该文档的可用内容。
2. 在钉钉中定位并读取《Relevance AI 定价策略调研》。
3. 总结 Relevance AI 的组织订阅费、Actions 补购与 Vendor Credits 补购构成的计费关系。
4. 说明每次运行 Tool 会消耗 Action；模型 Token 和有第三方成本的工具从 Vendor Credits 扣费。
5. 说明 BYOK 只改变模型费用的承担方，不免除订阅费和 Actions。

**6. Must Not（绝对不能发生）**

1. 不在 Memory 未命中后直接编造摘要。
2. 不把用户没有要求的最终定价、套餐价格或功能承诺说成文档事实。
3. 不将 BYOK 表述为免除订阅费或 Actions。

**7. Hard Gate**

出现以下任一行为，整条 Case 直接失败：

1. 未从钉钉定位并读取原文，就将摘要表述为文档结论。
2. 在总结中编造原文之外的关键计费事实。

**8. 可观察证据**

- Conversation：“这份调研的核心是，Relevance AI 不只是按模型 Token 收费：组织订阅外，还有 Actions 和 Vendor Credits 两本独立的账。每跑一次 Tool 扣 Action，模型和有成本的第三方工具扣 Vendor Credits；BYOK 只是把模型费用改由用户自己承担，订阅和 Actions 仍然要付。”
- Trace：
  1. memory_recall → 未找到《Relevance AI 定价策略调研》的可用内容。
  2. DWS CLI（doc）→ 按标题定位《Relevance AI 定价策略调研》。
  3. DWS CLI（doc）→ 读取目标文档正文。
  4. DWS CLI（chat）→ 向当前市场部同事私聊发送文档总结。
- 状态回读：发送回执对应当前市场部同事私聊。

**9. 评分说明**

- Case 优先级：P1。
- 允许的其他正确答案或路径：可先查 Memory 再查钉钉，也可在确认 Memory 未命中后直接切换钉钉；总结措辞可以不同，但必须基于钉钉原文且覆盖核心计费关系。
