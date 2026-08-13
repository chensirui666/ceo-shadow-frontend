import assert from 'node:assert/strict'
import test from 'node:test'

const { createDemoMessageSnapshot } = await import('./messageState.ts')
const { createMessageService } = await import('./messageService.ts')

test('each service action returns a fresh local snapshot without changing an earlier load', async () => {
  const initial = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const service = createMessageService(initial)
  const before = await service.load()
  const pending = before.messages.find((message) => message.status === 'needs-confirmation')!
  const confirmed = await service.confirm(pending.id)
  const skipped = await createMessageService(initial).skip(pending.id)
  const feedback = await createMessageService(initial).submitFeedback(pending.id, { rating: 'up', reason: '判断清楚。' })

  assert.notEqual(confirmed, before)
  assert.equal(before.messages.find((message) => message.id === pending.id)?.status, 'needs-confirmation')
  assert.equal(confirmed.messages.find((message) => message.id === pending.id)?.status, 'processed')
  assert.equal(skipped.messages.find((message) => message.id === pending.id)?.status, 'skipped')
  assert.deepEqual(feedback.messages.find((message) => message.id === pending.id)?.feedback, [{ rating: 'up', reason: '判断清楚。' }])
})
