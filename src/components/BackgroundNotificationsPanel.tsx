import { Button } from '@heroui/react'
import type { BackgroundJob } from '../backgroundProgressState.ts'
import type { BackgroundNotificationCopy } from '../content/translations.ts'
import Icon from './Icon.tsx'

export function BackgroundNotificationsPanel({ copy, jobs, onOpenWorkStyle }: { copy: BackgroundNotificationCopy; jobs: BackgroundJob[]; onOpenWorkStyle: () => void }) {
  const completedJobs = jobs.filter((job) => job.status === 'completed')

  return <section aria-label={copy.title} className="background-notifications-panel">
    <h2>{copy.title}</h2>
    {completedJobs.length === 0 ? <p>{copy.empty}</p> : <ul>{completedJobs.map((job) => {
      const notification = copy.completed[job.kind]
      return <li key={job.kind}>
        <Icon name="check" />
        <span><strong>{notification.title}</strong><small>{notification.body}</small></span>
        {notification.action && <Button onPress={onOpenWorkStyle} type="button" variant="secondary">{notification.action}</Button>}
      </li>
    })}</ul>}
  </section>
}
