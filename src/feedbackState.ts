export const feedbackRanges = ['7d', '30d', 'all'] as const
export type FeedbackRange = typeof feedbackRanges[number]
export type FeedbackSource = 'recipient' | 'owner'
export type FeedbackSentiment = 'positive' | 'negative'

export type FeedbackMetricSet = { feedbackCount: number; coverageRate: number; positiveRate: number; attentionCount: number }
export type FeedbackTrendPoint = { label: string; positive: number; negative: number }
export type FeedbackDashboardData = { metrics: FeedbackMetricSet; trend: FeedbackTrendPoint[]; sourceTotals: Record<FeedbackSource, number> }
export type FeedbackCard = { id: string; replyId: string; source: FeedbackSource; sentiment: FeedbackSentiment; question: string; reply: string; note: string; createdAt: string }
export type FeedbackCardPage = { items: FeedbackCard[]; nextCursor: string | null }
export type FeedbackDetail = FeedbackCard & { feedback: Array<Pick<FeedbackCard, 'id' | 'source' | 'sentiment' | 'note' | 'createdAt'>> }

export const formatFeedbackTime = (value: string, locale: 'en' | 'zh') => new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value))
