import type { HomeEvent, HomeSource, OwnerFeedback } from './homeState.ts'

export const seededDemoEmail = 'sirui.chen@stardust.ai'

export type OnboardingStep = 1 | 2 | 3 | 4
export type TrialReply = { question: string; reply: string; adjustment?: string; feedback?: OwnerFeedback }
export type OnboardingState = {
  step: OnboardingStep
  maxReached: OnboardingStep
  connectedSources: HomeSource[]
  memorySources: HomeSource[]
  memoryConfirmed: boolean
  workStyleConfirmed: boolean
  workStylePrompt?: string
  trial?: TrialReply
  completed: boolean
}

const trialReplyFor = (question: string, locale: 'en' | 'zh'): string => {
  if (locale === 'en') return question.toLocaleLowerCase().includes('meeting')
    ? 'I’ll first clarify the meeting goal, open decisions, and required materials, then share a short checklist before the meeting.'
    : question.toLocaleLowerCase().includes('risk')
      ? 'I’ll first verify progress, dependencies, and resourcing risks before making a clear commitment.'
      : 'I’ll first verify the current progress, risks, and open decisions, then reply only with what the available information supports.'

  return question.includes('会议')
    ? '我会先梳理会议目标、待确认事项和需要带齐的材料，再在会前同步一份简短清单。'
    : question.includes('风险')
      ? '当前方案需要先核实进度、依赖和资源风险；确认后再给出明确承诺。'
      : '我会先核实当前进度、风险和需要确认的事项，再给出不超出已有信息的回复。'
}

export const needsOnboarding = (email: string): boolean => email.trim().toLowerCase() !== seededDemoEmail

export const createOnboardingState = (): OnboardingState => ({
  step: 1,
  maxReached: 1,
  connectedSources: [],
  memorySources: [],
  memoryConfirmed: false,
  workStyleConfirmed: false,
  completed: false,
})

export const connectSource = (state: OnboardingState, source: HomeSource): OnboardingState => (
  state.connectedSources.includes(source) ? state : { ...state, connectedSources: [...state.connectedSources, source] }
)

export const continueToMemory = (state: OnboardingState): OnboardingState => (
  state.connectedSources.length ? { ...state, step: 2, maxReached: 2 } : state
)

export const confirmMemory = (state: OnboardingState, sources = state.connectedSources): OnboardingState => {
  const memorySources = sources.filter((source) => state.connectedSources.includes(source))
  return memorySources.length ? { ...state, memoryConfirmed: true, memorySources } : state
}

export const advanceFromMemory = (state: OnboardingState): OnboardingState => (
  state.memoryConfirmed ? { ...state, step: 3, maxReached: 3 } : state
)

export const confirmWorkStyle = (state: OnboardingState, prompt?: string): OnboardingState => (
  state.step === 3 && state.memoryConfirmed
    ? { ...state, ...(prompt?.trim() ? { workStylePrompt: prompt.trim() } : {}), workStyleConfirmed: true, step: 4, maxReached: 4 }
    : state
)

export const selectOnboardingStep = (state: OnboardingState, step: OnboardingStep): OnboardingState => (
  step <= state.maxReached ? { ...state, step } : state
)

export const recordTrial = (state: OnboardingState, question: string, locale: 'en' | 'zh' = 'zh'): OnboardingState => {
  const trimmedQuestion = question.trim()
  return state.step === 4 && trimmedQuestion
    ? { ...state, trial: { question: trimmedQuestion, reply: trialReplyFor(trimmedQuestion, locale) } }
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

export const createTrialEvent = (state: OnboardingState, now: Date, locale: 'en' | 'zh' = 'zh'): HomeEvent | null => (
  state.trial ? {
    id: 'onboarding-trial',
    source: state.connectedSources[0] ?? 'dingtalk',
    sender: locale === 'en' ? 'You' : '你',
    receivedAt: now.toISOString(),
    status: 'trial-complete',
    question: state.trial.question,
    reply: state.trial.reply,
    rationale: locale === 'en' ? 'Trial run: this reply is available only in this session and was not sent to anyone.' : '试运行：回复仅在当前会话中查看，未发送给任何联系人。',
    ...(state.trial.feedback ? { ownerFeedback: state.trial.feedback } : {}),
  } : null
)
