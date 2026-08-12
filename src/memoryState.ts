import { radialMemoryPositions } from './memoryCanvasState.ts'

export const memoryLayers = ['context', 'user'] as const
export const memorySources = ['all', 'dingtalk', 'feishu', 'teams', 'file', 'conversation'] as const

export type MemoryLayer = typeof memoryLayers[number]
export type MemorySource = typeof memorySources[number]
export type MemoryNodeSource = Exclude<MemorySource, 'all'>
export type MaterialKind = 'file' | 'migration'
export type MaterialStatus = 'processing' | 'completed' | 'failed'
export type MemoryPosition = { x: number; y: number }

export type MemoryNode = {
  id: string
  layer: MemoryLayer
  source: string
  title: string
  summary: string
  position: MemoryPosition
  visual?: { color?: string }
}

export type MemoryEdge = { from: string; to: string }
export type MemoryGraphData = { nodes: MemoryNode[]; edges: MemoryEdge[] }
export type MemoryQuery = { layer: MemoryLayer; source: MemorySource; keyword: string }
export type MaterialTask = {
  kind: MaterialKind
  fileName: string
  status: MaterialStatus
  outcome: Exclude<MaterialStatus, 'processing'>
}

const initialMemoryGraphData: MemoryGraphData = {
  nodes: [
    { id: 'context-release-rhythm', layer: 'context', source: 'dingtalk', title: '本周产品节奏', summary: '需要推进发布准备与关键判断。', position: { x: 800, y: 100 }, visual: { color: '#82957d' } },
    { id: 'context-release-scope', layer: 'context', source: 'feishu', title: '发布范围', summary: '本次版本确认交付的功能边界。', position: { x: 844, y: 103 }, visual: { color: '#839eb3' } },
    { id: 'context-release-readiness', layer: 'context', source: 'teams', title: '上线准备', summary: '待完成的联调、验收与发布检查。', position: { x: 887, y: 111 }, visual: { color: '#9990a8' } },
    { id: 'context-release-quality', layer: 'context', source: 'file', title: '质量门槛', summary: '本次发布必须满足的体验标准。', position: { x: 929, y: 125 }, visual: { color: '#b59663' } },
    { id: 'context-release-communication', layer: 'context', source: 'conversation', title: '发布沟通', summary: '面向团队和用户的通知安排。', position: { x: 969, y: 143 }, visual: { color: '#bc8d86' } },
    { id: 'context-release-rollout', layer: 'context', source: 'dingtalk', title: '灰度计划', summary: '按人群与节奏逐步开放新版本。', position: { x: 1006, y: 167 }, visual: { color: '#82957d' } },
    { id: 'context-release-risk', layer: 'context', source: 'feishu', title: '发布风险', summary: '需要提前规避的依赖与不确定性。', position: { x: 1040, y: 195 }, visual: { color: '#839eb3' } },
    { id: 'context-release-support', layer: 'context', source: 'teams', title: '用户支持', summary: '上线后问题响应与反馈收集方案。', position: { x: 1070, y: 227 }, visual: { color: '#9990a8' } },
    { id: 'context-release-retrospective', layer: 'context', source: 'file', title: '复盘要点', summary: '版本结束后需要沉淀的经验。', position: { x: 1096, y: 262 }, visual: { color: '#b59663' } },
    { id: 'context-release-metrics', layer: 'context', source: 'conversation', title: '效果指标', summary: '衡量发布是否达到预期的信号。', position: { x: 1117, y: 301 }, visual: { color: '#bc8d86' } },

    { id: 'context-research-summary', layer: 'context', source: 'file', title: '用户研究摘要', summary: '访谈结论与待验证的问题。', position: { x: 1133, y: 342 }, visual: { color: '#b59663' } },
    { id: 'context-research-interviews', layer: 'context', source: 'dingtalk', title: '访谈记录', summary: '目标用户对现有流程的真实反馈。', position: { x: 1144, y: 384 }, visual: { color: '#82957d' } },
    { id: 'context-research-scenarios', layer: 'context', source: 'feishu', title: '核心场景', summary: '用户最常发生且价值最高的任务。', position: { x: 1149, y: 428 }, visual: { color: '#839eb3' } },
    { id: 'context-research-frictions', layer: 'context', source: 'teams', title: '使用阻碍', summary: '当前体验中造成中断的关键问题。', position: { x: 1149, y: 472 }, visual: { color: '#9990a8' } },
    { id: 'context-research-value', layer: 'context', source: 'conversation', title: '价值主张', summary: '用户愿意持续使用的核心原因。', position: { x: 1144, y: 516 }, visual: { color: '#bc8d86' } },
    { id: 'context-research-hypotheses', layer: 'context', source: 'file', title: '待验证假设', summary: '下一轮研究需要确认的产品判断。', position: { x: 1133, y: 558 }, visual: { color: '#b59663' } },
    { id: 'context-research-feedback', layer: 'context', source: 'dingtalk', title: '反馈主题', summary: '用户反复提到的需求和疑问。', position: { x: 1117, y: 599 }, visual: { color: '#82957d' } },
    { id: 'context-research-segments', layer: 'context', source: 'feishu', title: '目标人群', summary: '不同用户群的使用差异和优先级。', position: { x: 1096, y: 638 }, visual: { color: '#839eb3' } },
    { id: 'context-research-priorities', layer: 'context', source: 'teams', title: '需求优先级', summary: '依据价值、频次和成本形成的排序。', position: { x: 1070, y: 673 }, visual: { color: '#9990a8' } },
    { id: 'context-research-evidence', layer: 'context', source: 'conversation', title: '验证证据', summary: '支持关键判断的访谈与行为线索。', position: { x: 1040, y: 705 }, visual: { color: '#bc8d86' } },

    { id: 'context-collaboration-roles', layer: 'context', source: 'teams', title: '协作分工', summary: '团队当前的职责与配合方式。', position: { x: 1006, y: 733 }, visual: { color: '#9990a8' } },
    { id: 'context-collaboration-review', layer: 'context', source: 'file', title: '评审记录', summary: '跨团队评审中的明确结论。', position: { x: 969, y: 757 }, visual: { color: '#b59663' } },
    { id: 'context-collaboration-sync', layer: 'context', source: 'conversation', title: '同步节奏', summary: '各角色对齐进展和风险的频率。', position: { x: 929, y: 775 }, visual: { color: '#bc8d86' } },
    { id: 'context-collaboration-decisions', layer: 'context', source: 'dingtalk', title: '协作决策', summary: '团队已经确认的取舍和行动。', position: { x: 887, y: 789 }, visual: { color: '#82957d' } },
    { id: 'context-collaboration-dependencies', layer: 'context', source: 'feishu', title: '外部依赖', summary: '影响当前推进节奏的协作事项。', position: { x: 844, y: 797 }, visual: { color: '#839eb3' } },
    { id: 'context-collaboration-owners', layer: 'context', source: 'teams', title: '责任归属', summary: '每个关键事项的明确负责人。', position: { x: 800, y: 800 }, visual: { color: '#9990a8' } },
    { id: 'context-collaboration-handoff', layer: 'context', source: 'file', title: '交接事项', summary: '阶段之间需要完整传递的信息。', position: { x: 756, y: 797 }, visual: { color: '#b59663' } },
    { id: 'context-collaboration-status', layer: 'context', source: 'conversation', title: '协作状态', summary: '当前团队配合的推进情况。', position: { x: 713, y: 789 }, visual: { color: '#bc8d86' } },
    { id: 'context-collaboration-alignment', layer: 'context', source: 'dingtalk', title: '共识边界', summary: '已对齐和仍需讨论的范围。', position: { x: 671, y: 775 }, visual: { color: '#82957d' } },
    { id: 'context-collaboration-followup', layer: 'context', source: 'feishu', title: '后续跟进', summary: '协作会后形成的下一步安排。', position: { x: 631, y: 757 }, visual: { color: '#839eb3' } },

    { id: 'context-planning-roadmap', layer: 'context', source: 'feishu', title: '产品路线图', summary: '已确认的阶段目标与优先级。', position: { x: 594, y: 733 }, visual: { color: '#839eb3' } },
    { id: 'context-planning-quarter', layer: 'context', source: 'teams', title: '季度规划', summary: '正在讨论的工作重点。', position: { x: 560, y: 705 }, visual: { color: '#9990a8' } },
    { id: 'context-planning-objectives', layer: 'context', source: 'file', title: '阶段目标', summary: '本阶段需要兑现的用户与业务结果。', position: { x: 530, y: 673 }, visual: { color: '#b59663' } },
    { id: 'context-planning-milestones', layer: 'context', source: 'conversation', title: '关键里程碑', summary: '验证进展的重要时间节点。', position: { x: 504, y: 638 }, visual: { color: '#bc8d86' } },
    { id: 'context-planning-priorities', layer: 'context', source: 'dingtalk', title: '工作优先级', summary: '当前资源投入的先后顺序。', position: { x: 483, y: 599 }, visual: { color: '#82957d' } },
    { id: 'context-planning-tradeoffs', layer: 'context', source: 'feishu', title: '取舍原则', summary: '范围、质量和节奏之间的判断依据。', position: { x: 467, y: 558 }, visual: { color: '#839eb3' } },
    { id: 'context-planning-resourcing', layer: 'context', source: 'teams', title: '资源安排', summary: '支撑阶段目标的人力与协作投入。', position: { x: 456, y: 516 }, visual: { color: '#9990a8' } },
    { id: 'context-planning-progress', layer: 'context', source: 'file', title: '推进进度', summary: '当前计划与实际完成情况的对照。', position: { x: 451, y: 472 }, visual: { color: '#b59663' } },
    { id: 'context-planning-decisions', layer: 'context', source: 'conversation', title: '规划决策', summary: '规划过程已经确认的关键选择。', position: { x: 451, y: 428 }, visual: { color: '#bc8d86' } },
    { id: 'context-planning-next', layer: 'context', source: 'dingtalk', title: '下一阶段', summary: '完成当前目标后需要衔接的重点。', position: { x: 456, y: 384 }, visual: { color: '#82957d' } },

    { id: 'context-materials-briefing', layer: 'context', source: 'file', title: '项目背景', summary: '工作资料中的项目上下文。', position: { x: 467, y: 342 }, visual: { color: '#b59663' } },
    { id: 'context-materials-docs', layer: 'context', source: 'conversation', title: '需求文档', summary: '当前版本需要达成的完整说明。', position: { x: 483, y: 301 }, visual: { color: '#bc8d86' } },
    { id: 'context-materials-requirements', layer: 'context', source: 'dingtalk', title: '需求清单', summary: '已经收敛、待进一步确认的需求项。', position: { x: 504, y: 262 }, visual: { color: '#82957d' } },
    { id: 'context-materials-designs', layer: 'context', source: 'feishu', title: '设计方案', summary: '体验方案与关键交互说明。', position: { x: 530, y: 227 }, visual: { color: '#839eb3' } },
    { id: 'context-materials-research', layer: 'context', source: 'teams', title: '研究资料', summary: '支撑用户判断的原始研究材料。', position: { x: 560, y: 195 }, visual: { color: '#9990a8' } },
    { id: 'context-materials-meeting', layer: 'context', source: 'file', title: '会议纪要', summary: '重要讨论的结论、分工和待办。', position: { x: 594, y: 167 }, visual: { color: '#b59663' } },
    { id: 'context-materials-specs', layer: 'context', source: 'conversation', title: '验收标准', summary: '判断交付是否达到要求的具体条件。', position: { x: 631, y: 143 }, visual: { color: '#bc8d86' } },
    { id: 'context-materials-log', layer: 'context', source: 'dingtalk', title: '变更记录', summary: '范围和决策发生变化的历史。', position: { x: 671, y: 125 }, visual: { color: '#82957d' } },
    { id: 'context-materials-library', layer: 'context', source: 'feishu', title: '资料索引', summary: '项目材料的分类与查找入口。', position: { x: 713, y: 111 }, visual: { color: '#839eb3' } },
    { id: 'context-materials-archive', layer: 'context', source: 'teams', title: '历史沉淀', summary: '可复用的项目经验与决策背景。', position: { x: 756, y: 103 }, visual: { color: '#9990a8' } },
    { id: 'user-direction', layer: 'user', source: 'dingtalk', title: '产品判断优先', summary: '优先确认用户价值与关键取舍。', position: { x: 478, y: 266 }, visual: { color: '#82957d' } },
    { id: 'user-collaboration', layer: 'user', source: 'feishu', title: '协作方式', summary: '偏好清晰的结论与下一步。', position: { x: 295, y: 164 }, visual: { color: '#839eb3' } },
    { id: 'user-context', layer: 'user', source: 'file', title: '工作背景', summary: '长期有效的项目与职责。', position: { x: 196, y: 375 }, visual: { color: '#b59663' } },
    { id: 'user-followup', layer: 'user', source: 'conversation', title: '跟进偏好', summary: '将讨论沉淀为可执行事项。', position: { x: 784, y: 395 }, visual: { color: '#bc8d86' } },
  ],
  edges: [
    { from: 'context-release-rhythm', to: 'context-release-scope' },
    { from: 'context-release-scope', to: 'context-release-readiness' },
    { from: 'context-release-readiness', to: 'context-release-quality' },
    { from: 'context-release-quality', to: 'context-release-communication' },
    { from: 'context-release-communication', to: 'context-release-rollout' },
    { from: 'context-release-rollout', to: 'context-release-risk' },
    { from: 'context-release-risk', to: 'context-release-support' },
    { from: 'context-release-support', to: 'context-release-retrospective' },
    { from: 'context-release-retrospective', to: 'context-release-metrics' },

    { from: 'context-research-summary', to: 'context-research-interviews' },
    { from: 'context-research-interviews', to: 'context-research-scenarios' },
    { from: 'context-research-scenarios', to: 'context-research-frictions' },
    { from: 'context-research-frictions', to: 'context-research-value' },
    { from: 'context-research-value', to: 'context-research-hypotheses' },
    { from: 'context-research-hypotheses', to: 'context-research-feedback' },
    { from: 'context-research-feedback', to: 'context-research-segments' },
    { from: 'context-research-segments', to: 'context-research-priorities' },
    { from: 'context-research-priorities', to: 'context-research-evidence' },

    { from: 'context-collaboration-roles', to: 'context-collaboration-review' },
    { from: 'context-collaboration-review', to: 'context-collaboration-sync' },
    { from: 'context-collaboration-sync', to: 'context-collaboration-decisions' },
    { from: 'context-collaboration-decisions', to: 'context-collaboration-dependencies' },
    { from: 'context-collaboration-dependencies', to: 'context-collaboration-owners' },
    { from: 'context-collaboration-owners', to: 'context-collaboration-handoff' },
    { from: 'context-collaboration-handoff', to: 'context-collaboration-status' },
    { from: 'context-collaboration-status', to: 'context-collaboration-alignment' },
    { from: 'context-collaboration-alignment', to: 'context-collaboration-followup' },

    { from: 'context-planning-roadmap', to: 'context-planning-quarter' },
    { from: 'context-planning-quarter', to: 'context-planning-objectives' },
    { from: 'context-planning-objectives', to: 'context-planning-milestones' },
    { from: 'context-planning-milestones', to: 'context-planning-priorities' },
    { from: 'context-planning-priorities', to: 'context-planning-tradeoffs' },
    { from: 'context-planning-tradeoffs', to: 'context-planning-resourcing' },
    { from: 'context-planning-resourcing', to: 'context-planning-progress' },
    { from: 'context-planning-progress', to: 'context-planning-decisions' },
    { from: 'context-planning-decisions', to: 'context-planning-next' },

    { from: 'context-materials-briefing', to: 'context-materials-docs' },
    { from: 'context-materials-docs', to: 'context-materials-requirements' },
    { from: 'context-materials-requirements', to: 'context-materials-designs' },
    { from: 'context-materials-designs', to: 'context-materials-research' },
    { from: 'context-materials-research', to: 'context-materials-meeting' },
    { from: 'context-materials-meeting', to: 'context-materials-specs' },
    { from: 'context-materials-specs', to: 'context-materials-log' },
    { from: 'context-materials-log', to: 'context-materials-library' },
    { from: 'context-materials-library', to: 'context-materials-archive' },

    { from: 'context-release-rhythm', to: 'context-planning-priorities' },
    { from: 'context-release-scope', to: 'context-materials-requirements' },
    { from: 'context-release-readiness', to: 'context-collaboration-status' },
    { from: 'context-research-summary', to: 'context-planning-objectives' },
    { from: 'context-research-hypotheses', to: 'context-materials-research' },
    { from: 'context-research-feedback', to: 'context-release-support' },
    { from: 'context-collaboration-roles', to: 'context-planning-resourcing' },
    { from: 'context-collaboration-decisions', to: 'context-release-quality' },
    { from: 'context-collaboration-dependencies', to: 'context-materials-designs' },
    { from: 'context-planning-roadmap', to: 'context-materials-briefing' },
    { from: 'context-planning-milestones', to: 'context-release-rollout' },
    { from: 'context-planning-tradeoffs', to: 'context-research-priorities' },
    { from: 'context-materials-docs', to: 'context-collaboration-handoff' },
    { from: 'context-materials-meeting', to: 'context-collaboration-followup' },
    { from: 'context-materials-specs', to: 'context-release-communication' },
    { from: 'user-direction', to: 'user-collaboration' },
    { from: 'user-collaboration', to: 'user-context' },
    { from: 'user-collaboration', to: 'user-followup' },
  ],
}

