import type { FeedbackCard, FeedbackDashboardData, FeedbackDetail, FeedbackRange } from './feedbackState.ts'

const day = 24 * 60 * 60 * 1000
const date = (daysAgo: number) => new Date(Date.now() - daysAgo * day).toISOString()
const label = (daysAgo: number) => new Intl.DateTimeFormat('en', { month: 'numeric', day: 'numeric' }).format(new Date(Date.now() - daysAgo * day))

const records: FeedbackDetail[] = [
  { id: 'feedback-1', replyId: 'reply-1', source: 'owner', sentiment: 'negative', question: '这周能完成上线吗？', reply: '可以，周五前会完成。', note: '信息不足时不要直接承诺时间。', createdAt: date(0), feedback: [{ id: 'feedback-1a', source: 'owner', sentiment: 'negative', note: '信息不足时不要直接承诺时间。', createdAt: date(0) }] },
  { id: 'feedback-2', replyId: 'reply-2', source: 'recipient', sentiment: 'negative', question: '客户的预算什么时候能确认？', reply: '今天下午会有结果。', note: '不要把未确认的时间说成确定结论。', createdAt: date(1), feedback: [{ id: 'feedback-2a', source: 'recipient', sentiment: 'negative', note: '不要把未确认的时间说成确定结论。', createdAt: date(1) }] },
  { id: 'feedback-3', replyId: 'reply-3', source: 'owner', sentiment: 'negative', question: '这个方案和上次相比有什么变化？', reply: '整体方向没变，细节后续再补。', note: '需要先给出关键变化，再说明待确认项。', createdAt: date(4), feedback: [{ id: 'feedback-3a', source: 'owner', sentiment: 'negative', note: '需要先给出关键变化，再说明待确认项。', createdAt: date(4) }] },
  { id: 'feedback-4', replyId: 'reply-4', source: 'recipient', sentiment: 'positive', question: '能否把会议结论同步一下？', reply: '可以。我整理了三个结论和两项待办，会后发到群里。', note: '结论清楚，也说明了下一步。', createdAt: date(2), feedback: [{ id: 'feedback-4a', source: 'recipient', sentiment: 'positive', note: '结论清楚，也说明了下一步。', createdAt: date(2) }] },
  { id: 'feedback-5', replyId: 'reply-5', source: 'owner', sentiment: 'positive', question: '帮我回复一下项目进度。', reply: '目前核心流程已完成，风险集中在数据验收，预计周三给出结论。', note: '先讲进展和风险，表达符合我的习惯。', createdAt: date(3), feedback: [{ id: 'feedback-5a', source: 'owner', sentiment: 'positive', note: '先讲进展和风险，表达符合我的习惯。', createdAt: date(3) }] },
  { id: 'feedback-6', replyId: 'reply-6', source: 'recipient', sentiment: 'positive', question: '下周的演示要准备什么？', reply: '我会准备演示环境、客户问题清单和负责人分工，周一上午一起确认。', note: '回答具体，知道下一步该做什么。', createdAt: date(6), feedback: [{ id: 'feedback-6a', source: 'recipient', sentiment: 'positive', note: '回答具体，知道下一步该做什么。', createdAt: date(6) }] },
  { id: 'feedback-7', replyId: 'reply-7', source: 'owner', sentiment: 'negative', question: '这份合同能直接签吗？', reply: '可以，条款看起来没有问题。', note: '涉及风险时先说明需要法务确认。', createdAt: date(11), feedback: [{ id: 'feedback-7a', source: 'owner', sentiment: 'negative', note: '涉及风险时先说明需要法务确认。', createdAt: date(11) }] },
  { id: 'feedback-8', replyId: 'reply-8', source: 'recipient', sentiment: 'positive', question: '数据异常怎么处理？', reply: '我先核对来源和影响范围，确认后给你一份修复建议与时间表。', note: '没有越过事实，处理方式很清晰。', createdAt: date(16), feedback: [{ id: 'feedback-8a', source: 'recipient', sentiment: 'positive', note: '没有越过事实，处理方式很清晰。', createdAt: date(16) }] },
  { id: 'feedback-9', replyId: 'reply-9', source: 'owner', sentiment: 'positive', question: '把这次复盘发给团队。', reply: '我会按背景、结论、待办和负责人整理后发出。', note: '结构对，语气也合适。', createdAt: date(24), feedback: [{ id: 'feedback-9a', source: 'owner', sentiment: 'positive', note: '结构对，语气也合适。', createdAt: date(24) }] },
  { id: 'feedback-10', replyId: 'reply-10', source: 'recipient', sentiment: 'negative', question: '这个需求为什么要延期？', reply: '因为排期太紧了。', note: '需要交代具体原因和可选方案。', createdAt: date(42), feedback: [{ id: 'feedback-10a', source: 'recipient', sentiment: 'negative', note: '需要交代具体原因和可选方案。', createdAt: date(42) }] },
  { id: 'feedback-11', replyId: 'reply-11', source: 'recipient', sentiment: 'positive', question: '客户问的三个问题有回应吗？', reply: '已逐项回复，其中价格问题等销售确认后补充。', note: '边界和已完成事项都说清楚了。', createdAt: date(58), feedback: [{ id: 'feedback-11a', source: 'recipient', sentiment: 'positive', note: '边界和已完成事项都说清楚了。', createdAt: date(58) }] },
]

const dashboards: Record<FeedbackRange, FeedbackDashboardData> = {
  '7d': { metrics: { feedbackCount: 6, coverageRate: 0.68, positiveRate: 0.5, attentionCount: 3 }, trend: [{ label: label(6), positive: 1, negative: 0 }, { label: label(4), positive: 0, negative: 1 }, { label: label(3), positive: 1, negative: 0 }, { label: label(2), positive: 1, negative: 0 }, { label: label(1), positive: 0, negative: 1 }, { label: label(0), positive: 0, negative: 1 }], sourceTotals: { recipient: 3, owner: 3 } },
  '30d': { metrics: { feedbackCount: 9, coverageRate: 0.71, positiveRate: 0.56, attentionCount: 4 }, trend: [{ label: label(28), positive: 1, negative: 0 }, { label: label(21), positive: 1, negative: 0 }, { label: label(14), positive: 1, negative: 1 }, { label: label(7), positive: 1, negative: 1 }, { label: label(0), positive: 1, negative: 2 }], sourceTotals: { recipient: 4, owner: 5 } },
  all: { metrics: { feedbackCount: 11, coverageRate: 0.69, positiveRate: 0.55, attentionCount: 5 }, trend: [{ label: label(60), positive: 1, negative: 0 }, { label: label(30), positive: 2, negative: 1 }, { label: label(0), positive: 3, negative: 4 }], sourceTotals: { recipient: 6, owner: 5 } },
}

const cardsFor = (range: FeedbackRange): FeedbackCard[] => {
  const limit = range === '7d' ? 7 : range === '30d' ? 30 : Infinity
  return records
    .filter((item) => Date.now() - Date.parse(item.createdAt) < limit * day)
    .sort((left, right) => Number(right.sentiment === 'negative') - Number(left.sentiment === 'negative') || Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .map(({ feedback, ...card }) => card)
}

export const feedbackService = {
  loadDashboard: async (range: FeedbackRange) => dashboards[range],
  loadCards: async (range: FeedbackRange) => cardsFor(range),
  loadDetail: async (id: string) => {
    const detail = records.find((item) => item.id === id)
    if (!detail) throw new Error(`Unknown demo feedback: ${id}`)
    return detail
  },
}
