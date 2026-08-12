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

const englishTaskText = (currentUser: string): Record<string, string> => ({
  '客户交付准备': 'Client delivery preparation', '客户交付': 'Client delivery', '林妙': 'Mia Lin', '周航': 'Evan Zhou', '王琳': 'Lina Wang', '产品': 'Product', '内部运营': 'Internal operations',
  '客户交付准备：项目详情': 'Client delivery preparation: Project details',
  [['项目基本信息', '开始时间：7 月 28 日', `负责人：${currentUser}`, '参与人：林妙、周航', '优先级：P0', '项目目标\n在本月完成客户环境部署、验收范围确认与交付材料准备。', '背景说明\n客户将在本月启动试用，交付范围需要在联调前明确。', '当前进展\n已完成部署材料初稿，正等待客户确认验收范围。', '阻塞项\n客户尚未确认最终验收人员与测试环境权限。', `下一步\n${currentUser} 在周一与客户确认验收范围和联调窗口。`, '最新动态\n客户补充了验收范围，项目先聚焦现场演示和联调准备。'].join('\n\n')]: ['Project basics', 'Started: July 28', `Owner: ${currentUser}`, 'Participants: Mia Lin, Evan Zhou', 'Priority: P0', 'Project goal\nComplete the client environment setup, acceptance scope, and delivery materials this month.', 'Background\nThe client starts its trial this month, so the delivery scope must be clear before integration testing.', 'Current progress\nThe first draft of deployment materials is complete; we are waiting for the client to confirm the acceptance scope.', 'Blocker\nThe client has not confirmed final acceptance owners or test-environment access.', `Next step\n${currentUser} will confirm the acceptance scope and integration window with the client on Monday.`, 'Latest update\nThe client added to the acceptance scope; the project now focuses on the on-site demo and integration preparation.'].join('\n\n'),
  '在本月完成客户环境部署、验收范围确认与交付材料准备。': 'Complete the client environment setup, acceptance scope, and delivery materials this month.',
  '客户将在本月启动试用，交付范围需要在联调前明确。': 'The client starts its trial this month, so the delivery scope must be clear before integration testing.',
  '已完成部署材料初稿，正等待客户确认验收范围。': 'The first draft of deployment materials is complete; we are waiting for the client to confirm the acceptance scope.',
  '客户尚未确认最终验收人员与测试环境权限。': 'The client has not confirmed final acceptance owners or test-environment access.',
  [`${currentUser} 在周一与客户确认验收范围和联调窗口。`]: `${currentUser} will confirm the acceptance scope and integration window with the client on Monday.`,
  '客户补充了验收范围，项目先聚焦现场演示和联调准备。': 'The client added to the acceptance scope; the project now focuses on the on-site demo and integration preparation.',
  '客户交付群': 'Client delivery group', '客户确认先完成现场演示；验收人员和测试权限将在周一例会上明确。': 'The client confirmed that the on-site demo comes first; acceptance owners and test access will be confirmed in Monday’s sync.',
  '确认客户验收范围': 'Confirm client acceptance scope', '与客户确认验收范围、验收人员和测试环境权限；以会议纪要中的范围说明作为验收依据。': 'Confirm the acceptance scope, acceptance owners, and test-environment access with the client; use the meeting notes as the acceptance reference.',
  '客户验收清单': 'Client acceptance checklist', '按环境、权限、功能与交付材料四个维度整理的验收确认项。': 'Acceptance checks organized by environment, access, features, and delivery materials.',
  '客户验收清单\n\n1. 确认客户环境、账号与测试权限已经准备就绪。\n2. 对齐核心流程的验收范围与验收负责人。\n3. 确认交付材料、演示记录与问题反馈入口。\n4. 在验收结束后记录结果与后续联调安排。': 'Client acceptance checklist\n\n1. Confirm that the client environment, accounts, and test access are ready.\n2. Align on the acceptance scope and owners for core workflows.\n3. Confirm delivery materials, demo records, and the issue-feedback channel.\n4. Record results and the next integration steps after acceptance.',
  '整理现场演示材料': 'Prepare on-site demo materials', '汇总现场演示的流程、环境说明和关键问题处理口径。': 'Consolidate the demo flow, environment guidance, and responses to key issues.',
  '现场演示脚本': 'On-site demo script', '覆盖开场、核心流程、问题处理与下一步确认的演示脚本。': 'A demo script covering the opening, core flow, issue handling, and next-step confirmation.',
  '现场演示脚本\n\n开场说明客户当前目标与验收范围。\n演示核心流程与环境准备情况。\n收集问题，并确认后续联调时间。': 'On-site demo script\n\nOpen by clarifying the client’s goals and acceptance scope.\nDemonstrate the core flow and environment readiness.\nCollect questions and confirm the follow-up integration time.',
  '核对测试环境权限': 'Verify test-environment access', '该事项已由客户在验收范围确认中合并处理，取消独立跟进。': 'This item was combined into the client acceptance-scope confirmation and no longer needs separate follow-up.',
  '补充客户部署说明': 'Complete client deployment guidance', '补足部署前置条件、权限申请方式和常见问题处理步骤。': 'Add deployment prerequisites, access-request steps, and common issue handling.',
  '客户部署说明摘要': 'Client deployment guidance summary', '用于客户确认部署前置条件的单页说明。': 'A one-page guide for confirming deployment prerequisites with the client.',
  '客户部署说明\n\n请先确认环境与账号权限。\n按交付材料中的步骤完成部署。\n如遇异常，记录现象并反馈给项目负责人。': 'Client deployment guidance\n\nFirst confirm environment and account access.\nComplete deployment using the delivery materials.\nIf an issue occurs, record it and notify the project owner.',
  '完成部署材料初稿': 'Complete first draft of deployment materials', '完成现场演示所需流程和材料的第一版。': 'Complete the first version of the process and materials required for the on-site demo.',
  '确认验收范围': 'Confirm acceptance scope', '明确验收范围、验收人员和测试环境权限。': 'Clarify the acceptance scope, acceptance owners, and test-environment access.',
  '联调与交付准备': 'Integration testing and delivery preparation', '完成部署说明与联调材料，进入客户交付准备。': 'Complete deployment guidance and integration materials, then move into delivery preparation.',
  '8 月客户联调会': 'August client integration sync', '会后确认：本周先完成现场演示，客户根据演示结果决定是否进入试用。': 'Confirmed after the meeting: complete the on-site demo this week, then the client will decide whether to begin the trial.', '会议听记': 'Meeting notes',
  '客户验收范围说明': 'Client acceptance scope', '客户确认验收范围将覆盖环境、权限、核心流程与交付材料。': 'The client confirmed that acceptance covers environment, access, core workflows, and delivery materials.', '文档 · 3 页': 'Document · 3 pages',
  '现场演示方案': 'On-site demo plan', '演示方案已覆盖客户环境、关键流程和常见问题处理。': 'The demo plan covers the client environment, key workflows, and common issue handling.', 'PPT · 12 页': 'Presentation · 12 slides',
  '客户回访录音': 'Client follow-up recording', '客户希望在正式试用前先完成一次现场演示。': 'The client wants to complete an on-site demo before the formal trial.', '音频 · 18 分钟': 'Audio · 18 minutes',
  '客户交付材料': 'Client delivery materials', '包含部署说明、演示材料和验收模板。': 'Includes deployment guidance, demo materials, and acceptance templates.', '文件夹 · 6 个文件': 'Folder · 6 files',
  '先完成现场演示，再根据结果推进试用。': 'Complete the on-site demo first, then proceed with the trial based on the results.', '客户确认现场演示优先，试用节奏将在演示结束后确认。': 'The client confirmed that the on-site demo comes first; the trial timeline will be confirmed afterward.',
  '8 月版本发布': 'August release', '8 月版本发布：项目详情': 'August release: Project details',
  [['项目基本信息', '开始时间：7 月 30 日', '负责人：林妙', `参与人：${currentUser}、周航`, '优先级：P0', '项目目标\n完成本月版本范围确认、灰度发布与发布后复盘。', '背景说明\n本次发布涉及新客户试用入口，需要先确认灰度用户范围。', '当前进展\n发布内容已完成评审，灰度名单尚未确认。', '阻塞项\n运营侧尚未给出最终灰度用户名单。', `下一步\n${currentUser} 今天向运营确认灰度名单。`, '最新动态\n灰度名单确认逾期，发布窗口需要等待运营回复。'].join('\n\n')]: ['Project basics', 'Started: July 30', 'Owner: Mia Lin', `Participants: ${currentUser}, Evan Zhou`, 'Priority: P0', 'Project goal\nConfirm this month’s release scope, run the gradual rollout, and review the release afterward.', 'Background\nThis release includes the new-client trial entry, so the rollout audience must be confirmed first.', 'Current progress\nRelease content has been reviewed, but the rollout list is still unconfirmed.', 'Blocker\nOperations has not provided the final rollout audience.', `Next step\n${currentUser} will confirm the rollout list with Operations today.`, 'Latest update\nThe rollout-list confirmation is overdue, so the release window must wait for Operations.'].join('\n\n'),
  '完成本月版本范围确认、灰度发布与发布后复盘。': 'Confirm this month’s release scope, run the gradual rollout, and review the release afterward.', '本次发布涉及新客户试用入口，需要先确认灰度用户范围。': 'This release includes the new-client trial entry, so the rollout audience must be confirmed first.', '发布内容已完成评审，灰度名单尚未确认。': 'Release content has been reviewed, but the rollout list is still unconfirmed.', '运营侧尚未给出最终灰度用户名单。': 'Operations has not provided the final rollout audience.', [`${currentUser} 今天向运营确认灰度名单。`]: `${currentUser} will confirm the rollout list with Operations today.`, '灰度名单确认逾期，发布窗口需要等待运营回复。': 'The rollout-list confirmation is overdue, so the release window must wait for Operations.',
  '8 月发布评审': 'August release review', '发布评审确认：没有灰度名单前，不进入第一批发布。': 'The release review confirmed that the first rollout cannot start before the audience list is ready.',
  '确认灰度用户名单': 'Confirm rollout audience', '确认第一批灰度用户范围，并同步给产品、运营和交付负责人。': 'Confirm the first rollout audience and share it with Product, Operations, and Delivery owners.',
  '运营确认消息草稿': 'Operations follow-up message draft', '用于确认名单、责任人和最晚回复时间的跟进消息草稿。': 'A follow-up message for confirming the audience, owner, and final response time.', '请协助确认第一批灰度用户名单、对应负责人和最晚回复时间。\n\n名单确认后，我们将据此更新发布窗口与沟通安排。': 'Please confirm the first rollout audience, its owner, and the latest response time.\n\nOnce confirmed, we will update the release window and communication plan.',
  '更新发布排期': 'Update release schedule', '根据灰度名单确认时间更新发布窗口、回滚窗口与对外沟通节奏。': 'Update the release window, rollback window, and external communication schedule based on when the audience is confirmed.',
  '确认版本范围': 'Confirm release scope', '完成发布内容与风险的评审。': 'Complete the review of release content and risks.', '确认灰度范围': 'Confirm rollout scope', '明确第一批用户与发布窗口。': 'Clarify the first audience and release window.', '完成发布复盘': 'Complete release retrospective', '发布后回看结果并沉淀改进项。': 'Review results after release and capture improvements.',
  '没有灰度名单前，不进入第一批发布。': 'Do not start the first rollout before the audience list is ready.', '第一批灰度范围必须由运营确认后再发布。': 'Operations must confirm the first rollout audience before release.', '发布协同群': 'Release coordination group', '运营表示名单仍在核对，建议本次评审暂不锁定第一批灰度范围。': 'Operations said the list is still being checked and recommended not locking the first rollout audience in this review.',
  '7 月复盘': 'July retrospective', '7 月复盘：项目详情': 'July retrospective: Project details',
  [['项目基本信息', '开始时间：7 月 20 日', `负责人：${currentUser}`, '参与人：王琳', '优先级：P2', '项目目标\n沉淀 7 月项目复盘与下月改进项。', '背景说明\n复盘汇总了本月交付、协作和客户反馈。', '当前进展\n复盘结论已同步，后续改进项已移入 8 月计划。', '阻塞项\n暂无。', '下一步\n已完成。', '最新动态\n复盘结论已同步到周报，项目完成。'].join('\n\n')]: ['Project basics', 'Started: July 20', `Owner: ${currentUser}`, 'Participants: Lina Wang', 'Priority: P2', 'Project goal\nCapture the July retrospective and next month’s improvements.', 'Background\nThe retrospective summarizes this month’s delivery, collaboration, and client feedback.', 'Current progress\nThe conclusions have been shared and follow-ups moved into the August plan.', 'Blocker\nNone.', 'Next step\nComplete.', 'Latest update\nThe retrospective conclusions are in the weekly update; the project is complete.'].join('\n\n'),
  '沉淀 7 月项目复盘与下月改进项。': 'Capture the July retrospective and next month’s improvements.', '复盘汇总了本月交付、协作和客户反馈。': 'The retrospective summarizes this month’s delivery, collaboration, and client feedback.', '复盘结论已同步，后续改进项已移入 8 月计划。': 'The conclusions have been shared and follow-ups moved into the August plan.', '暂无。': 'None.', '已完成。': 'Complete.', '复盘结论已同步到周报，项目完成。': 'The retrospective conclusions are in the weekly update; the project is complete.',
  '7 月复盘会': 'July retrospective meeting', '会议确认复盘结论与 8 月改进方向，由各项目负责人带入月度计划。': 'The meeting confirmed the retrospective conclusions and August improvements for each project owner to carry into monthly planning.',
  '整理复盘结论': 'Prepare retrospective conclusions', '汇总交付、协作和客户反馈中的改进项，并同步到月度计划。': 'Summarize improvements from delivery, collaboration, and client feedback, then share them in the monthly plan.',
  '7 月复盘摘要': 'July retrospective summary', '可复用到周报的复盘摘要。': 'A retrospective summary that can be reused in the weekly update.', '7 月复盘摘要\n\n本月完成了客户交付、协作与反馈的复盘。\n下月优先明确验收范围、责任人与联调节奏。': 'July retrospective summary\n\nThis month we reviewed client delivery, collaboration, and feedback.\nNext month, prioritize clear acceptance scope, owners, and integration cadence.',
  '收集复盘材料': 'Collect retrospective material', '汇总交付、协作与客户反馈。': 'Collect delivery, collaboration, and client feedback.', '同步复盘结果': 'Share retrospective results', '将结论与改进项同步到周报和月度计划。': 'Share conclusions and improvements in the weekly update and monthly plan.', '跟进改进项': 'Follow up on improvements', '由各项目负责人带入 8 月计划。': 'Each project owner carries these into the August plan.',
  '客户交付需要在联调前确认验收范围与负责人。': 'Client delivery requires a confirmed acceptance scope and owner before integration testing.', '交付复盘结论：联调启动前需要明确验收范围、验收人员与环境权限。': 'Delivery retrospective conclusion: clarify the acceptance scope, acceptance owners, and environment access before integration testing starts.',
  '客户知识库整理': 'Customer knowledge base', '客户知识库整理：项目详情': 'Customer knowledge base: Project details',
  [['项目基本信息', '开始时间：7 月 18 日', '负责人：王琳', `参与人：${currentUser}`, '优先级：P1', '项目目标\n整理客户常见问题与交付材料，作为后续试用支持的基础。', '背景说明\n客户支持信息仍分散在多个群和会议材料中。', '当前进展\n项目已记录，待确认第一批整理范围。', '阻塞项\n暂无。', '下一步\n待明确下一步。', '最新动态\n项目已建立，等待确认首批需要整理的客户问题。'].join('\n\n')]: ['Project basics', 'Started: July 18', 'Owner: Lina Wang', `Participants: ${currentUser}`, 'Priority: P1', 'Project goal\nOrganize frequent client questions and delivery materials as a foundation for future trial support.', 'Background\nClient-support information is still scattered across groups and meeting materials.', 'Current progress\nThe project is recorded and waiting for the first organization scope to be confirmed.', 'Blocker\nNone.', 'Next step\nTo be defined.', 'Latest update\nThe project is set up and waiting to confirm the first client questions to organize.'].join('\n\n'),
  '整理客户常见问题与交付材料，作为后续试用支持的基础。': 'Organize frequent client questions and delivery materials as a foundation for future trial support.', '客户支持信息仍分散在多个群和会议材料中。': 'Client-support information is still scattered across groups and meeting materials.', '项目已记录，待确认第一批整理范围。': 'The project is recorded and waiting for the first organization scope to be confirmed.', '待明确下一步。': 'To be defined.', '项目已建立，等待确认首批需要整理的客户问题。': 'The project is set up and waiting to confirm the first client questions to organize.',
  '客户支持群': 'Client support group', '支持团队建议先整理高频部署、权限和验收问题，范围待下次例会确认。': 'The support team recommends organizing frequent deployment, access, and acceptance questions first; confirm the scope in the next sync.',
  '确认首批整理范围': 'Confirm first organization scope', '确认部署、权限和验收问题的首批范围。': 'Confirm the first scope for deployment, access, and acceptance questions.', '整理知识条目': 'Organize knowledge entries', '按高频问题归档并补充说明。': 'File frequent questions and add guidance.', '评审并发布资料': 'Review and publish materials', '与客户支持团队确认资料可用性。': 'Confirm material usability with the client-support team.',
  '客户支持资料': 'Client support material', '包含当前客户支持群中的部署、权限和验收问题记录。': 'Contains deployment, access, and acceptance questions from the current client-support group.', '文件夹 · 9 个文件': 'Folder · 9 files',
  '首批资料聚焦部署、权限和验收问题。': 'The first materials focus on deployment, access, and acceptance questions.', '支持团队建议先整理高频部署、权限和验收问题，其他主题后续补充。': 'The support team recommends organizing frequent deployment, access, and acceptance questions first; add other topics later.',
})

