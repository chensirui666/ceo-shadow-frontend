import { Bell, BookOpen, CalendarCheck, CheckCircle2, Clock, Files, House, MessageSquare, Settings as SettingsIcon, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type IconName = 'home' | 'tasks' | 'library' | 'memory' | 'feedback' | 'settings' | 'bell' | 'progress' | 'user' | 'check'

const icons: Record<IconName, LucideIcon> = {
  home: House,
  tasks: CalendarCheck,
  library: Files,
  memory: BookOpen,
  feedback: MessageSquare,
  settings: SettingsIcon,
  bell: Bell,
  progress: Clock,
  user: UserRound,
  check: CheckCircle2,
}

export default function Icon({ name }: { name: IconName }) {
  const LucideIcon = icons[name]
  return <LucideIcon aria-hidden="true" className="icon" />
}
