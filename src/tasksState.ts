export const projectStatuses = ['not-started', 'in-progress', 'overdue', 'completed'] as const
export const todoStatuses = ['open', 'completed', 'cancelled'] as const
export const taskPriorities = ['high', 'medium', 'low'] as const
export const taskSourceTypes = ['document', 'minutes', 'presentation', 'audio', 'folder', 'file', 'message', 'meeting', 'todo'] as const

export type ProjectStatus = typeof projectStatuses[number]
export type TodoStatus = typeof todoStatuses[number]
export type TaskPriority = typeof taskPriorities[number]
export type TaskSourceType = typeof taskSourceTypes[number]
export type TaskSource = { id: string; type: TaskSourceType; name: string; occurredAt: string; excerpt: string; metadata?: string }
export type TaskMilestone = { id: string; title: string; summary: string; status: 'completed' | 'active' | 'upcoming'; dueAt: string; completedAt?: string }
export type TaskDocument = { title: string; content: string; updatedAt: string }
export type TaskAiProduct = TaskDocument & { type: 'checklist' | 'message' | 'script' | 'brief'; status: 'draft'; preview: string; feedback: string[]; sourceIds: string[] }
export type TaskTodo = { id: string; title: string; owner: string; status: TodoStatus; generatedAt: string; dueAt?: string; completedAt?: string; cancelledAt?: string; milestoneId?: string; detail: string; sourceIds: string[]; aiProduct?: TaskAiProduct }
export type TaskConclusion = { id: string; summary: string; recordedAt: string; sources: TaskSource[] }
export type TaskProject = {
  id: string
  name: string
  category: string
  status: ProjectStatus
  owner: string
  participants: string[]
  priority: TaskPriority
  startedAt: string
  detailDocument: TaskDocument
  goal: string
  background: string
  progress: string
  blocker: string
  nextStep: string
  recentChange: { summary: string; at: string; source: TaskSource }
  todos: TaskTodo[]
  milestones: TaskMilestone[]
  sources: TaskSource[]
  conclusions: TaskConclusion[]
}

export type TasksSnapshot = { projects: TaskProject[] }
export type TasksSummary = { projects: number; owned: number; myOpenTodos: number; attention: number; overdueProjects: number; blockedProjects: number }

const source = (id: string, type: TaskSource['type'], name: string, occurredAt: string, excerpt: string, metadata?: string): TaskSource => ({ id, type, name, occurredAt, excerpt, metadata })
const detailDocument = (title: string, updatedAt: string, content: string): TaskDocument => ({ title, updatedAt, content })