export const localizedTasksSnapshot = (snapshot: TasksSnapshot, locale: 'en' | 'zh'): TasksSnapshot => {
  if (locale === 'zh') return snapshot
  const text = englishTaskText(snapshot.projects.find((project) => project.id === 'client-delivery')?.owner ?? '')
  const localize = (value: string) => text[value] ?? value
  const localizeSource = (item: TaskSource): TaskSource => ({ ...item, name: localize(item.name), excerpt: localize(item.excerpt), metadata: item.metadata ? localize(item.metadata) : undefined })

  return {
    ...snapshot,
    projects: snapshot.projects.map((project) => {
      const todos = project.todos.map((todo) => ({
        ...todo,
        title: localize(todo.title),
        owner: localize(todo.owner),
        detail: localize(todo.detail),
        aiProduct: todo.aiProduct && { ...todo.aiProduct, title: localize(todo.aiProduct.title), preview: localize(todo.aiProduct.preview), content: localize(todo.aiProduct.content), feedback: todo.aiProduct.feedback.map(localize) },
      }))
      const changedTodo = project.todos.find((todo) => project.recentChange.source.id === `todo-${todo.id}`)
      const action = changedTodo ? `${changedTodo.status === 'completed' ? 'Completed' : 'Cancelled'} “${localize(changedTodo.title)}.”` : null
      return {
        ...project,
        name: localize(project.name),
        category: localize(project.category),
        owner: localize(project.owner),
        participants: project.participants.map(localize),
        detailDocument: { ...project.detailDocument, title: localize(project.detailDocument.title), content: localize(project.detailDocument.content) },
        goal: localize(project.goal), background: localize(project.background), progress: action ? `${action} ${changedTodo?.status === 'completed' ? 'Continue with the remaining action items.' : 'Confirm the plan for the remaining action items.'}` : localize(project.progress), blocker: localize(project.blocker), nextStep: localize(project.nextStep),
        recentChange: { ...project.recentChange, summary: action ?? localize(project.recentChange.summary), source: { ...localizeSource(project.recentChange.source), name: changedTodo ? localize(changedTodo.title) : localize(project.recentChange.source.name), excerpt: action ?? localize(project.recentChange.source.excerpt) } },
        todos,
        milestones: project.milestones.map((milestone) => ({ ...milestone, title: localize(milestone.title), summary: localize(milestone.summary) })),
        sources: project.sources.map(localizeSource),
        conclusions: project.conclusions.map((conclusion) => ({ ...conclusion, summary: localize(conclusion.summary), sources: conclusion.sources.map(localizeSource) })),
      }
    }),
  }
}

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

const hasBlocker = (project: TaskProject) => project.blocker.trim() !== '' && project.blocker !== '暂无。' && project.blocker !== 'None.'

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
