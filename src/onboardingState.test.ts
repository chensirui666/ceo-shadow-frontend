import assert from 'node:assert/strict'
import test from 'node:test'

const onboarding = await import('./onboardingState.ts')

test('only the seeded demo account skips onboarding', () => {
  assert.equal(onboarding.needsOnboarding('sirui.chen@stardust.ai'), false)
  assert.equal(onboarding.needsOnboarding('SIRUI.CHEN@STARDUST.AI'), false)
  assert.equal(onboarding.needsOnboarding('new.person@stardust.ai'), true)
})

test('a Trial adjustment changes only the current Trial reply', () => {
  const connected = onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')
  const memoryConfirmed = onboarding.confirmMemory(connected)
  const styleConfirmed = onboarding.confirmWorkStyle(memoryConfirmed)
  const recorded = onboarding.recordTrial(styleConfirmed, '客户问：这个项目本周能交付吗？')
  const adjusted = onboarding.regenerateTrial(recorded, '语气更保守，先说明风险。')

  assert.equal(styleConfirmed.workStyleConfirmed, true)
  assert.equal(adjusted.workStyleConfirmed, true)
  assert.match(adjusted.trial?.reply ?? '', /风险/)
  assert.equal(adjusted.trial?.question, '客户问：这个项目本周能交付吗？')
  assert.notEqual(adjusted.trial?.reply, recorded.trial?.reply)
  assert.equal(recorded.trial?.adjustment, undefined)
})

test('a completed Trial becomes a visible session-only Home event', () => {
  const state = onboarding.recordTrial(
    onboarding.confirmWorkStyle(onboarding.confirmMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'feishu'))),
    '同事问：下周会议要准备什么？',
  )
  const event = onboarding.createTrialEvent(state, new Date('2026-08-09T09:00:00.000Z'))

  assert.deepEqual(event, {
    id: 'onboarding-trial',
    source: 'feishu',
    sender: '你',
    receivedAt: '2026-08-09T09:00:00.000Z',
    status: 'trial-complete',
    question: '同事问：下周会议要准备什么？',
    reply: '我会先梳理会议目标、待确认事项和需要带齐的材料，再在会前同步一份简短清单。',
    rationale: 'Trial：回复仅在当前会话中查看，未发送给任何联系人。',
  })
})