export const createDemoTasksSnapshot = (currentUser: string): TasksSnapshot => ({
  projects: [
    {
      id: 'client-delivery', name: '客户交付准备', category: '客户交付', status: 'in-progress', owner: currentUser, participants: ['林妙', '周航'], priority: 'high', startedAt: '2026-07-28T09:00:00.000Z',
      detailDocument: detailDocument('客户交付准备：项目详情', '2026-08-08T09:30:00.000Z', ['项目基本信息', '开始时间：7 月 28 日', ['负责人：', currentUser].join(''), '参与人：林妙、周航', '优先级：P0', '项目目标\n在本月完成客户环境部署、验收范围确认与交付材料准备。', '背景说明\n客户将在本月启动试用，交付范围需要在联调前明确。', '当前进展\n已完成部署材料初稿，正等待客户确认验收范围。', '阻塞项\n客户尚未确认最终验收人员与测试环境权限。', ['下一步\n', currentUser, ' 在周一与客户确认验收范围和联调窗口。'].join(''), '最新动态\n客户补充了验收范围，项目先聚焦现场演示和联调准备。'].join('\n\n')),
      goal: '在本月完成客户环境部署、验收范围确认与交付材料准备。', background: '客户将在本月启动试用，交付范围需要在联调前明确。', progress: '已完成部署材料初稿，正等待客户确认验收范围。', blocker: '客户尚未确认最终验收人员与测试环境权限。', nextStep: `${currentUser} 在周一与客户确认验收范围和联调窗口。`,
      recentChange: { summary: '客户补充了验收范围，项目先聚焦现场演示和联调准备。', at: '2026-08-08T09:30:00.000Z', source: source('delivery-change', 'message', '客户交付群', '2026-08-08T09:12:00.000Z', '客户确认先完成现场演示；验收人员和测试权限将在周一例会上明确。') },
      todos: [
        { id: 'acceptance-scope', title: '确认客户验收范围', owner: currentUser, status: 'open', generatedAt: '2026-08-08T09:30:00.000Z', dueAt: '2026-08-12', milestoneId: 'acceptance', detail: '与客户确认验收范围、验收人员和测试环境权限；以会议纪要中的范围说明作为验收依据。', sourceIds: ['delivery-minutes', 'delivery-document'], aiProduct: { type: 'checklist', title: '客户验收清单', status: 'draft', updatedAt: '2026-08-08T09:30:00.000Z', preview: '按环境、权限、功能与交付材料四个维度整理的验收确认项。', content: '客户验收清单\n\n1. 确认客户环境、账号与测试权限已经准备就绪。\n2. 对齐核心流程的验收范围与验收负责人。\n3. 确认交付材料、演示记录与问题反馈入口。\n4. 在验收结束后记录结果与后续联调安排。', feedback: [], sourceIds: ['delivery-minutes', 'delivery-document'] } },
        { id: 'demo-materials', title: '整理现场演示材料', owner: currentUser, status: 'completed', generatedAt: '2026-08-06T10:00:00.000Z', dueAt: '2026-08-07', completedAt: '2026-08-07T15:20:00.000Z', milestoneId: 'demo', detail: '汇总现场演示的流程、环境说明和关键问题处理口径。', sourceIds: ['delivery-presentation'], aiProduct: { type: 'script', title: '现场演示脚本', status: 'draft', updatedAt: '2026-08-07T15:20:00.000Z', preview: '覆盖开场、核心流程、问题处理与下一步确认的演示脚本。', content: '现场演示脚本\n\n开场说明客户当前目标与验收范围。\n演示核心流程与环境准备情况。\n收集问题，并确认后续联调时间。', feedback: [], sourceIds: ['delivery-presentation'] } },
        { id: 'environment-check', title: '核对测试环境权限', owner: currentUser, status: 'cancelled', generatedAt: '2026-08-05T14:00:00.000Z', dueAt: '2026-08-08', cancelledAt: '2026-08-08T09:30:00.000Z', milestoneId: 'acceptance', detail: '该事项已由客户在验收范围确认中合并处理，取消独立跟进。', sourceIds: ['delivery-document'] },
        { id: 'deployment-guide', title: '补充客户部署说明', owner: '周航', status: 'open', generatedAt: '2026-08-05T11:00:00.000Z', dueAt: '2026-08-11', milestoneId: 'delivery', detail: '补足部署前置条件、权限申请方式和常见问题处理步骤。', sourceIds: ['delivery-folder'], aiProduct: { type: 'brief', title: '客户部署说明摘要', status: 'draft', updatedAt: '2026-08-08T10:00:00.000Z', preview: '用于客户确认部署前置条件的单页说明。', content: '客户部署说明\n\n请先确认环境与账号权限。\n按交付材料中的步骤完成部署。\n如遇异常，记录现象并反馈给项目负责人。', feedback: [], sourceIds: ['delivery-folder'] } },
      ],
      milestones: [
        { id: 'demo', title: '完成部署材料初稿', summary: '完成现场演示所需流程和材料的第一版。', status: 'completed', dueAt: '2026-08-07', completedAt: '2026-08-07T15:20:00.000Z' },
        { id: 'acceptance', title: '确认验收范围', summary: '明确验收范围、验收人员和测试环境权限。', status: 'active', dueAt: '2026-08-12' },
        { id: 'delivery', title: '联调与交付准备', summary: '完成部署说明与联调材料，进入客户交付准备。', status: 'upcoming', dueAt: '2026-08-15' },
      ],
      sources: [
        source('delivery-minutes', 'minutes', '8 月客户联调会', '2026-08-08T08:30:00.000Z', '会后确认：本周先完成现场演示，客户根据演示结果决定是否进入试用。', '会议听记'),
        source('delivery-document', 'document', '客户验收范围说明', '2026-08-08T09:12:00.000Z', '客户确认验收范围将覆盖环境、权限、核心流程与交付材料。', '文档 · 3 页'),
        source('delivery-presentation', 'presentation', '现场演示方案', '2026-08-07T15:20:00.000Z', '演示方案已覆盖客户环境、关键流程和常见问题处理。', 'PPT · 12 页'),
        source('delivery-audio', 'audio', '客户回访录音', '2026-08-06T16:00:00.000Z', '客户希望在正式试用前先完成一次现场演示。', '音频 · 18 分钟'),
        source('delivery-folder', 'folder', '客户交付材料', '2026-08-08T10:00:00.000Z', '包含部署说明、演示材料和验收模板。', '文件夹 · 6 个文件'),
      ],
      conclusions: [{ id: 'delivery-conclusion', summary: '先完成现场演示，再根据结果推进试用。', recordedAt: '2026-08-08T09:30:00.000Z', sources: [source('delivery-conclusion-source', 'meeting', '8 月客户联调会', '2026-08-08T08:30:00.000Z', '会后确认：本周先完成现场演示，客户根据演示结果决定是否进入试用。'), source('delivery-conclusion-message', 'message', '客户交付群', '2026-08-08T09:12:00.000Z', '客户确认现场演示优先，试用节奏将在演示结束后确认。')] }],
    },
    {
      id: 'august-release', name: '8 月版本发布', category: '产品', status: 'overdue', owner: '林妙', participants: [currentUser, '周航'], priority: 'high', startedAt: '2026-07-30T10:00:00.000Z',
      detailDocument: detailDocument('8 月版本发布：项目详情', '2026-08-08T08:05:00.000Z', ['项目基本信息', '开始时间：7 月 30 日', '负责人：林妙', ['参与人：', currentUser, '、周航'].join(''), '优先级：P0', '项目目标\n完成本月版本范围确认、灰度发布与发布后复盘。', '背景说明\n本次发布涉及新客户试用入口，需要先确认灰度用户范围。', '当前进展\n发布内容已完成评审，灰度名单尚未确认。', '阻塞项\n运营侧尚未给出最终灰度用户名单。', ['下一步\n', currentUser, ' 今天向运营确认灰度名单。'].join(''), '最新动态\n灰度名单确认逾期，发布窗口需要等待运营回复。'].join('\n\n')),
      goal: '完成本月版本范围确认、灰度发布与发布后复盘。', background: '本次发布涉及新客户试用入口，需要先确认灰度用户范围。', progress: '发布内容已完成评审，灰度名单尚未确认。', blocker: '运营侧尚未给出最终灰度用户名单。', nextStep: `${currentUser} 今天向运营确认灰度名单。`,
      recentChange: { summary: '灰度名单确认逾期，发布窗口需要等待运营回复。', at: '2026-08-08T08:05:00.000Z', source: source('release-change', 'meeting', '8 月发布评审', '2026-08-08T08:00:00.000Z', '发布评审确认：没有灰度名单前，不进入第一批发布。') },
      todos: [
        { id: 'rollout-list', title: '确认灰度用户名单', owner: currentUser, status: 'open', generatedAt: '2026-08-08T08:05:00.000Z', dueAt: '2026-08-07', milestoneId: 'rollout', detail: '确认第一批灰度用户范围，并同步给产品、运营和交付负责人。', sourceIds: ['release-minutes'], aiProduct: { type: 'message', title: '运营确认消息草稿', status: 'draft', updatedAt: '2026-08-08T08:05:00.000Z', preview: '用于确认名单、责任人和最晚回复时间的跟进消息草稿。', content: '请协助确认第一批灰度用户名单、对应负责人和最晚回复时间。\n\n名单确认后，我们将据此更新发布窗口与沟通安排。', feedback: [], sourceIds: ['release-minutes'] } },
        { id: 'release-plan', title: '更新发布排期', owner: '周航', status: 'open', generatedAt: '2026-08-07T14:35:00.000Z', dueAt: '2026-08-10', milestoneId: 'rollout', detail: '根据灰度名单确认时间更新发布窗口、回滚窗口与对外沟通节奏。', sourceIds: ['release-minutes'] },
      ],
      milestones: [
        { id: 'scope', title: '确认版本范围', summary: '完成发布内容与风险的评审。', status: 'completed', dueAt: '2026-08-06', completedAt: '2026-08-06T17:00:00.000Z' },
        { id: 'rollout', title: '确认灰度范围', summary: '明确第一批用户与发布窗口。', status: 'active', dueAt: '2026-08-07' },
        { id: 'review', title: '完成发布复盘', summary: '发布后回看结果并沉淀改进项。', status: 'upcoming', dueAt: '2026-08-18' },
      ],
      sources: [source('release-minutes', 'minutes', '8 月发布评审', '2026-08-08T08:00:00.000Z', '没有灰度名单前，不进入第一批发布。', '会议听记')],
      conclusions: [{ id: 'release-conclusion', summary: '第一批灰度范围必须由运营确认后再发布。', recordedAt: '2026-08-08T08:05:00.000Z', sources: [source('release-conclusion-source', 'message', '发布协同群', '2026-08-08T07:48:00.000Z', '运营表示名单仍在核对，建议本次评审暂不锁定第一批灰度范围。')] }],
    },
    {
      id: 'july-review', name: '7 月复盘', category: '内部运营', status: 'completed', owner: currentUser, participants: ['王琳'], priority: 'low', startedAt: '2026-07-20T09:00:00.000Z',
      detailDocument: detailDocument('7 月复盘：项目详情', '2026-07-31T17:00:00.000Z', ['项目基本信息', '开始时间：7 月 20 日', ['负责人：', currentUser].join(''), '参与人：王琳', '优先级：P2', '项目目标\n沉淀 7 月项目复盘与下月改进项。', '背景说明\n复盘汇总了本月交付、协作和客户反馈。', '当前进展\n复盘结论已同步，后续改进项已移入 8 月计划。', '阻塞项\n暂无。', '下一步\n已完成。', '最新动态\n复盘结论已同步到周报，项目完成。'].join('\n\n')),
      goal: '沉淀 7 月项目复盘与下月改进项。', background: '复盘汇总了本月交付、协作和客户反馈。', progress: '复盘结论已同步，后续改进项已移入 8 月计划。', blocker: '暂无。', nextStep: '已完成。',
      recentChange: { summary: '复盘结论已同步到周报，项目完成。', at: '2026-07-31T17:00:00.000Z', source: source('review-change', 'meeting', '7 月复盘会', '2026-07-31T16:00:00.000Z', '会议确认复盘结论与 8 月改进方向，由各项目负责人带入月度计划。') },
      todos: [{ id: 'review-summary', title: '整理复盘结论', owner: currentUser, status: 'completed', generatedAt: '2026-07-31T17:00:00.000Z', dueAt: '2026-07-31', completedAt: '2026-07-31T17:00:00.000Z', milestoneId: 'share', detail: '汇总交付、协作和客户反馈中的改进项，并同步到月度计划。', sourceIds: ['review-minutes'], aiProduct: { type: 'brief', title: '7 月复盘摘要', status: 'draft', updatedAt: '2026-07-31T17:00:00.000Z', preview: '可复用到周报的复盘摘要。', content: '7 月复盘摘要\n\n本月完成了客户交付、协作与反馈的复盘。\n下月优先明确验收范围、责任人与联调节奏。', feedback: [], sourceIds: ['review-minutes'] } }],
      milestones: [
        { id: 'collect', title: '收集复盘材料', summary: '汇总交付、协作与客户反馈。', status: 'completed', dueAt: '2026-07-29', completedAt: '2026-07-29T18:00:00.000Z' },
        { id: 'share', title: '同步复盘结果', summary: '将结论与改进项同步到周报和月度计划。', status: 'completed', dueAt: '2026-07-31', completedAt: '2026-07-31T17:00:00.000Z' },
        { id: 'follow-up', title: '跟进改进项', summary: '由各项目负责人带入 8 月计划。', status: 'upcoming', dueAt: '2026-08-15' },
      ],
      sources: [source('review-minutes', 'minutes', '7 月复盘会', '2026-07-31T16:00:00.000Z', '会议确认复盘结论与 8 月改进方向，由各项目负责人带入月度计划。', '会议听记')],
      conclusions: [{ id: 'review-conclusion', summary: '客户交付需要在联调前确认验收范围与负责人。', recordedAt: '2026-07-31T17:00:00.000Z', sources: [source('review-conclusion-source', 'meeting', '7 月复盘会', '2026-07-31T16:00:00.000Z', '交付复盘结论：联调启动前需要明确验收范围、验收人员与环境权限。')] }],
    },
    {
      id: 'knowledge-base', name: '客户知识库整理', category: '客户交付', status: 'not-started', owner: '王琳', participants: [currentUser], priority: 'medium', startedAt: '2026-07-18T11:00:00.000Z',
      detailDocument: detailDocument('客户知识库整理：项目详情', '2026-07-18T11:00:00.000Z', ['项目基本信息', '开始时间：7 月 18 日', '负责人：王琳', ['参与人：', currentUser].join(''), '优先级：P1', '项目目标\n整理客户常见问题与交付材料，作为后续试用支持的基础。', '背景说明\n客户支持信息仍分散在多个群和会议材料中。', '当前进展\n项目已记录，待确认第一批整理范围。', '阻塞项\n暂无。', '下一步\n待明确下一步。', '最新动态\n项目已建立，等待确认首批需要整理的客户问题。'].join('\n\n')),
      goal: '整理客户常见问题与交付材料，作为后续试用支持的基础。', background: '客户支持信息仍分散在多个群和会议材料中。', progress: '项目已记录，待确认第一批整理范围。', blocker: '暂无。', nextStep: '待明确下一步。',
      recentChange: { summary: '项目已建立，等待确认首批需要整理的客户问题。', at: '2026-07-18T11:00:00.000Z', source: source('knowledge-change', 'message', '客户支持群', '2026-07-18T10:45:00.000Z', '支持团队建议先整理高频部署、权限和验收问题，范围待下次例会确认。') },
      todos: [],
      milestones: [
        { id: 'scope', title: '确认首批整理范围', summary: '确认部署、权限和验收问题的首批范围。', status: 'upcoming', dueAt: '2026-08-12' },
        { id: 'organize', title: '整理知识条目', summary: '按高频问题归档并补充说明。', status: 'upcoming', dueAt: '2026-08-19' },
        { id: 'review', title: '评审并发布资料', summary: '与客户支持团队确认资料可用性。', status: 'upcoming', dueAt: '2026-08-26' },
      ],
      sources: [source('knowledge-folder', 'folder', '客户支持资料', '2026-07-18T10:45:00.000Z', '包含当前客户支持群中的部署、权限和验收问题记录。', '文件夹 · 9 个文件')],
      conclusions: [{ id: 'knowledge-conclusion', summary: '首批资料聚焦部署、权限和验收问题。', recordedAt: '2026-07-18T11:00:00.000Z', sources: [source('knowledge-conclusion-source', 'message', '客户支持群', '2026-07-18T10:45:00.000Z', '支持团队建议先整理高频部署、权限和验收问题，其他主题后续补充。')] }],
    },
  ],
})

