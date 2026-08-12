export const feedbackRanges = ['7d', '30d', 'all'] as const
export type FeedbackRange = typeof feedbackRanges[number]
export type FeedbackSource = 'recipient' | 'owner'
export type FeedbackSentiment = 'positive' | 'negative'

export type FeedbackMetricSet = { feedbackCount: number; coverageRate: number; positiveRate: number; attentionCount: number }
export type FeedbackTrendPoint = { label: string; positive: number; negative: number }
export type FeedbackDashboardData = { metrics: FeedbackMetricSet; trend: FeedbackTrendPoint[]; sourceTotals: Record<FeedbackSource, number> }
export type FeedbackCard = { id: string; replyId: string; source: FeedbackSource; sentiment: FeedbackSentiment; question: string; reply: string; note: string; createdAt: string }
export type FeedbackDetail = FeedbackCard & { feedback: Array<Pick<FeedbackCard, 'id' | 'source' | 'sentiment' | 'note' | 'createdAt'>> }

export const formatFeedbackTime = (value: string, locale: 'en' | 'zh') => new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value))

const englishFeedbackCopy: Record<string, Pick<FeedbackCard, 'question' | 'reply' | 'note'>> = {
  'feedback-1': { question: 'Can we complete the launch this week?', reply: 'Yes, we will complete it by Friday.', note: 'Do not promise a date when the information is incomplete.' },
  'feedback-2': { question: 'When will the client budget be confirmed?', reply: 'We will have the result this afternoon.', note: 'Do not present an unconfirmed time as a final conclusion.' },
  'feedback-3': { question: 'What changed in this plan compared with the last one?', reply: 'The overall direction is unchanged; we will fill in the details later.', note: 'State the key changes first, then explain what still needs confirmation.' },
  'feedback-4': { question: 'Can you share the meeting conclusions?', reply: 'Yes. I organized three conclusions and two action items and will post them in the group after the meeting.', note: 'The conclusion is clear and it explains the next step.' },
  'feedback-5': { question: 'Help me reply with the project progress.', reply: 'The core flow is complete. Risk is concentrated in data acceptance, and we expect a conclusion by Wednesday.', note: 'It leads with progress and risk, matching my communication style.' },
  'feedback-6': { question: 'What should we prepare for next week’s demo?', reply: 'I will prepare the demo environment, a list of client questions, and owner assignments; we can confirm them together Monday morning.', note: 'The answer is specific and makes the next step clear.' },
  'feedback-7': { question: 'Can we sign this contract as is?', reply: 'Yes, the terms look fine.', note: 'For a risk-sensitive decision, state that Legal confirmation is needed first.' },
  'feedback-8': { question: 'How should we handle the data anomaly?', reply: 'I will first verify the source and impact, then share a repair proposal and timeline once confirmed.', note: 'It stays within the facts and gives a clear approach.' },
  'feedback-9': { question: 'Send this retrospective to the team.', reply: 'I will organize it by background, conclusions, action items, and owners before sending it.', note: 'The structure and tone are right.' },
  'feedback-10': { question: 'Why does this requirement need to be delayed?', reply: 'Because the schedule is too tight.', note: 'Explain the concrete reason and the available options.' },
  'feedback-11': { question: 'Have the three client questions been answered?', reply: 'Each has been answered. We will add the pricing response after Sales confirms it.', note: 'It clearly states both the boundary and what is complete.' },
}

export const localizedFeedbackCards = (cards: FeedbackCard[], locale: 'en' | 'zh'): FeedbackCard[] => locale === 'zh' ? cards : cards.map((card) => ({ ...card, ...englishFeedbackCopy[card.id] }))

export const localizedFeedbackDetail = (detail: FeedbackDetail, locale: 'en' | 'zh'): FeedbackDetail => {
  if (locale === 'zh') return detail
  const copy = englishFeedbackCopy[detail.id]
  return copy ? { ...detail, ...copy, feedback: detail.feedback.map((item) => ({ ...item, note: copy.note })) } : detail
}
