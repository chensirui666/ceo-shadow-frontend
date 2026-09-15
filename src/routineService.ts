import type { Locale } from './appState.ts'
import type { ConnectorId } from './settingsState.ts'
import { createRoutineDraft, normalizeRecipients, routineSkillIds, validateRoutine } from './routineState.ts'
import type { RoutineConfig, RoutineDocument, RoutineRecipient, RoutineSession, RoutineSnapshot } from './routineState.ts'

type Storage = { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void }

export type RoutineService = {
  load: () => Promise<RoutineSnapshot>
  save: (config: RoutineConfig) => Promise<RoutineSnapshot>
  remove: (id: string) => Promise<RoutineSnapshot>
  recipients: (connector: ConnectorId, locale: Locale) => Promise<RoutineRecipient[]>
  preview: (config: RoutineConfig, locale: Locale) => Promise<RoutineDocument>
  retry: (session: RoutineSession) => Promise<RoutineSession>
}

const previewSections = (skillId: RoutineConfig['skillId'], locale: Locale) => {
  if (skillId === 'risk-review') return locale === 'zh'
    ? [{ heading: '当前风险', body: '此处将识别已连接工作资料中需要关注的风险。' }, { heading: '阻塞与依赖', body: '此处将整理影响进展的阻塞与待确认依赖。' }, { heading: '处理建议', body: '此处将列出需要尽快推进的事项。' }]
    : [{ heading: 'Current risks', body: 'This section will identify risks in connected work context.' }, { heading: 'Blockers and dependencies', body: 'This section will organize blockers and dependencies affecting progress.' }, { heading: 'Suggested actions', body: 'This section will list the items that need attention next.' }]
  if (skillId === 'morning-briefing') return locale === 'zh'
    ? [{ heading: '今日重点', body: '此处将呈现今天最需要关注的事项。' }, { heading: '待办与跟进', body: '此处将整理需要推进的工作与未决问题。' }, { heading: '开始行动', body: '此处将给出适合开始一天的清晰重点。' }]
    : [{ heading: 'Today’s priorities', body: 'This section will present the work that matters most today.' }, { heading: 'Tasks and follow-ups', body: 'This section will organize work to move forward and open questions.' }, { heading: 'Start here', body: 'This section will give you a clear way to begin the day.' }]
  return locale === 'zh'
    ? [{ heading: '工作进展', body: '此处将呈现本周已完成工作与项目进展。' }, { heading: '风险与阻塞', body: '此处将汇总当前需要关注的风险、依赖与阻塞。' }, { heading: '下周重点', body: '此处将整理下一步重点与建议行动。' }]
    : [{ heading: 'Progress', body: 'This section will summarize this week’s completed work and project progress.' }, { heading: 'Risks and blockers', body: 'This section will collect risks, dependencies, and blockers that need attention.' }, { heading: 'Next week', body: 'This section will outline priorities and suggested actions.' }]
}

