import assert from 'node:assert/strict'
import test from 'node:test'
import { createRoutineDraft, sessionResult } from './routineState.ts'
import type { RoutineSession } from './routineState.ts'
import { createRoutineService } from './routineService.ts'

test('saving snapshots is isolated, previews never add sessions, deletion only removes one routine', async () => {
  const service = createRoutineService()
  const first = { ...createRoutineDraft([], 'Asia/Shanghai', 'zh'), skillId: 'morning-briefing' as const }
  const saved = await service.save(first)
  const unsaved = { ...first, skillId: 'risk-review' as const }
  assert.equal((await service.load()).routines[0].skillId, 'morning-briefing')
  assert.equal(unsaved.skillId, 'risk-review')
  const preview = await service.preview(first, 'zh')
  assert.equal(preview.demo, true)
  assert.equal((await service.load()).sessions.length, 0)
  const second = { ...createRoutineDraft(saved.routines, 'Asia/Shanghai', 'zh'), skillId: 'project-weekly-report' as const }
  await service.save(second)
  const after = await service.remove(first.id)
  assert.deepEqual(after.routines.map((item) => item.id), [second.id])
})

test('storage write failure does not replace saved configuration', async () => {
  let value: string | null = null
  let fail = false
  const service = createRoutineService({ getItem: () => value, setItem: (_, next) => { if (fail) throw new Error('disk full'); value = next } }, 'user-one')
  const config = { ...createRoutineDraft([], 'Asia/Shanghai', 'zh'), skillId: 'morning-briefing' as const }
  await service.save(config)
  fail = true
  await assert.rejects(service.save({ ...config, name: 'unsaved' }), /disk full/)
  assert.equal((await service.load()).routines[0].name, config.name)
})

test('malformed stored configuration is an error, not an empty successful load', async () => {
  const service = createRoutineService({ getItem: () => '{bad', setItem: () => {} }, 'user')
  await assert.rejects(service.load())
})

test('routine overview does not load legacy demo routines into the formal product', async () => {
  const legacy = JSON.stringify([createRoutineDraft([], 'Asia/Shanghai', 'zh')])
  const storage = { getItem: (key: string) => key === 'friday-demo-routines:user' ? legacy : null, setItem: () => {} }
  assert.deepEqual((await createRoutineService(storage, 'user').load()).routines, [])
})

test('a new routine overview starts with the confirmed weekly and daily routines', async () => {
  let value: string | null = null
  const storage = { getItem: () => value, setItem: (_: string, next: string) => { value = next } }
  const initial = { locale: 'zh' as const, timezone: 'Asia/Shanghai' }
  const snapshot = await createRoutineService(storage, 'routine-user', initial).load()
  assert.deepEqual(snapshot.routines.map(({ name, skillId, weekdays, time, timezone }) => ({ name, skillId, weekdays, time, timezone })), [
    { name: '项目周报', skillId: 'project-weekly-report', weekdays: [5], time: '18:00', timezone: 'Asia/Shanghai' },
    { name: '今日工作简报', skillId: 'morning-briefing', weekdays: [1, 2, 3, 4, 5, 6, 7], time: '09:00', timezone: 'Asia/Shanghai' },
  ])
  assert.equal(JSON.parse(value ?? '[]').length, 2)
  assert.equal((await createRoutineService(storage, 'routine-user', initial).load()).routines.length, 2)
})

test('stored routines default to enabled, persist pause state, and include all five recent-session states', async () => {
  let value: string | null = null
  const storage = { getItem: () => value, setItem: (_: string, next: string) => { value = next } }
  const service = createRoutineService(storage, 'routine-enabled', { locale: 'zh', timezone: 'Asia/Shanghai' })
  const first = await service.load()
  assert.ok(first.routines.every((routine) => routine.enabled))
  assert.equal(first.sessions.length, first.routines.length * 5)
  assert.ok(first.sessions.every((session) => session.trigger === 'schedule' && session.demo))
  assert.deepEqual([...new Set(first.sessions.map(sessionResult))].sort(), ['delivery-failed', 'failed', 'generated', 'generating', 'sent'])
  await service.save({ ...first.routines[0], enabled: false })
  assert.equal((await service.load()).routines[0].enabled, false)
})

test('insufficient source material is presented as generation failure', () => {
  const config = { ...createRoutineDraft([], 'Asia/Shanghai', 'zh'), skillId: 'morning-briefing' as const }
  assert.equal(sessionResult({ id: 'insufficient', routineId: config.id, title: config.name, startedAt: '2026-09-14T01:00:00.000Z', trigger: 'schedule', status: 'insufficient', deliveries: [], demo: true }), 'failed')
})

test('retry preserves file identity and excludes successful and unknown targets', async () => {
  const service = createRoutineService()
  const config = { ...createRoutineDraft([], 'Asia/Shanghai', 'zh'), skillId: 'morning-briefing' as const }
  const targets = await service.recipients('dingtalk', 'zh')
  const document = await service.preview(config, 'zh')
  const session: RoutineSession = { id: 'run', routineId: config.id, title: config.name, startedAt: document.createdAt, trigger: 'schedule', status: 'completed', document, demo: true, deliveries: targets.slice(0, 3).map((target, i) => ({ target, status: (['sent', 'failed', 'unknown'] as const)[i] })) }
  const result = await service.retry(session)
  assert.equal(result.document?.id, document.id)
  assert.deepEqual(result.deliveries.map((item) => item.status), ['sent', 'sent', 'unknown'])
  assert.equal(session.deliveries[1].status, 'failed')
})

test('retrying a failed generation restarts it without inventing a document', async () => {
  const service = createRoutineService()
  const config = createRoutineDraft([], 'Asia/Shanghai', 'zh')
  const result = await service.retry({ id: 'failed-run', routineId: config.id, title: config.name, startedAt: '2026-09-14T01:00:00.000Z', trigger: 'schedule', status: 'failed', reason: 'generation stopped', deliveries: [], demo: true })
  assert.equal(result.status, 'generating')
  assert.equal(result.reason, undefined)
  assert.equal(result.document, undefined)
})

test('legacy template settings migrate to one core skill without retaining prompt or topics', async () => {
  let value = JSON.stringify([{ ...createRoutineDraft([], 'Asia/Shanghai', 'zh'), template: 'weekly', themes: ['本周成果'], prompt: '旧 Prompt' }])
  const storage = { getItem: () => value, setItem: (_: string, next: string) => { value = next } }
  const [routine] = (await createRoutineService(storage, 'legacy').load()).routines
  assert.equal(routine.skillId, 'project-weekly-report')
  assert.equal('template' in routine, false)
  assert.equal('themes' in routine, false)
  assert.equal('prompt' in routine, false)
})
