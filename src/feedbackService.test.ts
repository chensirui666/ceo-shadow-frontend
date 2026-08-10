import assert from 'node:assert/strict'
import test from 'node:test'
import { createFeedbackService } from './feedbackService.ts'

test('service requests dashboard, card page, and detail from the feedback API', async () => {
  const requests: string[] = []
  const service = createFeedbackService(async (input) => {
    requests.push(String(input))
    return new Response(JSON.stringify({ metrics: {}, trend: [], sourceTotals: {}, items: [], nextCursor: null, feedback: [] }))
  })

  await service.loadDashboard('7d')
  await service.loadCards('7d', null)
  await service.loadDetail('feedback-1')
  assert.deepEqual(requests, ['/api/feedback/dashboard?range=7d', '/api/feedback?range=7d', '/api/feedback/feedback-1'])
})