const contextInitialPositions = radialMemoryPositions(
  initialMemoryGraphData.nodes.filter((node) => node.layer === 'context'),
  initialMemoryGraphData.edges,
)

export const initialMemoryGraph: MemoryGraphData = {
  ...initialMemoryGraphData,
  nodes: initialMemoryGraphData.nodes.map((node) => contextInitialPositions[node.id]
    ? { ...node, position: contextInitialPositions[node.id] }
    : node),
}

const englishMemoryNodeCopy: Record<string, Pick<MemoryNode, 'title' | 'summary'>> = {
  'context-release-rhythm': { title: 'Weekly product cadence', summary: 'The release preparation and key judgments that need attention.' },
  'context-release-scope': { title: 'Release scope', summary: 'The feature boundaries confirmed for this version.' },
  'context-release-readiness': { title: 'Launch readiness', summary: 'Integration, acceptance, and release checks still to complete.' },
  'context-release-quality': { title: 'Quality bar', summary: 'The experience standard this release must meet.' },
  'context-release-communication': { title: 'Release communication', summary: 'The plan for notifying the team and users.' },
  'context-release-rollout': { title: 'Rollout plan', summary: 'A gradual release by audience and timing.' },
  'context-release-risk': { title: 'Release risks', summary: 'Dependencies and uncertainties to address early.' },
  'context-release-support': { title: 'User support', summary: 'How issues and feedback will be handled after launch.' },
  'context-release-retrospective': { title: 'Retrospective themes', summary: 'Lessons to capture after the release.' },
  'context-release-metrics': { title: 'Success metrics', summary: 'Signals that show whether the release met expectations.' },
  'context-research-summary': { title: 'Research summary', summary: 'Interview takeaways and questions still to validate.' },
  'context-research-interviews': { title: 'Interview notes', summary: 'Direct feedback from target users on the current flow.' },
  'context-research-scenarios': { title: 'Core scenarios', summary: 'The most frequent and valuable jobs for users.' },
  'context-research-frictions': { title: 'Experience frictions', summary: 'The issues currently interrupting users.' },
  'context-research-value': { title: 'Value proposition', summary: 'Why users choose to keep using the product.' },
  'context-research-hypotheses': { title: 'Open hypotheses', summary: 'Product judgments for the next research round.' },
  'context-research-feedback': { title: 'Feedback themes', summary: 'Needs and questions users repeat most often.' },
  'context-research-segments': { title: 'Target segments', summary: 'Usage differences and priorities across user groups.' },
  'context-research-priorities': { title: 'Need priorities', summary: 'The order based on value, frequency, and effort.' },
  'context-research-evidence': { title: 'Validation evidence', summary: 'Interview and behavior signals supporting key judgments.' },
  'context-collaboration-roles': { title: 'Team roles', summary: 'The team’s current responsibilities and collaboration model.' },
  'context-collaboration-review': { title: 'Review notes', summary: 'Explicit outcomes from cross-functional reviews.' },
  'context-collaboration-sync': { title: 'Sync cadence', summary: 'How often the team aligns on progress and risks.' },
  'context-collaboration-decisions': { title: 'Working decisions', summary: 'Trade-offs and actions the team has already confirmed.' },
  'context-collaboration-dependencies': { title: 'External dependencies', summary: 'Collaboration items affecting the current pace.' },
  'context-collaboration-owners': { title: 'Clear ownership', summary: 'The accountable owner for each key item.' },
  'context-collaboration-handoff': { title: 'Handoff items', summary: 'Information that must carry across project stages.' },
  'context-collaboration-status': { title: 'Collaboration status', summary: 'How the team is currently moving work forward.' },
  'context-collaboration-alignment': { title: 'Alignment boundaries', summary: 'What is agreed and what still needs discussion.' },
  'context-collaboration-followup': { title: 'Follow-up plan', summary: 'The next steps coming out of team collaboration.' },
  'context-planning-roadmap': { title: 'Product roadmap', summary: 'Confirmed stage goals and priorities.' },
  'context-planning-quarter': { title: 'Quarterly plan', summary: 'The work focus currently under discussion.' },
  'context-planning-objectives': { title: 'Stage objectives', summary: 'User and business outcomes to deliver in this stage.' },
  'context-planning-milestones': { title: 'Key milestones', summary: 'The moments used to verify progress.' },
  'context-planning-priorities': { title: 'Work priorities', summary: 'The order for current resource investment.' },
  'context-planning-tradeoffs': { title: 'Trade-off principles', summary: 'How scope, quality, and pace are balanced.' },
  'context-planning-resourcing': { title: 'Resourcing plan', summary: 'People and collaboration needed to support the objectives.' },
  'context-planning-progress': { title: 'Delivery progress', summary: 'How the current plan compares with actual completion.' },
  'context-planning-decisions': { title: 'Planning decisions', summary: 'The key choices already confirmed in planning.' },
  'context-planning-next': { title: 'Next stage', summary: 'The focus to carry forward after the current objective.' },
  'context-materials-briefing': { title: 'Project brief', summary: 'Project context from working materials.' },
  'context-materials-docs': { title: 'Requirements document', summary: 'The full description of what this release must achieve.' },
  'context-materials-requirements': { title: 'Requirements list', summary: 'Needs already narrowed down or still awaiting confirmation.' },
  'context-materials-designs': { title: 'Design direction', summary: 'Experience proposals and key interaction details.' },
  'context-materials-research': { title: 'Research material', summary: 'Raw research that supports user judgments.' },
  'context-materials-meeting': { title: 'Meeting notes', summary: 'Conclusions, ownership, and follow-ups from key discussions.' },
  'context-materials-specs': { title: 'Acceptance criteria', summary: 'The concrete conditions for judging delivery quality.' },
  'context-materials-log': { title: 'Change log', summary: 'A record of scope and decision changes.' },
  'context-materials-library': { title: 'Material index', summary: 'Where project material is organized and found.' },
  'context-materials-archive': { title: 'Project archive', summary: 'Reusable project lessons and decision context.' },
  'user-direction': { title: 'Product judgment first', summary: 'Prioritize user value and critical trade-offs.' },
  'user-collaboration': { title: 'Collaboration style', summary: 'A preference for clear conclusions and next steps.' },
  'user-context': { title: 'Work context', summary: 'Long-lived projects and responsibilities.' },
  'user-followup': { title: 'Follow-up preference', summary: 'Turn discussions into concrete actions.' },
}