export const projectProgress = (project: TaskProject) => {
  const counted = project.todos.filter((todo) => todo.status !== 'cancelled')
  const completed = counted.filter((todo) => todo.status === 'completed').length
  return { completed, total: counted.length, percent: counted.length ? Math.round(completed / counted.length * 100) : 0 }
}

export const milestoneProgress = (project: TaskProject, milestone: TaskMilestone) => {
  const counted = project.todos.filter((todo) => todo.milestoneId === milestone.id && todo.status !== 'cancelled')
  const completed = counted.filter((todo) => todo.status === 'completed').length
  return { completed, total: counted.length, percent: counted.length ? Math.round(completed / counted.length * 100) : 0 }
}

export const myTodoProgress = (projects: readonly TaskProject[], currentUser: string) => {
  const todos = projects.flatMap((project) => project.todos).filter((todo) => todo.owner === currentUser && todo.status !== 'cancelled')
  const completed = todos.filter((todo) => todo.status === 'completed').length
  return { completed, total: todos.length, percent: todos.length ? Math.round(completed / todos.length * 100) : 0 }
}

const isOverdueTodo = (todo: TaskTodo, now: Date) => {
  if (todo.status !== 'open' || !todo.dueAt) return false
  const ddl = Date.parse(todo.dueAt.includes('T') ? todo.dueAt : `${todo.dueAt}T23:59:59`)
  return Number.isFinite(ddl) && ddl < now.getTime()
}

