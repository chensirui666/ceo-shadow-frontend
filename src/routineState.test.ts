import assert from 'node:assert/strict'
import test from 'node:test'
import { createRoutineDraft, halfHourTimes, isRoutineDirty, normalizeRecipients, routineSkills, validateRoutine } from './routineState.ts'

test('new routines begin with an empty core-skill selection and confirmed schedule defaults', () => {
  const draft = createRoutineDraft([], 'Asia/Shanghai', 'zh')
  assert.equal(draft.name, '早间简报')
  assert.equal(draft.skillId, null)
  assert.deepEqual(draft.weekdays, [1, 2, 3, 4, 5, 6, 7])
  assert.equal(draft.time, '09:00')
  assert.equal(draft.timezone, 'Asia/Shanghai')
  assert.equal(draft.format, 'pdf')
  assert.equal(draft.style, 'edition')
  assert.deepEqual(draft.recipients, [])
  assert.equal(validateRoutine(draft), 'skill')
  const second = createRoutineDraft([draft], 'America/New_York', 'zh')
  assert.equal(second.name, '早间简报 2')
  assert.equal(draft.timezone, 'Asia/Shanghai')
})

test('a routine requires one core skill and the skill owns its briefing contract', () => {
  const draft = createRoutineDraft([], 'Asia/Shanghai', 'zh')
  assert.equal(draft.skillId, null)
  assert.equal(validateRoutine(draft), 'skill')

  const selected = { ...draft, skillId: 'project-weekly-report' as const }
  assert.equal(validateRoutine(selected), null)
  assert.deepEqual(routineSkills.zh['project-weekly-report'], {
    name: '项目周报能力',
    creator: 'Friday 创建',
    description: '汇总本周成果、项目进展、风险与下周重点。',
    detail: '基于已连接的工作资料，形成一份结构清晰的项目周报。',
  })
})

test('schedule accepts multiple weekdays and exactly 48 half-hour choices', () => {
  assert.equal(halfHourTimes.length, 48)
  assert.equal(halfHourTimes[0], '00:00')
  assert.equal(halfHourTimes[47], '23:30')
  const draft = { ...createRoutineDraft([], 'Asia/Shanghai', 'zh'), skillId: 'morning-briefing' as const }
  assert.equal(validateRoutine({ ...draft, weekdays: [1, 3, 5] }), null)
  assert.equal(validateRoutine({ ...draft, weekdays: [] }), 'weekdays')
  assert.equal(validateRoutine({ ...draft, weekdays: [8] }), 'weekdays')
  assert.equal(validateRoutine({ ...draft, time: '09:15' }), 'time')
  assert.equal(validateRoutine({ ...draft, name: ' ' }), 'name')
  assert.equal(validateRoutine({ ...draft, skillId: null }), 'skill')
})

test('recipient identity includes connector and kind, never just display name', () => {
  const person = { connector: 'dingtalk' as const, kind: 'person' as const, id: '1', name: '同名', detail: '产品组' }
  assert.equal(normalizeRecipients([person, { ...person }, { ...person, connector: 'teams' }, { ...person, kind: 'group' }]).length, 3)
})

test('creating a routine is never an unsaved edit, while editing an existing routine is', () => {
  const saved = createRoutineDraft([], 'Asia/Shanghai', 'zh')
  assert.equal(isRoutineDirty(saved, undefined, true), false)
  assert.equal(isRoutineDirty(saved, saved, false), false)
  assert.equal(isRoutineDirty({ ...saved, time: '09:30' }, saved, false), true)
})

test('changing an existing routine core skill is an unsaved edit', () => {
  const saved = { ...createRoutineDraft([], 'Asia/Shanghai', 'zh'), skillId: 'morning-briefing' as const }
  assert.equal(isRoutineDirty({ ...saved, skillId: 'risk-review' }, saved, false), true)
})

test('session summaries distinguish unknown results from failed delivery', async () => {
  const { sessionResult } = await import('./routineState.ts')
  const { createRoutineService } = await import('./routineService.ts')
  const service = createRoutineService()
  const routine = createRoutineDraft([], 'Asia/Shanghai', 'zh')
  const [target] = await service.recipients('dingtalk', 'zh')
  const session = { id: 'demo', routineId: routine.id, title: routine.name, startedAt: new Date().toISOString(), trigger: 'schedule' as const, status: 'completed' as const, deliveries: [], demo: true }
  assert.equal(sessionResult(session), 'generated')
  assert.equal(sessionResult({ ...session, deliveries: [{ target, status: 'sent' }] }), 'sent')
  assert.equal(sessionResult({ ...session, deliveries: [{ target, status: 'failed' }] }), 'delivery-failed')
  assert.equal(sessionResult({ ...session, deliveries: [{ target, status: 'failed' }, { target, status: 'sent' }] }), 'partial')
  assert.equal(sessionResult({ ...session, deliveries: [{ target, status: 'unknown' }, { target, status: 'failed' }] }), 'unknown')
})
