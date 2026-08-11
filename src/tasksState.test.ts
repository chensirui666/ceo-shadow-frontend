import assert from 'node:assert/strict'
import test from 'node:test'

const tasksState = await import('./tasksState.ts')
const { translations } = await import('./content/translations.ts')

test('only the current user projects appear in newest generated TODO order and the dashboard counts their work', () => {
  const snapshot = tasksState.createDemoTasksSnapshot('陈思睿')
  const projects = tasksState.selectTaskProjects(snapshot, '陈思睿')
  const summary = tasksState.getTasksSummary(projects, '陈思睿', new Date('2026-08-08T12:00:00.000Z'))

  assert.deepEqual(projects.map((project) => project.id), ['client-delivery', 'august-release', 'july-review', 'knowledge-base'])
  assert.deepEqual(summary, { projects: 4, owned: 2, myOpenTodos: 2, attention: 2, overdueProjects: 1, blockedProjects: 1 })
  assert.deepEqual(tasksState.myTodoProgress(projects, '陈思睿'), { completed: 2, total: 4, percent: 50 })
  assert.deepEqual(tasksState.projectProgress(projects[0]), { completed: 1, total: 3, percent: 33 })
  assert.equal(tasksState.projectDisplayStatus(projects[1], new Date('2026-08-08T12:00:00.000Z')), 'overdue')
})

test('personal TODO summary counts only the current user and defines overdue from an open TODO past its DDL', () => {
  const snapshot = tasksState.createDemoTasksSnapshot('陈思睿')
  const [delivery, release] = snapshot.projects
  const now = new Date('2026-08-08T12:00:00.000Z')

  assert.deepEqual(tasksState.projectPersonalTodoSummary(delivery, '陈思睿', now), { open: 1, overdue: 0, completed: 1 })
  assert.deepEqual(tasksState.projectPersonalTodoSummary(release, '陈思睿', now), { open: 1, overdue: 1, completed: 0 })
})

test('overdue respects an exact DDL timestamp when one is provided', () => {
  const snapshot = tasksState.createDemoTasksSnapshot('陈思睿')
  const release = snapshot.projects[1]
  release.todos[0].dueAt = '2026-08-08T10:00:00.000Z'

  assert.deepEqual(tasksState.projectPersonalTodoSummary(release, '陈思睿', new Date('2026-08-08T12:00:00.000Z')), { open: 1, overdue: 1, completed: 0 })
})

test('demo projects expose explicit milestones and project-source materials', () => {
  const delivery = tasksState.createDemoTasksSnapshot('陈思睿').projects[0]

  assert.ok('milestones' in delivery, 'projects should provide explicit milestone fixtures')
  const milestones = delivery.milestones as Array<{ title: string; status: string }>
  assert.equal(milestones.find((milestone) => milestone.status === 'active')?.title, '确认验收范围')
  assert.ok('sources' in delivery, 'projects should provide source materials instead of conclusions')
  const sources = delivery.sources as Array<{ type: string }>
  assert.deepEqual(sources.map((source) => source.type), ['minutes', 'document', 'presentation', 'audio', 'folder'])
})

test('a completed action updates only its linked milestone fraction', () => {
  const milestoneProgress = (tasksState as unknown as { milestoneProgress?: unknown }).milestoneProgress
  assert.equal(typeof milestoneProgress, 'function', 'milestone progress should be derived from linked actions')
  if (typeof milestoneProgress !== 'function') return

  const before = tasksState.createDemoTasksSnapshot('陈思睿')
  const after = tasksState.updateTodoStatus(before, 'acceptance-scope', 'completed', new Date('2026-08-08T12:00:00.000Z'))
  const delivery = after.projects[0] as typeof after.projects[number] & { milestones: Array<{ id: string }> }
  const milestone = delivery.milestones.find((item) => item.id === 'acceptance')

  assert.ok(milestone)
  assert.deepEqual((milestoneProgress as (project: typeof delivery, item: typeof milestone) => unknown)(delivery, milestone), { completed: 1, total: 1, percent: 100 })
})

test('Tasks labels priorities as P0, P1, and P2', () => {
  assert.deepEqual(translations.zh.workspace.tasks.priority, { high: 'P0', medium: 'P1', low: 'P2' })
})

