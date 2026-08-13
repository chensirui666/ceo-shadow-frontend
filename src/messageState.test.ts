import assert from 'node:assert/strict'
import test from 'node:test'

const messageState = await import('./messageState.ts')

test('fixture is newest first and filtering and counts use the same messages', () => {
  const snapshot = messageState.createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const receivedAt = snapshot.messages.map((message) => message.receivedAt)
  const pending = messageState.selectMessages(snapshot, 'needs-confirmation')

  assert.deepEqual(receivedAt, [...receivedAt].sort().reverse())
  assert.equal(messageState.messageStatusCount(snapshot, 'needs-confirmation'), pending.length)
  assert.equal(messageState.selectMessages(snapshot, 'all').length, snapshot.messages.length)
  assert.deepEqual([...new Set(snapshot.messages.map((message) => message.source))].sort(), ['dingtalk', 'feishu', 'teams'])
})

test('confirm and skip only resolve messages awaiting confirmation without changing their task summaries', () => {
  const snapshot = messageState.createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const pending = snapshot.messages.find((message) => message.status === 'needs-confirmation')!
  const confirmed = messageState.confirmMessage(snapshot, pending.id)
  const skipped = messageState.skipMessage(snapshot, pending.id)
  const processing = snapshot.messages.find((message) => message.status === 'processing')!

  assert.equal(confirmed.messages.find((message) => message.id === pending.id)?.status, 'processed')
  assert.equal(skipped.messages.find((message) => message.id === pending.id)?.status, 'skipped')
  assert.equal(confirmed.messages.find((message) => message.id === pending.id)?.taskSummary, pending.taskSummary)
  assert.equal(skipped.messages.find((message) => message.id === pending.id)?.taskSummary, pending.taskSummary)
  assert.equal(messageState.confirmMessage(snapshot, processing.id).messages.find((message) => message.id === processing.id)?.status, 'processing')
})

test('feedback records only local feedback and preserves the Message decision and result', () => {
  const snapshot = messageState.createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const message = snapshot.messages[0]
  const updated = messageState.recordMessageFeedback(snapshot, message.id, { rating: 'down', reason: '处理结果需要先确认排期。' })
  const result = updated.messages[0]

  assert.deepEqual(result.feedback, [{ rating: 'down', reason: '处理结果需要先确认排期。' }])
  assert.equal(result.question, message.question)
  assert.equal(result.rationale, message.rationale)
  assert.equal(result.result, message.result)
})
