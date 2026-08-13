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
  assert.deepEqual([...new Set(snapshot.messages.map((message) => message.category))].sort(), ['approval', 'chat', 'document', 'meeting'])
  assert.ok(snapshot.messages.every((message) => message.senderAvatar.startsWith('https://images.unsplash.com/')))
})

test('Message selection combines status with source, category, conversation, and sender filters', () => {
  const snapshot = messageState.createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const filters = { source: 'feishu', category: 'chat', subject: '客户交付群', sender: '赵明' } as const

  assert.deepEqual(messageState.selectMessages(snapshot, 'needs-confirmation', filters).map((message) => message.id), ['delivery-commitment'])
  assert.deepEqual(messageState.selectMessages(snapshot, 'all', { ...filters, sender: '李四' }).map((message) => message.id), [])
})

test('Activity range selection excludes Messages received before its selected period', () => {
  const now = new Date('2026-08-13T12:00:00.000Z')
  const snapshot = messageState.createDemoMessageSnapshot(now)
  const messages = [
    ...snapshot.messages,
    { ...snapshot.messages[0], id: 'within-month', receivedAt: '2026-07-25T12:00:00.000Z' },
    { ...snapshot.messages[0], id: 'older-than-month', receivedAt: '2026-06-30T12:00:00.000Z' },
  ]

  assert.equal(messageState.selectMessagesForSummaryRange(messages, '7d', now).length, 6)
  assert.equal(messageState.selectMessagesForSummaryRange(messages, '30d', now).length, 7)
  assert.equal(messageState.selectMessagesForSummaryRange(messages, 'all', now).length, 8)
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

test('Message records preserve actual deliverable types, linked Task state, staged timeline, and feedback before resolution', () => {
  const snapshot = messageState.createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const message = snapshot.messages.find((item) => item.id === 'delivery-commitment')!
  const updated = messageState.recordMessageFeedback(snapshot, message.id, { rating: 'down', reason: '需要先确认资源。' })

  assert.deepEqual(message.deliverables.map((item) => item.format), ['xlsx'])
  assert.deepEqual(message.relatedTasks.map((item) => item.status), ['open'])
  assert.deepEqual(message.timeline.map((item) => item.state), ['completed', 'completed', 'current'])
  assert.deepEqual(updated.messages.find((item) => item.id === message.id)?.feedback, [{ rating: 'down', reason: '需要先确认资源。' }])
})

test('feedback accepts any Message rating with a non-blank downvote reason without rewriting handling', () => {
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
  assert.deepEqual(messageState.recordMessageFeedback(snapshot, pending.id, { rating: 'up', reason: '有帮助。' }).messages.find((item) => item.id === pending.id)?.feedback, [{ rating: 'up', reason: '有帮助。' }])
})