// Demo only: these methods never call a scheduler, model, or external connector.
export const createRoutineService = (storage?: Storage, account = '', initial?: { locale: Locale; timezone: string }): RoutineService => {
  const key = `friday-routines:${account.trim().toLowerCase()}`
  let snapshot: RoutineSnapshot = { routines: [], sessions: [] }
  let loaded = false
  const current = () => structuredClone(snapshot)
  const defaults = () => {
    if (!initial) return []
    const daily = { ...createRoutineDraft([], initial.timezone, initial.locale), name: initial.locale === 'zh' ? '今日工作简报' : 'Daily work briefing', skillId: 'morning-briefing' as const }
    return [{ ...daily, id: crypto.randomUUID(), name: initial.locale === 'zh' ? '项目周报' : 'Project weekly report', skillId: 'project-weekly-report' as const, weekdays: [5], time: '18:00' }, daily]
  }
  const mockSessions = (routines: RoutineConfig[], locale: Locale): RoutineSession[] => {
    const at = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
    const recipient: RoutineRecipient = { connector: 'dingtalk', kind: 'group', id: 'routine-session-team', name: locale === 'zh' ? '产品讨论组' : 'Product team', detail: locale === 'zh' ? '产品团队 · 12 位成员' : 'Product · 12 members' }
    return routines.flatMap((routine) => {
      const document: RoutineDocument = { id: `routine-document-${routine.id}`, title: routine.name, format: routine.format, style: routine.style || 'edition', createdAt: at(2), sections: previewSections(routine.skillId, locale), demo: true }
      return [
        { id: `routine-session-${routine.id}-generating`, routineId: routine.id, title: routine.name, startedAt: at(.25), trigger: 'schedule' as const, status: 'generating' as const, deliveries: [], demo: true },
        { id: `routine-session-${routine.id}-generated`, routineId: routine.id, title: routine.name, startedAt: at(3), trigger: 'schedule' as const, status: 'completed' as const, document, deliveries: [], demo: true },
        { id: `routine-session-${routine.id}-sent`, routineId: routine.id, title: routine.name, startedAt: at(28), trigger: 'schedule' as const, status: 'completed' as const, document, deliveries: [{ target: recipient, status: 'sent' as const }], demo: true },
        { id: `routine-session-${routine.id}-delivery-failed`, routineId: routine.id, title: routine.name, startedAt: at(52), trigger: 'schedule' as const, status: 'completed' as const, document, deliveries: [{ target: recipient, status: 'failed' as const, reason: locale === 'zh' ? '发送未完成，请重试。' : 'Delivery did not complete. Retry it.' }], demo: true },
        { id: `routine-session-${routine.id}-failed`, routineId: routine.id, title: routine.name, startedAt: at(76), trigger: 'schedule' as const, status: 'failed' as const, reason: locale === 'zh' ? '本次生成未完成，请在下次日程继续查看。' : 'This generation did not complete. Check the next scheduled run.', deliveries: [], demo: true },
      ]
    })
  }
  const load = async () => {
    if (!loaded) {
      const raw = storage?.getItem(key)
      let routines: RoutineConfig[] = []
      if (raw) {
        const value: unknown = JSON.parse(raw)
        if (!Array.isArray(value)) throw new Error('Stored Routine data is invalid')
        routines = value.map((item) => {
          if (!item || typeof item !== 'object') throw new Error('Stored Routine data is invalid')
          const legacy = item as Record<string, unknown>
          const storedSkill = legacy.skillId
          const skillId = typeof storedSkill === 'string' && routineSkillIds.includes(storedSkill as typeof routineSkillIds[number])
            ? storedSkill as typeof routineSkillIds[number]
            : legacy.template === 'weekly' ? 'project-weekly-report' : 'morning-briefing'
          const { template: _template, themes: _themes, prompt: _prompt, ...routine } = legacy
          return { ...routine, enabled: routine.enabled !== false, skillId } as RoutineConfig
        })
        if (routines.some((item) => !item || typeof item.id !== 'string' || !item.id || validateRoutine(item))) throw new Error('Stored Routine data is invalid')
      } else if (initial) {
        routines = defaults()
        storage?.setItem(key, JSON.stringify(routines))
      }
      snapshot = { routines, sessions: initial ? mockSessions(routines, initial.locale) : [] }
      loaded = true
    }
    return current()
  }
  const write = (next: RoutineSnapshot) => { storage?.setItem(key, JSON.stringify(next.routines)); snapshot = structuredClone(next); return current() }
  return {
    load,
    save: async (config) => {
      await load()
      const invalid = validateRoutine(config)
      if (invalid) throw new Error(`Invalid Routine ${invalid}`)
      const saved = structuredClone({ ...config, name: config.name.trim(), weekdays: [...new Set(config.weekdays)].sort((a, b) => a - b), recipients: normalizeRecipients(config.recipients) })
      const existing = snapshot.routines.some((item) => item.id === saved.id)
      return write({ ...snapshot, routines: existing ? snapshot.routines.map((item) => item.id === saved.id ? saved : item) : [...snapshot.routines, saved] })
    },
    remove: async (id) => { await load(); return write({ ...snapshot, routines: snapshot.routines.filter((item) => item.id !== id) }) },
    recipients: async (connector, locale) => {
      const labels = locale === 'zh'
        ? [['产品讨论组', '产品团队 · 12 位成员'], ['项目协作组', '交付团队 · 8 位成员'], ['陈思睿', '产品部 · 产品经理'], ['陈思睿', '设计部 · 设计师']]
        : [['Product team', 'Product · 12 members'], ['Project team', 'Delivery · 8 members'], ['Alex Chen', 'Product · Product manager'], ['Alex Chen', 'Design · Designer']]
      return labels.map(([name, detail], index) => ({ connector, id: `demo-${index + 1}`, kind: index < 2 ? 'group' : 'person', name, detail }))
    },
    preview: async (config, locale) => {
      if (validateRoutine(config)) throw new Error('Routine is invalid')
      return { id: crypto.randomUUID(), title: config.name, format: config.format, style: config.style || 'edition', createdAt: new Date().toISOString(), sections: previewSections(config.skillId, locale), demo: true }
    },
    retry: async (session) => {
      if (!session.demo) throw new Error('This session cannot be retried by the demo service')
      if (session.status === 'failed') return structuredClone({ ...session, status: 'generating' as const, reason: undefined })
      if (!session.document || session.status !== 'completed') throw new Error('This session cannot be retried by the demo service')
      return structuredClone({ ...session, deliveries: session.deliveries.map((delivery) => delivery.status === 'failed' ? { ...delivery, status: 'sent' as const, reason: undefined } : delivery) })
    },
  }
}
