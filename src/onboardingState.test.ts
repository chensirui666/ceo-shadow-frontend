import assert from 'node:assert/strict'
import test from 'node:test'

const onboarding = await import('./onboardingState.ts')

test('only the seeded demo account skips onboarding', () => {
  assert.equal(onboarding.needsOnboarding('sirui.chen@stardust.ai'), false)
  assert.equal(onboarding.needsOnboarding('SIRUI.CHEN@STARDUST.AI'), false)
  assert.equal(onboarding.needsOnboarding('new.person@stardust.ai'), true)
})

test('completed step titles remain reachable without exposing an unfinished future step', () => {
  const complete = onboarding.confirmWorkStyle(
    onboarding.advanceFromMemory(onboarding.confirmMemory(
      onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')),
    )),
  )

  assert.equal(onboarding.selectOnboardingStep(complete, 2).step, 2)
  assert.equal(onboarding.selectOnboardingStep(onboarding.selectOnboardingStep(complete, 2), 4).step, 4)
  assert.equal(onboarding.selectOnboardingStep(onboarding.createOnboardingState(), 4).step, 1)
})

test('Memory confirmation stays on step 2 until the user continues', () => {
  const built = onboarding.confirmMemory(
    onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'feishu')),
  )

  assert.equal(built.step, 2)
  assert.equal(built.memoryConfirmed, true)
  assert.equal(onboarding.advanceFromMemory(built).step, 3)
  assert.equal('memorySkipped' in built, false)
})

test('Memory scope excludes an app without disconnecting it', () => {
  const connected = onboarding.connectSource(
    onboarding.connectSource(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk'), 'feishu'),
    'teams',
  )
  const built = onboarding.confirmMemory(connected, ['dingtalk', 'teams'])

  assert.deepEqual(built.connectedSources, ['dingtalk', 'feishu', 'teams'])
  assert.deepEqual(built.memorySources, ['dingtalk', 'teams'])
  assert.equal(built.memoryConfirmed, true)
})

test('work style confirmation retains an edited Prompt for the current session', () => {
  const prepared = onboarding.advanceFromMemory(onboarding.confirmMemory(
    onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')),
  ))
  const confirmed = onboarding.confirmWorkStyle(prepared, '先确认事实，再给出下一步。')

  assert.equal(confirmed.workStylePrompt, '先确认事实，再给出下一步。')
})

test('work-style confirmation is required before formal mode can start', () => {
  const built = onboarding.confirmMemory(
    onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')),
  )
  const prepared = onboarding.advanceFromMemory(built)
  const trial = onboarding.recordTrial(prepared, '客户问：这个项目本周能交付吗？')

  assert.equal(onboarding.confirmWorkStyle(built).workStyleConfirmed, false)
  assert.equal(prepared.step, 3)
  assert.equal(prepared.workStyleConfirmed, false)
  assert.equal(trial.trial, undefined)
  assert.equal(onboarding.completeOnboarding(prepared).completed, false)
})

test('a Trial adjustment changes only the current Trial reply', () => {
  const connected = onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')
  const memoryConfirmed = onboarding.advanceFromMemory(onboarding.confirmMemory(connected))
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
    onboarding.confirmWorkStyle(onboarding.advanceFromMemory(onboarding.confirmMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'feishu')))),
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
    rationale: '试运行：回复仅在当前会话中查看，未发送给任何联系人。',
  })
})

test('a Trial adjustment is retained as feedback material without changing the work style', () => {
  const prepared = onboarding.recordTrial(
    onboarding.confirmWorkStyle(onboarding.advanceFromMemory(onboarding.confirmMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')))),
    '客户问：当前方案有什么风险？',
  )
  const adjusted = onboarding.regenerateTrial(prepared, '先说明依赖风险，再给结论。')
  const event = onboarding.createTrialEvent(adjusted, new Date('2026-08-09T09:00:00.000Z'))

  assert.equal(adjusted.workStyleConfirmed, true)
  assert.deepEqual(event?.ownerFeedback, { kind: 'adjust', note: '先说明依赖风险，再给结论。' })
})

test('matching a Trial reply records feedback without changing its reply', () => {
  const trial = onboarding.recordTrial(
    onboarding.confirmWorkStyle(onboarding.advanceFromMemory(onboarding.confirmMemory(onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk'))))),
    '客户问：这个项目本周能交付吗？',
  )
  const matched = onboarding.recordTrialFeedback(trial, { kind: 'matched', note: '' })

  assert.equal(matched.trial?.reply, trial.trial?.reply)
  assert.deepEqual(onboarding.createTrialEvent(matched, new Date('2026-08-10T09:00:00.000Z'))?.ownerFeedback, { kind: 'matched', note: '' })
})