export const projectPersonalTodoSummary = (project: TaskProject, currentUser: string, now = new Date()) => {
  const todos = project.todos.filter((todo) => todo.owner === currentUser && todo.status !== 'cancelled')
  return {
    open: todos.filter((todo) => todo.status === 'open').length,
    overdue: todos.filter((todo) => isOverdueTodo(todo, now)).length,
    completed: todos.filter((todo) => todo.status === 'completed').length,
  }
}

export const isProjectRelevant = (project: TaskProject, currentUser: string): boolean => project.owner === currentUser || project.participants.includes(currentUser)

const newestTodoAt = (project: TaskProject): number => project.todos.length ? Math.max(...project.todos.map((todo) => Date.parse(todo.generatedAt))) : Date.parse(project.startedAt)

export const selectTaskProjects = (snapshot: TasksSnapshot, currentUser: string): TaskProject[] => snapshot.projects
  .filter((project) => isProjectRelevant(project, currentUser))
  .sort((left, right) => newestTodoAt(right) - newestTodoAt(left))

const hasOverdueOpenTodo = (project: TaskProject, now: Date) => project.todos.some((todo) => isOverdueTodo(todo, now))

const hasBlocker = (project: TaskProject) => project.blocker.trim() !== '' && project.blocker !== '暂无。'

