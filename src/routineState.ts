import type { Locale } from './appState.ts'
import type { ConnectorId } from './settingsState.ts'

export const halfHourTimes = Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`)
export type RoutineStyle = 'edition' | 'signal' | 'folio'
export type RoutineFormat = 'pdf' | 'md' | 'docx'
export type RoutineRecipient = { connector: ConnectorId; kind: 'group' | 'person'; id: string; name: string; detail: string }
export const routineSkillIds = ['morning-briefing', 'project-weekly-report', 'risk-review'] as const
export type RoutineSkillId = typeof routineSkillIds[number]
export type RoutineSkill = { name: string; creator: string; description: string; detail: string }
export const routineSkills: Record<Locale, Record<RoutineSkillId, RoutineSkill>> = {
  zh: {
    'morning-briefing': { name: '早间简报能力', creator: 'Friday 创建', description: '整理当天重点、待办与需要关注的事项。', detail: '基于已连接的工作资料，开始一天前快速梳理重点。' },
    'project-weekly-report': { name: '项目周报能力', creator: 'Friday 创建', description: '汇总本周成果、项目进展、风险与下周重点。', detail: '基于已连接的工作资料，形成一份结构清晰的项目周报。' },
    'risk-review': { name: '风险与阻塞复盘', creator: 'Friday 创建', description: '识别当前风险、阻塞与待确认的依赖。', detail: '从已连接的工作资料中聚焦需要尽快处理的事项。' },
  },
  en: {
    'morning-briefing': { name: 'Morning briefing', creator: 'Created by Friday', description: 'Bring today’s priorities, tasks, and open questions together.', detail: 'Use connected work context to get a focused start to the day.' },
    'project-weekly-report': { name: 'Project weekly report', creator: 'Created by Friday', description: 'Summarize outcomes, progress, risks, and next week’s priorities.', detail: 'Use connected work context to produce a clear weekly project report.' },
    'risk-review': { name: 'Risk and blocker review', creator: 'Created by Friday', description: 'Identify risks, blockers, and dependencies that need attention.', detail: 'Use connected work context to focus on what needs resolution next.' },
  },
}
export type RoutineConfig = {
  id: string
  name: string
  enabled: boolean
  skillId: RoutineSkillId | null
  weekdays: number[]
  time: string
  timezone: string
  recipients: RoutineRecipient[]
  format: RoutineFormat
  style: RoutineStyle | null
}

export const createRoutineDraft = (existing: Pick<RoutineConfig, 'name'>[], timezone: string, locale: Locale): RoutineConfig => {
  const base = locale === 'zh' ? '早间简报' : 'Morning briefing'
  let name = base
  for (let number = 2; existing.some((item) => item.name === name); number++) name = `${base} ${number}`
  return { id: crypto.randomUUID(), name, enabled: true, skillId: null, weekdays: [1, 2, 3, 4, 5, 6, 7], time: '09:00', timezone, recipients: [], format: 'pdf', style: 'edition' }
}

export const isRoutineDirty = (draft: RoutineConfig | null, original: RoutineConfig | undefined, adding: boolean): boolean => !adding && Boolean(draft && JSON.stringify(draft) !== JSON.stringify(original))

export const recipientKey = (target: RoutineRecipient): string => `${target.connector}:${target.kind}:${target.id}`
export const normalizeRecipients = (targets: RoutineRecipient[]): RoutineRecipient[] => [...new Map(targets.map((target) => [recipientKey(target), { ...target }])).values()]

export type RoutineValidation = 'name' | 'enabled' | 'skill' | 'weekdays' | 'time' | 'timezone' | 'format' | 'style' | 'recipients'
export const validateRoutine = (config: RoutineConfig): RoutineValidation | null => {
  if (typeof config.name !== 'string' || !config.name.trim()) return 'name'
  if (typeof config.enabled !== 'boolean') return 'enabled'
  if (config.skillId === null || !routineSkillIds.includes(config.skillId)) return 'skill'
  if (!Array.isArray(config.weekdays) || !config.weekdays.length || config.weekdays.some((day) => !Number.isInteger(day) || day < 1 || day > 7)) return 'weekdays'
  if (!halfHourTimes.includes(config.time)) return 'time'
  try { if (!config.timezone) return 'timezone'; new Intl.DateTimeFormat('en', { timeZone: config.timezone }).format() } catch { return 'timezone' }
  if (!['pdf', 'md', 'docx'].includes(config.format)) return 'format'
  if (config.style !== null && !['edition', 'signal', 'folio'].includes(config.style)) return 'style'
  if (!Array.isArray(config.recipients) || config.recipients.some((target) => !target || !['dingtalk', 'feishu', 'teams'].includes(target.connector) || !['group', 'person'].includes(target.kind) || typeof target.id !== 'string' || !target.id || typeof target.name !== 'string' || !target.name.trim() || typeof target.detail !== 'string')) return 'recipients'
  return null
}

export const routineScheduleLabel = (config: Pick<RoutineConfig, 'weekdays' | 'time'>, locale: Locale): string => {
  const days = locale === 'zh' ? ['一', '二', '三', '四', '五', '六', '日'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const selected = [...new Set(config.weekdays)].sort((a, b) => a - b)
  const label = selected.length === 7 ? (locale === 'zh' ? '每天' : 'Every day') : `${locale === 'zh' ? '每周' : ''}${selected.map((day) => days[day - 1]).join(locale === 'zh' ? '、' : ', ')}`
  return `${label} ${config.time}`
}

export type RoutineDocument = { id: string; title: string; format: RoutineFormat; style: RoutineStyle; createdAt: string; sections: Array<{ heading: string; body: string }>; demo: boolean; url?: string; libraryUrl?: string }
export type RoutineDelivery = { target: RoutineRecipient; status: 'sending' | 'sent' | 'failed' | 'unknown'; reason?: string }
export type RoutineSession = { id: string; routineId: string; title: string; startedAt: string; trigger: 'schedule'; status: 'generating' | 'insufficient' | 'failed' | 'sending' | 'completed'; reason?: string; document?: RoutineDocument; deliveries: RoutineDelivery[]; demo: boolean }
export type RoutineSnapshot = { routines: RoutineConfig[]; sessions: RoutineSession[] }

export const sessionResult = (session: RoutineSession): string => {
  if (session.status === 'insufficient') return 'failed'
  if (session.status !== 'completed') return session.status
  if (session.deliveries.some((delivery) => delivery.status === 'unknown')) return 'unknown'
  if (session.deliveries.some((delivery) => delivery.status === 'sending')) return 'sending'
  const failed = session.deliveries.filter((delivery) => delivery.status === 'failed').length
  if (failed) return failed === session.deliveries.length ? 'delivery-failed' : 'partial'
  return session.deliveries.length ? 'sent' : 'generated'
}
