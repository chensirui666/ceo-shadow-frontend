import { Bell, BookOpen, CalendarCheck, House, MessageSquare, Settings as SettingsIcon, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type IconName = 'home' | 'tasks' | 'memory' | 'feedback' | 'settings' | 'bell' | 'user'

const icons: Record<IconName, LucideIcon> = {
  home: House,
  tasks: CalendarCheck,
  memory: BookOpen,
  feedback: MessageSquare,
  settings: SettingsIcon,
  bell: Bell,
  user: UserRound,
}

export default function Icon({ name }: { name: IconName }) {
  const LucideIcon = icons[name]
  return <LucideIcon aria-hidden="true" className="icon" />
}