const englishMaterialCopy: Record<MaterialKind, Pick<MemoryNode, 'title' | 'summary'>> = {
  file: { title: 'New work material', summary: 'Work material added by the user.' },
  migration: { title: 'Organized work conversation', summary: 'Work-related content migrated by the user.' },
}

export const localizedMemoryGraph = (graph: MemoryGraphData, locale: 'en' | 'zh'): MemoryGraphData => {
  if (locale === 'zh') return graph
  return {
    ...graph,
    nodes: graph.nodes.map((node) => {
      const materialKind = /^context-file-\d+$/.test(node.id) ? 'file' : /^context-conversation-\d+$/.test(node.id) ? 'migration' : null
      const copy = englishMemoryNodeCopy[node.id] ?? (materialKind ? englishMaterialCopy[materialKind] : null)
      return copy ? { ...node, ...copy } : node
    }),
  }
}

export const visibleMemoryGraph = (graph: MemoryGraphData, query: MemoryQuery): MemoryGraphData => {
  const keyword = query.keyword.trim().toLocaleLowerCase()
  const nodes = graph.nodes.filter((node) => node.layer === query.layer
    && (query.source === 'all' || node.source === query.source)
    && (!keyword || `${node.title} ${node.summary}`.toLocaleLowerCase().includes(keyword)))
  const visibleIds = new Set(nodes.map((node) => node.id))

  return {
    nodes,
    edges: graph.edges.filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to)),
  }
}

