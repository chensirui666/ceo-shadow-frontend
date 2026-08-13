import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: { port: 24682 }, middlewareMode: true } })
after(() => vite.close())

test('Todos table starts with the todo title and keeps Detail only in project facts', async () => {
  const { default: TaskProjectDetail } = await vite.ssrLoadModule('/src/components/TaskProjectDetail.tsx')
  const { translations } = await import('./content/translations.ts')
  const { createDemoTasksSnapshot } = await import('./tasksState.ts')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const html = renderToStaticMarkup(createElement(TaskProjectDetail, { copy: translations.en.workspace.tasks, locale: 'en', onOpenAiProduct: () => {}, onOpenProjectDetail: () => {}, onTodoStatusChange: () => {}, project, updatingTodoId: null }))

  assert.match(html, />Detail</)
  assert.match(html, /data-project-detail-action/)
  assert.match(html, />AI Product</)
  assert.match(html, /<h3>Todos<\/h3>/)
  assert.match(html, /task-todo-table-head"><span>Todos<\/span><span>Owner<\/span>/)
  assert.match(html, /data-ai-product-action="acceptance-scope"/)
  assert.match(html, /task-todo-action-menu-trigger/)
  assert.doesNotMatch(html, /data-label="Detail"/)
  assert.doesNotMatch(html, />View detail</)
})

test('personal TODO details are triggered only from the icon and number cluster', async () => {
  const { PersonalTodos } = await vite.ssrLoadModule('/src/components/TasksWorkspace.tsx')
  const { translations } = await import('./content/translations.ts')
  const { createDemoTasksSnapshot } = await import('./tasksState.ts')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const html = renderToStaticMarkup(createElement(PersonalTodos, { copy: translations.en.workspace.tasks, currentUser: '陈思睿', project }))

  assert.match(html, /^<button\b/)
  assert.match(html, /aria-describedby="personal-todos-client-delivery"/)
  assert.match(html, /id="personal-todos-client-delivery"[^>]*role="tooltip"/)
  assert.doesNotMatch(html, />1 open</)
  assert.doesNotMatch(html, />0 overdue</)
  assert.doesNotMatch(html, />1 completed</)
})

test('Task workspace shows only the Tasks related to an opened Message', async () => {
  const { default: TasksWorkspace } = await vite.ssrLoadModule('/src/components/TasksWorkspace.tsx')
  const { translations } = await import('./content/translations.ts')
  const relatedTasks = [{ title: '确认交付资源与最终排期', status: 'open' as const }, { title: '同步交付说明', status: 'completed' as const }]
  const html = renderToStaticMarkup(createElement(TasksWorkspace, { currentUser: '陈思睿', locale: 'zh', messageTasks: relatedTasks, onDetailHeaderChange: () => {}, returnToListRequest: 0 }))

  assert.match(html, /tasks-message-list/)
  assert.match(html, /确认交付资源与最终排期/)
  assert.match(html, /同步交付说明/)
  assert.match(html, /待处理/)
  assert.match(html, /已完成/)
  assert.doesNotMatch(html, /客户交付准备/)
})

test('attention copy identifies projects that are blocked only', async () => {
  const { translations } = await import('./content/translations.ts')

  assert.equal(translations.en.workspace.tasks.dashboard.attentionHint(1, 2), '1 overdue · 2 blocked only')
  assert.equal(translations.zh.workspace.tasks.dashboard.attentionHint(1, 2), '1 项逾期 · 2 项仅阻塞')
})

test('project detail keeps priority in basic facts without a duplicate top status line', async () => {
  const { default: TaskProjectDetail } = await vite.ssrLoadModule('/src/components/TaskProjectDetail.tsx')
  const { translations } = await import('./content/translations.ts')
  const { createDemoTasksSnapshot } = await import('./tasksState.ts')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const html = renderToStaticMarkup(createElement(TaskProjectDetail, { copy: translations.en.workspace.tasks, locale: 'en', onOpenAiProduct: () => {}, onOpenProjectDetail: () => {}, onTodoStatusChange: () => {}, project, updatingTodoId: null }))

  assert.doesNotMatch(html, /tasks-detail-status/)
  assert.match(html, /Priority/)
  assert.match(html, />P0</)
})

test('project detail keeps Current progress, action items, and sources without rendering the overview table', async () => {
  const { default: TaskProjectDetail } = await vite.ssrLoadModule('/src/components/TaskProjectDetail.tsx')
  const { translations } = await import('./content/translations.ts')
  const { createDemoTasksSnapshot } = await import('./tasksState.ts')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const html = renderToStaticMarkup(createElement(TaskProjectDetail, { copy: translations.zh.workspace.tasks, locale: 'zh', onOpenAiProduct: () => {}, onOpenProjectDetail: () => {}, onTodoStatusChange: () => {}, project, updatingTodoId: null }))

  assert.doesNotMatch(html, /tasks-project-overview-panel/)
  assert.match(html, /tasks-milestones-panel/)
  assert.match(html, /tasks-action-items-panel/)
  assert.match(html, /tasks-sources-panel/)
})

test('Current progress presents milestones as a selectable stage navigator', async () => {
  const { default: TaskProjectDetail } = await vite.ssrLoadModule('/src/components/TaskProjectDetail.tsx')
  const { translations } = await import('./content/translations.ts')
  const { createDemoTasksSnapshot } = await import('./tasksState.ts')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const html = renderToStaticMarkup(createElement(TaskProjectDetail, { copy: translations.zh.workspace.tasks, locale: 'zh', onOpenAiProduct: () => {}, onOpenProjectDetail: () => {}, onTodoStatusChange: () => {}, project, updatingTodoId: null }))

  assert.match(html, /class="task-milestone-navigator"/)
  assert.match(html, /role="tablist"/)
  assert.match(html, /<button(?=[^>]*role="tab")(?=[^>]*aria-selected="true")/)
  assert.match(html, /class="task-milestone-detail"/)
  assert.match(html, /role="tabpanel"/)
  assert.match(html, />查看关联行动项</)
})

test('source rail uses conventional material icons and preserves title tooltips', async () => {
  const { default: TaskProjectDetail } = await vite.ssrLoadModule('/src/components/TaskProjectDetail.tsx')
  const { translations } = await import('./content/translations.ts')
  const { createDemoTasksSnapshot } = await import('./tasksState.ts')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const html = renderToStaticMarkup(createElement(TaskProjectDetail, { copy: translations.en.workspace.tasks, locale: 'en', onOpenAiProduct: () => {}, onOpenProjectDetail: () => {}, onTodoStatusChange: () => {}, project, updatingTodoId: null }))

  assert.match(html, /task-source-rail-icon/)
  assert.match(html, /task-source-rail-chevron/)
  assert.match(html, /task-source-rail-tooltip/)
})

test('source hover labels use concrete type-specific filenames', async () => {
  const { default: TaskProjectDetail } = await vite.ssrLoadModule('/src/components/TaskProjectDetail.tsx')
  const { translations } = await import('./content/translations.ts')
  const { createDemoTasksSnapshot } = await import('./tasksState.ts')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const html = renderToStaticMarkup(createElement(TaskProjectDetail, { copy: translations.zh.workspace.tasks, locale: 'zh', onOpenAiProduct: () => {}, onOpenProjectDetail: () => {}, onTodoStatusChange: () => {}, project, updatingTodoId: null }))

  assert.match(html, /8 月客户联调会\.md/)
  assert.match(html, /现场演示方案\.pptx/)
  assert.match(html, /客户回访录音\.mp3/)
})

test('action-item source trace exposes linked file names and original excerpts', async () => {
  const { default: TaskProjectDetail } = await vite.ssrLoadModule('/src/components/TaskProjectDetail.tsx')
  const { translations } = await import('./content/translations.ts')
  const { createDemoTasksSnapshot } = await import('./tasksState.ts')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const html = renderToStaticMarkup(createElement(TaskProjectDetail, { copy: translations.zh.workspace.tasks, locale: 'zh', onOpenAiProduct: () => {}, onOpenProjectDetail: () => {}, onTodoStatusChange: () => {}, project, updatingTodoId: null }))

  assert.match(html, /data-todo-source="acceptance-scope"/)
  assert.match(html, /aria-describedby="todo-source-acceptance-scope"/)
  assert.match(html, /id="todo-source-acceptance-scope"[^>]*role="tooltip"/)
  assert.match(html, /8 月客户联调会\.md/)
  assert.match(html, /会后确认：本周先完成现场演示，客户根据演示结果决定是否进入试用。/)
})

test('the shared document surface starts editable without preview or manual-save controls', async () => {
  const { default: TaskDocumentSurface } = await vite.ssrLoadModule('/src/components/TaskDocumentSurface.tsx')
  const { translations } = await import('./content/translations.ts')
  const { createDemoTasksSnapshot } = await import('./tasksState.ts')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const copy = (translations.en.workspace.tasks as typeof translations.en.workspace.tasks & {
    document: { projectDetail: string; preview: string; edit: string; save: string; saved: string; backToProject: (project: string) => string; titleLabel: string; bodyLabel: string }
  }).document
  const html = renderToStaticMarkup(createElement(TaskDocumentSurface, { copy, document: project.detailDocument, label: copy.projectDetail, onBack: () => {}, onSave: () => {} }))

  assert.match(html, /<textarea/)
  assert.match(html, /role="document"/)
  assert.match(html, /客户交付准备：项目详情/)
  assert.doesNotMatch(html, />Preview</)
  assert.doesNotMatch(html, />Edit</)
  assert.doesNotMatch(html, />Save changes</)
})

test('AI Product uses the shared editable surface with collapsed Copilot', async () => {
  const { default: TaskAiProductDocument } = await vite.ssrLoadModule('/src/components/TaskAiProductDocument.tsx')
  const { translations } = await import('./content/translations.ts')
  const { createDemoTasksSnapshot } = await import('./tasksState.ts')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const todo = project.todos.find((item) => item.id === 'acceptance-scope')

  assert.ok(todo?.aiProduct)
  const html = renderToStaticMarkup(createElement(TaskAiProductDocument, {
    copy: translations.en.workspace.tasks,
    locale: 'en',
    onBack: () => {},
    onSave: () => {},
    project,
    todo: todo!,
  }))

  assert.match(html, /aria-label="AI Product document"/)
  assert.match(html, /value="客户验收清单"/)
  assert.match(html, /<textarea/)
  assert.doesNotMatch(html, />Preview</)
  assert.doesNotMatch(html, />Edit</)
  assert.match(html, /aria-label="Open Copilot"/)
  assert.match(html, /Back to 客户交付准备/)
})

test('AI Product exposes a reference-style conversation composer without a fake reply', async () => {
  const { AiProductCopilot } = await vite.ssrLoadModule('/src/components/TaskAiProductDocument.tsx')
  const { translations } = await import('./content/translations.ts')
  const html = renderToStaticMarkup(createElement(AiProductCopilot, {
    copy: translations.en.workspace.tasks.aiProductDocument,
    documentTitle: 'Customer acceptance checklist',
    messages: ['Please clarify the acceptance owner.'],
    onClose: () => {},
    onSend: () => {},
  }))

  assert.match(html, /ai-product-copilot-messages/)
  assert.match(html, /Please clarify the acceptance owner\./)
  assert.match(html, /ai-product-copilot-composer/)
  assert.doesNotMatch(html, /ai-product-copilot-suggestions/)
  assert.doesNotMatch(html, /ai-product-feedback/)
})
