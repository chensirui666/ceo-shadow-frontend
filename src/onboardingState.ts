import type { HomeSource } from './homeState.ts'

export const seededDemoEmail = 'sirui.chen@stardust.ai'

export type OnboardingStep = 1 | 2 | 3
export type OnboardingState = {
  step: OnboardingStep
  maxReached: OnboardingStep
  connectedSources: HomeSource[]
  memorySources: HomeSource[]
  memorySubmitted: boolean
  workStyleSubmitted: boolean
  workStyleConfirmed: boolean
  completed: boolean
}

export const needsOnboarding = (email: string): boolean => email.trim().toLowerCase() !== seededDemoEmail

export const createOnboardingState = (): OnboardingState => ({
  step: 1,
  maxReached: 1,
  connectedSources: [],
  memorySources: [],
  memorySubmitted: false,
  workStyleSubmitted: false,
  workStyleConfirmed: false,
  completed: false,
})

export const connectSource = (state: OnboardingState, source: HomeSource): OnboardingState => (
  state.connectedSources.includes(source) ? state : { ...state, connectedSources: [...state.connectedSources, source] }
)

export const continueToMemory = (state: OnboardingState): OnboardingState => (
  state.connectedSources.length ? { ...state, step: 2, maxReached: 2 } : state
)

export const queueMemory = (state: OnboardingState, sources = state.connectedSources): OnboardingState => {
  const memorySources = sources.filter((source) => state.connectedSources.includes(source))
  return memorySources.length ? { ...state, memorySubmitted: true, memorySources } : state
}

export const advanceFromMemory = (state: OnboardingState): OnboardingState => (
  state.memorySubmitted ? { ...state, step: 3, maxReached: 3 } : state
)

export const queueWorkStyle = (state: OnboardingState): OnboardingState => (
  state.step === 3 && state.memorySubmitted ? { ...state, workStyleSubmitted: true } : state
)

export const confirmWorkStyle = (state: OnboardingState): OnboardingState => (
  state.step === 3 && state.workStyleSubmitted
    ? { ...state, workStyleConfirmed: true }
    : state
)

export const selectOnboardingStep = (state: OnboardingState, step: OnboardingStep): OnboardingState => (
  step <= state.maxReached ? { ...state, step } : state
)

export const completeOnboarding = (state: OnboardingState): OnboardingState => (
  state.workStyleConfirmed ? { ...state, completed: true } : state
)
