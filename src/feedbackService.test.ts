import assert from 'node:assert/strict'
import test from 'node:test'
import { feedbackService } from './feedbackService.ts'

test('local demo service filters cards and keeps a complete feedback detail', async () => {
  const [weekDashboard, weekCards, monthDashboard, monthCards, allCards] = await Promise.all([
    feedbackService.loadDashboard('7d'),
    feedbackService.loadCards('7d'),
    feedbackService.loadDashboard('30d'),
    feedbackService.loadCards('30d'),
    feedbackService.loadCards('all'),
  ])

  assert.ok(weekDashboard.metrics.feedbackCount > 0)
  assert.ok(allCards.length > weekCards.length)
  assert.equal(weekCards[0].sentiment, 'negative')
  assert.deepEqual(monthDashboard.sourceTotals, { recipient: 4, owner: 5 })
  assert.equal(monthCards.filter((item) => item.source === 'recipient').length, 4)

  const detail = await feedbackService.loadDetail(weekCards[0].id)
  assert.equal(detail.id, weekCards[0].id)
  assert.ok(detail.feedback.length > 0)
})
