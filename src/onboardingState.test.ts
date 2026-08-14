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
  assert.equal(onboarding.selectOnboardingStep(onboarding.selectOnboardingStep(complete, 2), 3).step, 3)
  assert.equal(onboarding.selectOnboardingStep(onboarding.createOnboardingState(), 3).step, 1)
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

test('confirming the work style finishes the final third step', () => {
  const prepared = onboarding.advanceFromMemory(onboarding.confirmMemory(
    onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')),
  ))
  const confirmed = onboarding.confirmWorkStyle(prepared, '先确认事实。')

  assert.equal(confirmed.step, 3)
  assert.equal(confirmed.maxReached, 3)
  assert.equal(confirmed.workStyleConfirmed, true)
  assert.equal(onboarding.completeOnboarding(confirmed).completed, true)
})

test('work-style confirmation is required before formal mode can start', () => {
  const built = onboarding.confirmMemory(
    onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')),
  )
  const prepared = onboarding.advanceFromMemory(built)

  assert.equal(onboarding.confirmWorkStyle(built).workStyleConfirmed, false)
  assert.equal(prepared.step, 3)
  assert.equal(prepared.workStyleConfirmed, false)
  assert.equal(onboarding.completeOnboarding(prepared).completed, false)
})
