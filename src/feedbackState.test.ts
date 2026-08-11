import assert from 'node:assert/strict'
import test from 'node:test'

const feedback = await import('./feedbackState.ts')

test('Feedback ranges and time formatting keep the UI contract explicit', () => {
  assert.deepEqual(feedback.feedbackRanges, ['7d', '30d', 'all'])
  assert.equal(feedback.formatFeedbackTime('2026-08-10T02:23:00.000Z', 'zh'), '2026年8月10日 10:23')
})
