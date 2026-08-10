import type { FeedbackCardPage, FeedbackDashboardData, FeedbackDetail, FeedbackRange } from './feedbackState.ts'

export type FeedbackService = {
  loadDashboard: (range: FeedbackRange) => Promise<FeedbackDashboardData>
  loadCards: (range: FeedbackRange, cursor: string | null) => Promise<FeedbackCardPage>
  loadDetail: (id: string) => Promise<FeedbackDetail>
}

type JsonRecord = Record<string, unknown>

const isRecord = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isSource = (value: unknown) => value === 'recipient' || value === 'owner'
const isSentiment = (value: unknown) => value === 'positive' || value === 'negative'
const isFeedbackRecord = (value: unknown) => isRecord(value)
  && typeof value.id === 'string' && isSource(value.source) && isSentiment(value.sentiment)
  && typeof value.note === 'string' && typeof value.createdAt === 'string' && !Number.isNaN(Date.parse(value.createdAt))
const isCard = (value: unknown) => isFeedbackRecord(value) && isRecord(value)
  && typeof value.replyId === 'string' && typeof value.question === 'string' && typeof value.reply === 'string'

const isDashboard = (value: unknown): value is FeedbackDashboardData => isRecord(value) && isRecord(value.metrics)
  && isNumber(value.metrics.feedbackCount) && isNumber(value.metrics.coverageRate) && isNumber(value.metrics.positiveRate) && isNumber(value.metrics.attentionCount)
  && Array.isArray(value.trend) && value.trend.every((point) => isRecord(point) && typeof point.label === 'string' && isNumber(point.positive) && isNumber(point.negative))
  && isRecord(value.sourceTotals) && isNumber(value.sourceTotals.recipient) && isNumber(value.sourceTotals.owner)
const isCardPage = (value: unknown): value is FeedbackCardPage => isRecord(value) && Array.isArray(value.items)
  && value.items.every(isCard) && (value.nextCursor === null || typeof value.nextCursor === 'string')
const isDetail = (value: unknown): value is FeedbackDetail => isCard(value) && isRecord(value)
  && Array.isArray(value.feedback) && value.feedback.every(isFeedbackRecord)

const readJson = async <T>(response: Response, endpoint: string, guard: (value: unknown) => value is T): Promise<T> => {
  if (!response.ok) throw new Error(`Feedback request failed: ${response.status}`)
  const payload: unknown = await response.json()
  if (!guard(payload)) throw new Error(`Invalid feedback ${endpoint} payload`)
  return payload
}

export const createFeedbackService = (request: typeof fetch = fetch): FeedbackService => ({
  loadDashboard: (range) => request('/api/feedback/dashboard?range=' + range).then((response) => readJson(response, 'dashboard', isDashboard)),
  loadCards: (range, cursor) => request('/api/feedback?range=' + range + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '')).then((response) => readJson(response, 'cards', isCardPage)),
  loadDetail: (id) => request('/api/feedback/' + encodeURIComponent(id)).then((response) => readJson(response, 'detail', isDetail)),
})

export const feedbackService = createFeedbackService()
