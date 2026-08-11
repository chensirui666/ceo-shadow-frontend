import assert from 'node:assert/strict'
import test from 'node:test'

const homeState = await import('./homeState.ts')

test('source filtering and activity totals use the same events and exclude connection errors', () => {
  const snapshot = {
    mode: 'active',
    connectedSources: ['dingtalk', 'feishu'],
    events: [
      { id: 'sent', source: 'dingtalk', sender: '陈思睿', receivedAt: '2026-08-06T10:10:00.000Z', status: 'completed', outcome: 'sent', question: '进度如何？', reply: '今天完成。', rationale: '符合当前处理规则。' },
      { id: 'wait', source: 'dingtalk', sender: '刘晨', receivedAt: '2026-08-06T10:20:00.000Z', status: 'waiting', question: '能确认吗？', rationale: '等待你先回复。', waitUntil: '2026-08-06T10:25:00.000Z' },
      { id: 'offline', source: 'feishu', sender: '系统', receivedAt: '2026-08-06T10:30:00.000Z', status: 'connection-error', question: '飞书连接异常', rationale: 'Friday 暂时无法使用飞书。' },
    ],
  } satisfies import('./homeState.ts').HomeSnapshot

  const events = homeState.selectHomeEvents(snapshot, 'dingtalk')
  const hour = homeState.activityHours(events, new Date('2026-08-06T10:40:00.000Z')).at(-1)

  assert.deepEqual(events.map((event) => event.id), ['sent', 'wait'])
  assert.deepEqual(hour, { hour: '10', processed: 1, pending: 1, failed: 0 })
  assert.equal(homeState.activityHours(snapshot.events, new Date('2026-08-06T10:40:00.000Z')).at(-1)?.processed, 1)
})

test('a confirmation decision updates one event into completed with its distinct outcome', () => {
  const snapshot = homeState.createDemoHomeSnapshot(new Date('2026-08-06T12:00:00.000Z'))
  const confirmed = homeState.resolveConfirmation(snapshot, 'needs-confirmation', 'send', '确认下周三上线。')
  const cancelled = homeState.resolveConfirmation(snapshot, 'needs-confirmation', 'cancel', '确认下周三上线。')

  assert.equal(confirmed.events.length, snapshot.events.length)
  assert.equal(confirmed.events.find((event) => event.id === 'needs-confirmation')?.status, 'completed')
  assert.equal(confirmed.events.find((event) => event.id === 'needs-confirmation')?.outcome, 'sent')
  assert.equal(cancelled.events.find((event) => event.id === 'needs-confirmation')?.outcome, 'cancelled')
})

test('an expired waiting event progresses to processing in the local demo', () => {
  const snapshot = {
    mode: 'active',
    connectedSources: ['feishu'],
    events: [{
      id: 'waiting', source: 'feishu', sender: '刘晨', receivedAt: '2026-08-06T10:39:00.000Z',
      status: 'waiting', question: '下周的上线时间能确定吗？', reply: '目前计划在下周三完成上线。',
      rationale: '等待你先回复，尚未开始处理。', waitUntil: '2026-08-06T10:44:00.000Z',
    }],
  } satisfies import('./homeState.ts').HomeSnapshot

  const advanced = homeState.progressWaitingEvents(snapshot, new Date('2026-08-06T10:44:00.000Z'))

  assert.equal(snapshot.events[0].status, 'waiting')
  assert.equal(advanced.events[0].status, 'processing')
  assert.equal(advanced.events[0].waitUntil, undefined)
})

test('a paused snapshot does not progress an expired waiting event', () => {
  const snapshot = {
    mode: 'paused',
    connectedSources: ['feishu'],
    events: [{
      id: 'waiting', source: 'feishu', sender: '刘晨', receivedAt: '2026-08-06T10:39:00.000Z',
      status: 'waiting', question: '下周的上线时间能确定吗？', reply: '目前计划在下周三完成上线。',
      rationale: '等待你先回复，尚未开始处理。', waitUntil: '2026-08-06T10:44:00.000Z',
    }],
  } satisfies import('./homeState.ts').HomeSnapshot

  const advanced = homeState.progressWaitingEvents(snapshot, new Date('2026-08-06T10:44:00.000Z'))

  assert.equal(advanced, snapshot)
  assert.equal(advanced.events[0].status, 'waiting')
})

test('mode confirmation and owner feedback preserve the current event result', () => {
  const snapshot = homeState.createDemoHomeSnapshot(new Date('2026-08-06T12:00:00.000Z'))
  const updated = homeState.recordOwnerFeedback(snapshot, 'trial-complete', { kind: 'adjust', note: '承诺时间前先确认资源。' })

  assert.equal(homeState.modeChangeNeedsConfirmation('trial', 'active'), true)
  assert.equal(homeState.modeChangeNeedsConfirmation('active', 'trial'), true)
  assert.equal(updated.events.find((event) => event.id === 'trial-complete')?.outcome, undefined)
  assert.deepEqual(updated.events.find((event) => event.id === 'trial-complete')?.ownerFeedback, { kind: 'adjust', note: '承诺时间前先确认资源。' })
})
