import assert from 'node:assert/strict'
import test from 'node:test'
import { createFeedbackService } from './feedbackService.ts'

const dashboard = {
  metrics: { feedbackCount: 1, coverageRate: 1, positiveRate: 1, attentionCount: 0 },
  trend: [],
  sourceTotals: { recipient: 1, owner: 0 },
}
const card = { id: 'feedback-1', replyId: 'reply-1', source: 'recipient', sentiment: 'positive', question: 'Question?', reply: 'Reply.', note: 'Helpful', createdAt: '2026-08-10T09:30:00.000Z' }

test('service requests dashboard, card page, and detail from the feedback API', async () => {
  const requests: string[] = []
  const service = createFeedbackService(async (input) => {
    requests.push(String(input))
    const url = String(input)
    return new Response(JSON.stringify(url.includes('dashboard') ? dashboard : url === '/api/feedback?range=7d' ? { items: [card], nextCursor: null } : { ...card, feedback: [card] }))
  })

  await service.loadDashboard('7d')
  await service.loadCards('7d', null)
  await service.loadDetail('feedback-1')
  assert.deepEqual(requests, ['/api/feedback/dashboard?range=7d', '/api/feedback?range=7d', '/api/feedback/feedback-1'])
})

test('service rejects malformed successful payloads at each feedback endpoint', async () => {
  for (const operation of ['dashboard', 'cards', 'detail'] as const) {
    const service = createFeedbackService(async () => new Response(JSON.stringify({ unexpected: true })))
    const result = operation === 'dashboard' ? service.loadDashboard('7d') : operation === 'cards' ? service.loadCards('7d', null) : service.loadDetail('feedback-1')
    await assert.rejects(result, /Invalid feedback (dashboard|cards|detail) payload/)
  }
})
