import type { ReactNode } from 'react'

export type IconName = 'home' | 'tasks' | 'memory' | 'feedback' | 'settings' | 'bell' | 'user'

const paths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 21v-7h6v7" /></>,
  tasks: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2m6 2V2M8 12l2 2 4-4m-6 7 2 2 4-4" /></>,
  memory: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22Z" /></>,
  feedback: <><path d="M5 4h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 3V6a2 2 0 0 1 1-2Z" /><path d="M8 10h8m-8 4h5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.45 2.45-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56v.09H11v-.09A1.7 1.7 0 0 0 9.96 19a1.7 1.7 0 0 0-1.88.34l-.06.06-2.45-2.45.06-.06A1.7 1.7 0 0 0 5.97 15a1.7 1.7 0 0 0-1.56-1.04h-.09v-3.46h.09A1.7 1.7 0 0 0 5.97 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.45-2.45.06.06A1.7 1.7 0 0 0 9.96 5 1.7 1.7 0 0 0 11 3.44v-.09h3.46v.09A1.7 1.7 0 0 0 15.5 5a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.45 2.45-.06.06A1.7 1.7 0 0 0 19.5 9a1.7 1.7 0 0 0 1.56 1.04h.09v3.46h-.09A1.7 1.7 0 0 0 19.4 15Z" /></>,
  bell: <><path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6" /></>,
}

export default function Icon({ name }: { name: IconName }) {
  return <svg aria-hidden="true" className="icon" fill="none" viewBox="0 0 24 24">{paths[name]}</svg>
}