test('completing or cancelling an open TODO records its terminal time and updates the latest project change', () => {
  const before = tasksState.createDemoTasksSnapshot('陈思睿')
  const completed = tasksState.updateTodoStatus(before, 'acceptance-scope', 'completed', new Date('2026-08-08T12:00:00.000Z'))
  const cancelled = tasksState.updateTodoStatus(before, 'rollout-list', 'cancelled', new Date('2026-08-08T12:00:00.000Z'))

  assert.equal(before.projects[0].todos[0].status, 'open')
  assert.equal(completed.projects[0].todos[0].completedAt, '2026-08-08T12:00:00.000Z')
  assert.equal(completed.projects[0].recentChange.summary, '已完成「确认客户验收范围」。')
  assert.equal(completed.projects[0].progress, '已完成「确认客户验收范围」，请继续处理剩余待办。')
  assert.equal(cancelled.projects[1].todos[0].cancelledAt, '2026-08-08T12:00:00.000Z')
  assert.deepEqual(tasksState.projectProgress(cancelled.projects[1]), { completed: 0, total: 1, percent: 0 })
})

test('AI Product edits and feedback stay in the current snapshot while preserving its sources', () => {
  const updateAiProduct = (tasksState as unknown as { updateAiProduct?: unknown }).updateAiProduct
  assert.equal(typeof updateAiProduct, 'function', 'AI Product updater should exist at the Tasks data boundary')
  if (typeof updateAiProduct !== 'function') return

  const before = tasksState.createDemoTasksSnapshot('陈思睿')
  const after = (updateAiProduct as (snapshot: typeof before, todoId: string, update: { title: string; content: string; feedback: string[] }, now: Date) => typeof before)(before, 'acceptance-scope', {
    title: '更新后的验收清单',
    content: '第一项：确认环境。',
    feedback: ['补充权限负责人。'],
  }, new Date('2026-08-10T08:00:00.000Z'))

  const product = after.projects[0].todos[0].aiProduct
  assert.equal(product?.title, '更新后的验收清单')
  assert.equal(product?.content, '第一项：确认环境。')
  assert.deepEqual(product?.feedback, ['补充权限负责人。'])
  assert.deepEqual(product?.sourceIds, ['delivery-minutes', 'delivery-document'])
  assert.equal(before.projects[0].todos[0].aiProduct?.title, '客户验收清单')
})

test('project detail document edits replace only that project in the session snapshot', () => {
  const updateProjectDocument = (tasksState as unknown as {
    updateProjectDocument?: (snapshot: ReturnType<typeof tasksState.createDemoTasksSnapshot>, projectId: string, update: { title: string; content: string }, now: Date) => ReturnType<typeof tasksState.createDemoTasksSnapshot>
  }).updateProjectDocument
  assert.equal(typeof updateProjectDocument, 'function', 'project detail updater should exist at the Tasks data boundary')
  if (typeof updateProjectDocument !== 'function') return

  const before = tasksState.createDemoTasksSnapshot('陈思睿')
  const after = updateProjectDocument(before, 'client-delivery', {
    title: '客户交付准备：说明',
    content: '已确认验收负责人。',
  }, new Date('2026-08-10T09:00:00.000Z'))
  const detailDocument = (after.projects[0] as typeof after.projects[number] & { detailDocument: { title: string; content: string; updatedAt: string } }).detailDocument
  const originalDocument = (before.projects[0] as typeof before.projects[number] & { detailDocument: { content: string } }).detailDocument
  const otherDocument = (after.projects[1] as typeof after.projects[number] & { detailDocument: { title: string } }).detailDocument
  const untouchedDocument = (before.projects[1] as typeof before.projects[number] & { detailDocument: { title: string } }).detailDocument

  assert.equal(detailDocument.title, '客户交付准备：说明')
  assert.equal(detailDocument.content, '已确认验收负责人。')
  assert.equal(detailDocument.updatedAt, '2026-08-10T09:00:00.000Z')
  assert.equal(originalDocument.content.includes('项目目标'), true)
  assert.equal(otherDocument.title, untouchedDocument.title)
})
