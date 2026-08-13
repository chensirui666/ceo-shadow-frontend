import assert from 'node:assert/strict'
import test from 'node:test'

const messageState = await import('./messageState.ts')

test('fixture has all six Message statuses and filtering and counts use the same messages', () => {
  const snapshot = messageState.createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const receivedAt = snapshot.messages.map((message) => message.receivedAt)
  const pending = messageState.selectMessages(snapshot, 'needs-confirmation')

  assert.deepEqual(receivedAt, [...receivedAt].sort().reverse())
  assert.deepEqual([...new Set(snapshot.messages.map((message) => message.status))].sort(), ['failed', 'needs-confirmation', 'pending', 'processed', 'processing', 'skipped'])
  assert.equal(messageState.messageStatusCount(snapshot, 'pending'), 1)
  assert.equal(messageState.messageStatusCount(snapshot, 'needs-confirmation'), pending.length)
  assert.equal(messageState.selectMessages(snapshot, 'all').length, snapshot.messages.length)
  assert.deepEqual([...new Set(snapshot.messages.map((message) => message.source))].sort(), ['dingtalk', 'feishu', 'teams'])
})

test('Message selection combines status with source, category, conversation, and sender filters', () => {
  const snapshot = messageState.createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const filters = { source: 'feishu', category: '客户交付', subject: '客户交付群', sender: '赵明' } as const

  assert.deepEqual(messageState.selectMessages(snapshot, 'needs-confirmation', filters).map((message) => message.id), ['delivery-commitment'])
  assert.deepEqual(messageState.selectMessages(snapshot, 'all', { ...filters, sender: '陈晓' }).map((message) => message.id), [])
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

test('feedback accepts only an eligible completed result and a non-blank downvote reason', () => {
  const snapshot = messageState.createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const message = snapshot.messages.find((item) => item.status === 'processed')!
  const updated = messageState.recordMessageFeedback(snapshot, message.id, { rating: 'down', reason: '处理结果需要先确认排期。' })
  const result = updated.messages.find((item) => item.id === message.id)!
  const pending = snapshot.messages.find((item) => item.status === 'pending')!

  assert.deepEqual(result.feedback, [{ rating: 'down', reason: '处理结果需要先确认排期。' }])
  assert.equal(result.question, message.question)
  assert.equal(result.rationale, message.rationale)
  assert.equal(result.result, message.result)
  assert.equal(messageState.recordMessageFeedback(snapshot, message.id, { rating: 'down', reason: '' }), snapshot)
  assert.equal(messageState.recordMessageFeedback(snapshot, message.id, { rating: 'down', reason: '   ' }), snapshot)
  assert.equal(messageState.recordMessageFeedback(snapshot, pending.id, { rating: 'up', reason: '有帮助。' }), snapshot)
})
