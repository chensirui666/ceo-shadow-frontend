export const messageSources = ['dingtalk', 'feishu', 'teams', 'slack', 'wecom', 'discord'] as const
export const messageStatuses = ['pending', 'processing', 'needs-confirmation', 'processed', 'skipped', 'failed'] as const

export type MessageSource = typeof messageSources[number]
export type MessageStatus = typeof messageStatuses[number]
export type MessageFeedback = { rating: 'up' | 'down'; reason: string }
export type MessageFilters = { source: MessageSource | 'all'; category: string; subject: string; sender: string }
export type Message = {
  id: string
  source: MessageSource
  category: string
  subject: string
  sender: string
  receivedAt: string
  status: MessageStatus
  question: string
  rationale: string
  result: string
  taskSummary: string
  references: string[]
  timeline: string[]
  feedback: MessageFeedback[]
}
export type MessageSnapshot = { messages: Message[] }

const at = (now: Date, minutes: number) => new Date(now.getTime() + minutes * 60_000).toISOString()

export const createDemoMessageSnapshot = (now = new Date()): MessageSnapshot => ({
  messages: [
    { id: 'delivery-commitment', source: 'feishu', category: '客户交付', subject: '客户交付群', sender: '赵明', receivedAt: at(now, -8), status: 'needs-confirmation', question: '是否可以承诺本月完成交付？', rationale: '涉及交付时间承诺，需要你确认。', result: '等待确认后再回复客户。', taskSummary: '关联 Task：确认交付资源与最终排期', references: ['客户交付群消息'], timeline: ['收到客户交付承诺询问'], feedback: [] },
    { id: 'pricing-review', source: 'dingtalk', category: '报价协同', subject: '销售支持群', sender: '林悦', receivedAt: at(now, -14), status: 'pending', question: '新客户的报价说明今天能发出吗？', rationale: '已收到请求，等待开始整理信息。', result: '等待处理。', taskSummary: '关联 Task：核对报价版本', references: ['销售支持群消息'], timeline: ['已收到待处理请求'], feedback: [] },
    { id: 'rollout-scope', source: 'dingtalk', category: '发布协同', subject: '研发协同群', sender: '周航', receivedAt: at(now, -22), status: 'processing', question: '灰度范围能再确认一下吗？', rationale: '正在整理发布评审与运营反馈。', result: '正在生成确认口径。', taskSummary: '关联 Task：确认首批灰度名单', references: ['发布评审听记'], timeline: ['已开始整理上下文'], feedback: [] },
    { id: 'weekly-summary', source: 'teams', category: '项目同步', subject: '项目频道', sender: 'Maya', receivedAt: at(now, -49), status: 'processed', question: '可以分享本周上线检查清单吗？', rationale: '符合已确认的项目同步范围。', result: '已整理检查清单并同步。', taskSummary: '关联 Task：整理上线检查清单', references: ['项目频道消息'], timeline: ['已完成同步'], feedback: [] },
    { id: 'budget-reminder', source: 'dingtalk', category: '通知', subject: '预算协同群', sender: '系统通知', receivedAt: at(now, -77), status: 'skipped', question: '预算表已更新，请知悉。', rationale: '这是无需处理的通知。', result: '已跳过，不创建后续动作。', taskSummary: '无关联 Task', references: ['预算表更新通知'], timeline: ['已跳过'], feedback: [] },
    { id: 'expired-connection', source: 'feishu', category: '连接异常', subject: '客户交付群', sender: '陈晓', receivedAt: at(now, -105), status: 'failed', question: '预算表已经更新了吗？', rationale: '飞书连接已失效，未能完成处理。', result: '处理失败，等待重新连接。', taskSummary: '关联 Task：检查飞书连接', references: ['飞书连接状态'], timeline: ['处理失败'], feedback: [] },
  ],
})

export const createDefaultMessageFilters = (): MessageFilters => ({ source: 'all', category: 'all', subject: 'all', sender: 'all' })

export const selectMessages = (snapshot: MessageSnapshot, status: MessageStatus | 'all', filters = createDefaultMessageFilters()): Message[] => (
  [...snapshot.messages
    .filter((message) => status === 'all' || message.status === status)
    .filter((message) => filters.source === 'all' || message.source === filters.source)
    .filter((message) => filters.category === 'all' || message.category === filters.category)
    .filter((message) => filters.subject === 'all' || message.subject === filters.subject)
    .filter((message) => filters.sender === 'all' || message.sender === filters.sender)]
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
)

export const messageStatusCount = (snapshot: MessageSnapshot, status: MessageStatus): number => selectMessages(snapshot, status).length

export const canProvideMessageFeedback = (message: Message): boolean => ['processed', 'skipped', 'failed'].includes(message.status)

const updatePendingMessage = (snapshot: MessageSnapshot, id: string, status: 'processed' | 'skipped'): MessageSnapshot => ({
  ...snapshot,
  messages: snapshot.messages.map((message) => message.id === id && message.status === 'needs-confirmation' ? { ...message, status } : message),
})

export const confirmMessage = (snapshot: MessageSnapshot, id: string): MessageSnapshot => updatePendingMessage(snapshot, id, 'processed')
export const skipMessage = (snapshot: MessageSnapshot, id: string): MessageSnapshot => updatePendingMessage(snapshot, id, 'skipped')

export const recordMessageFeedback = (snapshot: MessageSnapshot, id: string, feedback: MessageFeedback): MessageSnapshot => {
  const message = snapshot.messages.find((item) => item.id === id)
  const reason = feedback.reason.trim()
  if (!message || !canProvideMessageFeedback(message) || (feedback.rating === 'down' && !reason)) return snapshot
  return { ...snapshot, messages: snapshot.messages.map((item) => item.id === id ? { ...item, feedback: [...item.feedback, { ...feedback, reason }] } : item) }
}
