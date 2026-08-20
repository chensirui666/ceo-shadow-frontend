export const backgroundJobKinds = ['memory', 'work-style'] as const
export const backgroundJobStatuses = ['running', 'completed', 'failed'] as const

export type BackgroundJobKind = typeof backgroundJobKinds[number]
export type BackgroundJobStatus = typeof backgroundJobStatuses[number]
export type BackgroundJob = {
  kind: BackgroundJobKind
  status: BackgroundJobStatus
  estimatedMinutes: number
}
export type BackgroundProgressState = {
  jobs: BackgroundJob[]
  unreadCompletedJobs: BackgroundJobKind[]
}

export const createBackgroundProgressState = (): BackgroundProgressState => ({ jobs: [], unreadCompletedJobs: [] })

export const backgroundJobFor = (state: BackgroundProgressState, kind: BackgroundJobKind): BackgroundJob | undefined => (
  state.jobs.find((job) => job.kind === kind)
)

export const queueBackgroundJob = (state: BackgroundProgressState, kind: BackgroundJobKind): BackgroundProgressState => (
  backgroundJobFor(state, kind)?.status === 'running'
    ? state
    : { ...state, jobs: [...state.jobs.filter((job) => job.kind !== kind), { kind, status: 'running', estimatedMinutes: 20 }] }
)

export const completeBackgroundJob = (state: BackgroundProgressState, kind: BackgroundJobKind): BackgroundProgressState => {
  const job = backgroundJobFor(state, kind)
  if (job?.status !== 'running') return state

  return {
    ...state,
    jobs: state.jobs.map((item) => item.kind === kind ? { ...item, status: 'completed' } : item),
    unreadCompletedJobs: state.unreadCompletedJobs.includes(kind) ? state.unreadCompletedJobs : [...state.unreadCompletedJobs, kind],
  }
}

export const markBackgroundNotificationsRead = (state: BackgroundProgressState): BackgroundProgressState => ({ ...state, unreadCompletedJobs: [] })
