import type { FeedbackCardPage, FeedbackDashboardData, FeedbackDetail, FeedbackRange } from './feedbackState.ts'

export type FeedbackService = {
  loadDashboard: (range: FeedbackRange) => Promise<FeedbackDashboardData>
  loadCards: (range: FeedbackRange, cursor: string | null) => Promise<FeedbackCardPage>
  loadDetail: (id: string) => Promise<FeedbackDetail>
}

const readJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) throw new Error(`Feedback request failed: ${response.status}`)
  return response.json() as Promise<T>
}

export const createFeedbackService = (request: typeof fetch = fetch): FeedbackService => ({
  loadDashboard: (range) => request('/api/feedback/dashboard?range=' + range).then(readJson<FeedbackDashboardData>),
  loadCards: (range, cursor) => request('/api/feedback?range=' + range + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '')).then(readJson<FeedbackCardPage>),
  loadDetail: (id) => request('/api/feedback/' + encodeURIComponent(id)).then(readJson<FeedbackDetail>),
})

export const feedbackService = createFeedbackService()