export const startMaterialTask = (kind: MaterialKind, fileName: string, size: number): MaterialTask => ({
  kind,
  fileName,
  status: 'processing',
  outcome: size === 0 ? 'failed' : 'completed',
})

export const finishMaterialTask = (task: MaterialTask): MaterialTask => ({ ...task, status: task.outcome })

const materialSource = (kind: MaterialKind): MemoryNodeSource => kind === 'file' ? 'file' : 'conversation'

const nextFixturePosition = (nodes: MemoryNode[]): MemoryPosition => {
  const last = nodes.at(-1)?.position ?? { x: 0, y: 0 }
  return { x: last.x + 72, y: last.y + 72 }
}

export const resolveMaterialTask = (graph: MemoryGraphData, task: MaterialTask): MemoryGraphData => {
  if (task.status !== 'completed') return graph

  const source = materialSource(task.kind)
  const id = `context-${source}-${graph.nodes.filter((node) => node.id.startsWith(`context-${source}-`)).length + 1}`
  const node: MemoryNode = {
    id,
    layer: 'context',
    source,
    title: task.kind === 'file' ? '新增工作资料' : '整理后的工作对话',
    summary: task.kind === 'file' ? '用户主动补充的工作资料。' : '由用户迁移的工作相关内容。',
    position: nextFixturePosition(graph.nodes),
    visual: { color: source === 'file' ? '#b59663' : '#bc8d86' },
  }

  return {
    nodes: [...graph.nodes, node],
    edges: [...graph.edges, { from: 'context-brief', to: id }],
  }
}