export const projectDisplayStatus = (project: TaskProject, now = new Date()): ProjectStatus => {
  if (project.status === 'completed' || project.status === 'not-started') return project.status
  return hasOverdueOpenTodo(project, now) ? 'overdue' : 'in-progress'
}

export const getTasksSummary = (projects: readonly TaskProject[], currentUser: string, now = new Date()): TasksSummary => {
  const attentionProjects = projects.map((project) => ({ overdue: hasOverdueOpenTodo(project, now), blocked: hasBlocker(project) }))
  const overdueProjects = attentionProjects.filter((project) => project.overdue).length
  const blockedProjects = attentionProjects.filter((project) => project.blocked && !project.overdue).length
  return {
    projects: projects.length,
    owned: projects.filter((project) => project.owner === currentUser).length,
    myOpenTodos: projects.flatMap((project) => project.todos).filter((todo) => todo.owner === currentUser && todo.status === 'open').length,
    attention: attentionProjects.filter((project) => project.overdue || project.blocked).length,
    overdueProjects,
    blockedProjects,
  }
}

export const updateTodoStatus = (snapshot: TasksSnapshot, todoId: string, status: Extract<TodoStatus, 'completed' | 'cancelled'>, now = new Date()): TasksSnapshot => ({
  ...snapshot,
  projects: snapshot.projects.map((project) => {
    const todo = project.todos.find((item) => item.id === todoId)
    if (!todo || todo.status !== 'open') return project
    const at = now.toISOString()
    const title = status === 'completed' ? `已完成「${todo.title}」。` : `已取消「${todo.title}」。`
    return {
      ...project,
      todos: project.todos.map((item) => item.id === todoId ? { ...item, status, completedAt: status === 'completed' ? at : undefined, cancelledAt: status === 'cancelled' ? at : undefined } : item),
      progress: status === 'completed' ? `已完成「${todo.title}」，请继续处理剩余待办。` : `已取消「${todo.title}」，请确认剩余待办的处理安排。`,
      recentChange: { summary: title, at, source: source(`todo-${todoId}`, 'todo', todo.title, at, title) },
    }
  }),
})

export const updateAiProduct = (snapshot: TasksSnapshot, todoId: string, update: Pick<TaskAiProduct, 'title' | 'content' | 'feedback'>, now = new Date()): TasksSnapshot => ({
  ...snapshot,
  projects: snapshot.projects.map((project) => ({
    ...project,
    todos: project.todos.map((todo) => todo.id === todoId && todo.aiProduct
      ? { ...todo, aiProduct: { ...todo.aiProduct, ...update, preview: update.content.slice(0, 80), updatedAt: now.toISOString() } }
      : todo),
  })),
})

export const updateProjectDocument = (snapshot: TasksSnapshot, projectId: string, update: Pick<TaskDocument, 'title' | 'content'>, now = new Date()): TasksSnapshot => ({
  ...snapshot,
  projects: snapshot.projects.map((project) => project.id === projectId
    ? { ...project, detailDocument: { ...project.detailDocument, ...update, updatedAt: now.toISOString() } }
    : project),
})
