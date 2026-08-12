import assert from 'node:assert/strict'
import test from 'node:test'

const feedback = await import('./feedbackState.ts')
const { feedbackService } = await import('./feedbackService.ts')

test('Feedback ranges and time formatting keep the UI contract explicit', () => {
  assert.deepEqual(feedback.feedbackRanges, ['7d', '30d', 'all'])
  assert.equal(feedback.formatFeedbackTime('2026-08-10T02:23:00.000Z', 'zh'), '2026年8月10日 10:23')
})

test('English Feedback localization replaces every visible demo reply and note', async () => {
  const localizedFeedbackDetail = (feedback as unknown as {
    localizedFeedbackDetail?: (detail: Awaited<ReturnType<typeof feedbackService.loadDetail>>, locale: 'en' | 'zh') => Awaited<ReturnType<typeof feedbackService.loadDetail>>
  }).localizedFeedbackDetail
  assert.equal(typeof localizedFeedbackDetail, 'function', 'Feedback should localize demo content before it reaches the English UI')
  if (typeof localizedFeedbackDetail !== 'function') return

  const english = localizedFeedbackDetail(await feedbackService.loadDetail('feedback-1'), 'en')

  assert.equal(english.question, 'Can we complete the launch this week?')
  assert.equal(english.note, 'Do not promise a date when the information is incomplete.')
  assert.doesNotMatch(JSON.stringify(english), /\p{Script=Han}/u)
})
