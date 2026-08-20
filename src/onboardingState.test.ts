import assert from 'node:assert/strict'
import test from 'node:test'

const onboarding = await import('./onboardingState.ts')

test('only the seeded demo account skips onboarding', () => {
  assert.equal(onboarding.needsOnboarding('sirui.chen@stardust.ai'), false)
  assert.equal(onboarding.needsOnboarding('SIRUI.CHEN@STARDUST.AI'), false)
  assert.equal(onboarding.needsOnboarding('new.person@stardust.ai'), true)
})

test('completed step titles remain reachable without exposing an unfinished future step', () => {
  const complete = onboarding.confirmWorkStyle(onboarding.queueWorkStyle(onboarding.advanceFromMemory(onboarding.queueMemory(
    onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')),
  ))))

  assert.equal(onboarding.selectOnboardingStep(complete, 2).step, 2)
  assert.equal(onboarding.selectOnboardingStep(onboarding.selectOnboardingStep(complete, 2), 3).step, 3)
  assert.equal(onboarding.selectOnboardingStep(onboarding.createOnboardingState(), 3).step, 1)
})

test('Memory submission stays on step 2 until the user continues', () => {
  const built = onboarding.queueMemory(
    onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'feishu')),
  )

  assert.equal(built.step, 2)
  assert.equal(built.memorySubmitted, true)
  assert.equal(onboarding.advanceFromMemory(built).step, 3)
  assert.equal('memorySkipped' in built, false)
})

test('Memory scope excludes an app without disconnecting it', () => {
  const connected = onboarding.connectSource(
    onboarding.connectSource(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk'), 'feishu'),
    'teams',
  )
  const built = onboarding.queueMemory(connected, ['dingtalk', 'teams'])

  assert.deepEqual(built.connectedSources, ['dingtalk', 'feishu', 'teams'])
  assert.deepEqual(built.memorySources, ['dingtalk', 'teams'])
  assert.equal(built.memorySubmitted, true)
})

test('the final onboarding confirmation finishes after the work-style task is queued', () => {
  const prepared = onboarding.advanceFromMemory(onboarding.queueMemory(
    onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')),
  ))
  const submitted = onboarding.queueWorkStyle(prepared)

  assert.equal(submitted.step, 3)
  assert.equal(submitted.maxReached, 3)
  assert.equal(submitted.workStyleSubmitted, true)
  assert.equal(onboarding.completeOnboarding(submitted).completed, false)
  assert.equal(onboarding.completeOnboarding(onboarding.confirmWorkStyle(submitted)).completed, true)
})

test('work-style submission is required before Message can open', () => {
  const built = onboarding.queueMemory(
    onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')),
  )
  const prepared = onboarding.advanceFromMemory(built)

  assert.equal(onboarding.queueWorkStyle(built).workStyleSubmitted, false)
  assert.equal(prepared.step, 3)
  assert.equal(prepared.workStyleSubmitted, false)
  assert.equal(onboarding.completeOnboarding(prepared).completed, false)
})

test('a queued work-style task still requires an explicit onboarding confirmation', () => {
  const connected = onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk'))
  const memoryQueued = onboarding.queueMemory(connected)
  const styleQueued = onboarding.queueWorkStyle(onboarding.advanceFromMemory(memoryQueued))

  assert.equal(memoryQueued.memorySubmitted, true)
  assert.equal(styleQueued.workStyleSubmitted, true)
  assert.equal(styleQueued.workStyleConfirmed, false)
  assert.equal(onboarding.completeOnboarding(styleQueued).completed, false)

  const confirmed = onboarding.confirmWorkStyle(styleQueued)
  assert.equal(confirmed.workStyleConfirmed, true)
  assert.equal('workStylePrompt' in confirmed, false)
  assert.equal(onboarding.completeOnboarding(confirmed).completed, true)
})
