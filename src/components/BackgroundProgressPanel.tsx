import type { BackgroundJob, BackgroundJobKind, BackgroundJobStatus } from '../backgroundProgressState.ts'

export type BackgroundProgressCopy = {
  title: string
  empty: string
  estimate: (minutes: number) => string
  jobs: Record<BackgroundJobKind, string>
  status: Record<BackgroundJobStatus, string>
}

export function BackgroundProgressPanel({ copy, jobs }: { copy: BackgroundProgressCopy; jobs: BackgroundJob[] }) {
  return <section aria-label={copy.title} className="background-progress-panel">
    <h2>{copy.title}</h2>
    {jobs.length === 0 ? <p>{copy.empty}</p> : <ul>{jobs.map((job) => <li key={job.kind}>
      <span className={`background-progress-status background-progress-status-${job.status}`} aria-hidden="true" />
      <span><strong>{copy.jobs[job.kind]}</strong><small>{copy.status[job.status]}</small></span>
      {job.status === 'running' && <em>{copy.estimate(job.estimatedMinutes)}</em>}
    </li>)}</ul>}
  </section>
}
