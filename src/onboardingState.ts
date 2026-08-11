import type { HomeEvent, HomeSource, OwnerFeedback } from './homeState.ts'

export const seededDemoEmail = 'sirui.chen@stardust.ai'

export type OnboardingStep = 1 | 2 | 3 | 4
export type TrialReply = { question: string; reply: string; adjustment?: string; feedback?: OwnerFeedback }
export type OnboardingState = {
  step: OnboardingStep
  maxReached: OnboardingStep
  connectedSources: HomeSource[]
  memoryConfirmed: boolean
  memorySkipped: boolean
  workStyleConfirmed: boolean
  workStylePrompt?: string
  trial?: TrialReply
  completed: boolean
}

const trialReplyFor = (question: string): string => (
  question.includes('会议')
    ? '我会先梳理会议目标、待确认事项和需要带齐的材料，再在会前同步一份简短清单。'
    : question.includes('风险')
      ? '当前方案需要先核实进度、依赖和资源风险；确认后再给出明确承诺。'
      : '我会先核实当前进度、风险和需要确认的事项，再给出不超出已有信息的回复。'
)

export const needsOnboarding = (email: string): boolean => email.trim().toLowerCase() !== seededDemoEmail

export const createOnboardingState = (): OnboardingState => ({
  step: 1,
  maxReached: 1,
  connectedSources: [],
  memoryConfirmed: false,
  memorySkipped: false,
  workStyleConfirmed: false,
  completed: false,
})

export const connectSource = (state: OnboardingState, source: HomeSource): OnboardingState => (
  state.connectedSources.includes(source) ? state : { ...state, connectedSources: [...state.connectedSources, source] }
)

export const continueToMemory = (state: OnboardingState): OnboardingState => (
  state.connectedSources.length ? { ...state, step: 2, maxReached: 2 } : state
)

export const confirmMemory = (state: OnboardingState): OnboardingState => (
  state.connectedSources.length ? { ...state, memoryConfirmed: true, memorySkipped: false } : state
)

export const skipMemory = (state: OnboardingState): OnboardingState => (
  state.connectedSources.length ? { ...state, memorySkipped: true, step: 3, maxReached: 3 } : state
)

export const advanceFromMemory = (state: OnboardingState): OnboardingState => (
  state.memoryConfirmed || state.memorySkipped ? { ...state, step: 3, maxReached: 3 } : state
)

export const confirmWorkStyle = (state: OnboardingState, prompt?: string): OnboardingState => (
  state.memoryConfirmed || state.memorySkipped
    ? { ...state, ...(prompt?.trim() ? { workStylePrompt: prompt.trim() } : {}), workStyleConfirmed: true, step: 4, maxReached: 4 }
    : state
)

export const selectOnboardingStep = (state: OnboardingState, step: OnboardingStep): OnboardingState => (
  step <= state.maxReached ? { ...state, step } : state
)

export const recordTrial = (state: OnboardingState, question: string): OnboardingState => {
  const trimmedQuestion = question.trim()
  return state.workStyleConfirmed && trimmedQuestion
    ? { ...state, trial: { question: trimmedQuestion, reply: trialReplyFor(trimmedQuestion) } }
    : state
}

export const regenerateTrial = (state: OnboardingState, adjustment: string): OnboardingState => {
  const trimmedAdjustment = adjustment.trim()
  if (!state.trial || !trimmedAdjustment) return state
  return {
    ...state,
    trial: {
      ...state.trial,
      adjustment: trimmedAdjustment,
      feedback: { kind: 'adjust', note: trimmedAdjustment },
      reply: `${state.trial.reply}\n\n已按本次 Trial 调整：${trimmedAdjustment}`,
    },
  }
}

export const recordTrialFeedback = (state: OnboardingState, feedback: OwnerFeedback): OnboardingState => (
  state.trial ? { ...state, trial: { ...state.trial, feedback } } : state
)

export const completeOnboarding = (state: OnboardingState): OnboardingState => (
  state.workStyleConfirmed ? { ...state, completed: true } : state
)

export const createTrialEvent = (state: OnboardingState, now: Date): HomeEvent | null => (
  state.trial ? {
    id: 'onboarding-trial',
    source: state.connectedSources[0] ?? 'dingtalk',
    sender: '你',
    receivedAt: now.toISOString(),
    status: 'trial-complete',
    question: state.trial.question,
    reply: state.trial.reply,
    rationale: 'Trial：回复仅在当前会话中查看，未发送给任何联系人。',
    ...(state.trial.feedback ? { ownerFeedback: state.trial.feedback } : {}),
  } : null
)
