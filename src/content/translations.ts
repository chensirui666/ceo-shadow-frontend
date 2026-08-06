import type { Locale, Route } from '../appState.ts'
import type { MemorySource } from '../memoryState.ts'
import type { ConnectorStatus, SettingsSection } from '../settingsState.ts'

type PageCopy = [string, string, string]

type SettingsCopy = {
  title: string
  close: string
  back: string
  saved: string
  nav: Record<SettingsSection, string>
  discard: { title: string; body: string; cancel: string; confirm: string }
  apps: {
    title: string
    subtitle: string
    demo: string
    status: Record<ConnectorStatus | 'connecting', string>
    action: { connect: (name: string) => string; reconnect: (name: string) => string; disconnect: (name: string) => string }
    detail: {
      verified: string
      uses: (name: string) => string
      usesItems: string[]
      workScope: string
      groupScope: string
      directScope: string
      dataScope: string
      dataScopeValue: string
      memory: string
      memoryValue: string
      mode: string
      modeValue: string
      manageOnHome: string
      disconnected: (name: string) => string
      reconnect: (name: string) => string
    }
    disconnect: { title: (name: string) => string; body: (name: string) => string; cancel: string; confirm: (name: string) => string }
  }
  general: {
    title: string
    subtitle: string
    group: { title: string; description: string; summary: (enabled: boolean) => string; direct: string; everyone: string; confirmation: { title: string; body: string; cancel: string; confirm: string } }
    rhythm: { title: string; description: string; summary: (minutes: number, quiet: string | null) => string; wait: string; waitOptions: (minutes: number) => string; quiet: string; quietStart: string; quietEnd: string; helper: string }
    notifications: { title: string; description: string; summary: (count: number) => string; handoff: string; handoffDescription: string; reconnect: string; reconnectDescription: string; sendFailed: string; sendFailedDescription: string }
    save: string
  }
  profile: {
    title: string
    subtitle: (name: string) => string
    description: string
    tags: string[]
    updated: string
    identity: string
    name: string
    aliases: string
    aliasPlaceholder: string
    addAlias: string
    removeAlias: (alias: string) => string
    judgment: string
    judgmentValue: string
    expression: string
    expressionValue: string
    boundaries: string
    boundariesValue: string
    memory: string
    feedback: string
    save: string
  }
  safety: { title: string; description: string; summary: string; items: string[]; handoff: string; always: string }
}

type MemoryCopy = {
  description: string
  layersLabel: string
  layers: Record<'context' | 'user', { label: string; description: string }>
  sources: Record<MemorySource, string>
  sourceLabel: string
  searchLabel: string
  searchPlaceholder: string
  add: string
  upload: string
  migration: string
  uploadModal: { title: string; description: string; choose: string; cancel: string; submit: string }
  migrationModal: { title: string; description: string; prompt: string; copy: string; next: string; back: string; choose: string; submit: string }
  status: { processing: string; completed: string; failed: string; retry: string }
  empty: { layer: string; source: string; search: string; clearSource: string; clearSearch: string }
  mapSummary: (layer: string, source: string, keyword: string, count: number) => string
}

export type Translation = {
  journey: string[]
  language: { switchToChinese: string }
  login: {
    email: Record<'eyebrow' | 'title' | 'subtitle' | 'demoLabel' | 'demo' | 'demoEnding' | 'label' | 'sending' | 'submit' | 'legalBefore' | 'terms' | 'legalBetween' | 'privacy', string>
    code: Record<'eyebrow' | 'title' | 'demoLabel' | 'demo' | 'demoEnding' | 'label' | 'verifying' | 'submit' | 'edit' | 'resend', string> & { subtitle: (email: string) => string; resendIn: (seconds: number) => string }
    errors: Record<'invalidEmail' | 'sendFailed' | 'invalidCode' | 'incompleteCode', string>
    authVisualLabel: string
  }
  workspace: {
    nav: Record<Route, string>
    primaryNavigation: string
    content: (label: string) => string
    greeting: (name: string) => string
    unavailableNotifications: string
    openAccountMenu: string
    accountMenu: string
    signOut: string
    home: Record<'badge' | 'title' | 'description' | 'action' | 'today' | 'empty', string>
    pages: Record<string, PageCopy>
    exit: Record<'title' | 'body' | 'cancel', string>
    memory: MemoryCopy
    settings: SettingsCopy
  }
}

export const translations: Record<Locale, Translation> = {
  en: {
    journey: ['Sign in', 'Build work memory', 'Confirm work style', 'Trial'],
    language: { switchToChinese: 'Switch to Chinese' },
    login: {
      email: {
        eyebrow: 'Welcome to Friday',
        title: 'Sign in to Friday',
        subtitle: 'Use your work email to continue.',
        demoLabel: 'Demo mode',
        demo: 'This local demo does not send a real code. Enter any email, then use',
        demoEnding: '.',
        label: 'Work email',
        sending: 'Sending…',
        submit: 'Get code',
        legalBefore: 'By continuing, you agree to the',
        terms: 'Terms of service',
        legalBetween: 'and',
        privacy: 'Privacy policy.',
      },
      code: {
        eyebrow: 'Verify your identity',
        title: 'Enter your code.',
        subtitle: (email: string) => `A verification code was sent to ${email}.`,
        demoLabel: 'Demo mode',
        demo: 'This local demo accepts',
        demoEnding: '.',
        label: 'Six-digit code',
        verifying: 'Verifying…',
        submit: 'Verify and enter Friday',
        edit: 'Edit email',
        resend: 'Resend code',
        resendIn: (seconds: number) => `Resend in ${seconds}s`,
      },
      errors: {
        invalidEmail: 'Enter a valid work email.',
        sendFailed: 'We could not send a code. Try again shortly.',
        invalidCode: 'That code is incorrect or expired. Request a new one.',
        incompleteCode: 'Enter a six-digit code.',
      },
      authVisualLabel: 'Friday work scene',
    },
    workspace: {
      nav: { home: 'Home', tasks: 'Tasks', memory: 'Memory', feedback: 'Feedback', settings: 'Settings' },
      primaryNavigation: 'Primary navigation',
      content: (label: string) => `${label} content`,
      greeting: (name: string) => `Welcome back, ${name}`,
      unavailableNotifications: 'Notifications are unavailable',
      openAccountMenu: 'Open account menu',
      accountMenu: 'Account menu',
      signOut: 'Sign out',
      home: {
        badge: 'Not set up',
        title: 'Let your work gradually become your work avatar.',
        description: 'Your work avatar will bring together today’s results and the items that need your confirmation here.',
        action: 'Go to Settings to get started',
        today: 'Today',
        empty: 'No work activity yet.',
      },
      pages: {
        tasks: ['Tasks', 'Friday will organize projects, to-dos, and next steps from your work messages and meetings.', 'Back to Home'],
        memory: ['Memory', 'Friday will show the work material and working style it has learned here.', 'View Settings'],
        feedback: ['Feedback', 'Your feedback and your teammates’ feedback will help Friday stay calibrated.', 'Back to Home'],
        settings: ['Settings', 'Connect work apps and manage your avatar’s scope and running state here.', 'View available apps'],
      },
      exit: {
        title: 'Sign out of Friday?',
        body: 'You will need to sign in again with an email verification code.',
        cancel: 'Cancel',
      },
      memory: {
        description: 'All work information enters context first, then becomes user Memory.',
        layersLabel: 'Memory layer',
        layers: {
          context: { label: 'Context', description: 'All work information gathers here first.' },
          user: { label: 'User', description: 'Friday’s lasting understanding distilled from context.' },
        },
        sources: { all: 'All sources', dingtalk: 'DingTalk', feishu: 'Feishu', teams: 'Teams', file: 'File', conversation: 'Conversation' },
        sourceLabel: 'Source',
        searchLabel: 'Search current Memory',
        searchPlaceholder: 'Search current Memory',
        add: 'Add material',
        upload: 'Upload file',
        migration: 'Migrate data',
        uploadModal: { title: 'Upload file', description: 'Add a work document. Friday will add it to Memory after organizing it.', choose: 'Choose file', cancel: 'Cancel', submit: 'Start adding' },
        migrationModal: {
          title: 'Migrate data',
          description: 'First, use this prompt in your conversation tool to organize work content into Markdown.',
          prompt: 'Please organize the current work conversations into a Markdown document.\nKeep project background, confirmed decisions, to-dos, working preferences, and key conclusions;\nremove personal-life and non-work content; do not add information that did not appear.',
          copy: 'Copy prompt',
          next: 'Next',
          back: 'Back',
          choose: 'Choose Markdown file',
          submit: 'Start migration',
        },
        status: { processing: 'Organizing your new material. It will join Memory when complete.', completed: 'Added to Memory', failed: 'This material could not be added to Memory.', retry: 'Retry' },
        empty: { layer: 'There is no work memory ready to show yet.', source: 'This source has not formed Memory ready to show.', search: 'No related Memory found.', clearSource: 'Clear source filter', clearSearch: 'Clear search' },
        mapSummary: (layer, source, keyword, count) => `Showing the ${layer} Memory relationship map for ${source}${keyword ? `, searching for ${keyword}` : ''}, with ${count} visible Memory items.`,
      },
      settings: {
        title: 'Settings',
        close: 'Close Settings',
        back: 'Settings',
        saved: 'Saved',
        nav: { apps: 'Connected apps', general: 'General', profile: 'How Friday works for you' },
        discard: { title: 'Discard changes?', body: 'You have changes that have not been saved.', cancel: 'Keep editing', confirm: 'Discard changes' },
        apps: {
          title: 'Connected apps',
          subtitle: 'Choose where Friday can work with you.',
          demo: 'Demo only: changes stay in this browser. Friday does not start live authorization or process messages.',
          status: { disconnected: 'Not connected', connected: 'Connected', 'needs-reconnect': 'Reconnect needed', connecting: 'Connecting…' },
          action: { connect: (name) => `Connect ${name}`, reconnect: (name) => `Reconnect ${name}`, disconnect: (name) => `Disconnect ${name}` },
          detail: {
            verified: 'Last checked: just now',
            uses: (name) => `Friday uses ${name} to:`,
            usesItems: ['Handle work messages clearly directed to you', 'Read authorised related material to understand context', 'Carry work outcomes into Friday'],
            workScope: 'Work scope',
            groupScope: 'Group chats: only when a colleague clearly @mentions you',
            directScope: 'Direct messages: handled according to the current work mode',
            dataScope: 'Data scope',
            dataScopeValue: 'Work messages and their authorised related material',
            memory: 'Saved Memory',
            memoryValue: 'Retained',
            mode: 'Current operating mode',
            modeValue: 'Active',
            manageOnHome: 'Manage on Home',
            disconnected: (name) => `Friday is not connected to ${name} yet.`,
            reconnect: (name) => `Friday cannot continue using ${name} right now. Reconnect to continue.`,
          },
          disconnect: { title: (name) => `Disconnect ${name}?`, body: (name) => `Friday will stop reading and handling new ${name} content. Existing Memory from ${name} stays available and can be managed separately in Memory.`, cancel: 'Cancel', confirm: (name) => `Disconnect ${name}` },
        },
        general: {
          title: 'General',
          subtitle: 'Set the conditions, rhythm, and alerts that stay in effect.',
          group: { title: 'Group chat handling', description: 'Decide which group messages Friday can consider.', summary: (enabled) => enabled ? '@ me and @everyone' : 'Only @ me', direct: 'Messages that @mention you are always considered.', everyone: 'Handle @everyone in group chats', confirmation: { title: 'Let Friday respond to @everyone?', body: 'Friday cannot know whether @everyone is intended for you. Only clear work requests will be considered.', cancel: 'Cancel', confirm: 'Enable anyway' } },
          rhythm: { title: 'Work rhythm', description: 'Give yourself time to reply before Friday steps in.', summary: (minutes, quiet) => `Wait ${minutes} min${quiet ? ` · Quiet ${quiet}` : ''}`, wait: 'Wait for me first', waitOptions: (minutes) => `${minutes} minute${minutes === 1 ? '' : 's'}`, quiet: 'Quiet hours', quietStart: 'Start', quietEnd: 'End', helper: 'If you reply first, Friday stays quiet. During quiet hours it may draft, but does not automatically send.' },
          notifications: { title: 'Notifications', description: 'Only alert me when an action is needed.', summary: (count) => `${count} enabled`, handoff: 'I need to take over', handoffDescription: 'Friday needs your judgment, reply, or action.', reconnect: 'A connection needs attention', reconnectDescription: 'A connected app needs to be reconnected or authorised again.', sendFailed: 'A reply did not send', sendFailedDescription: 'Friday produced a result but could not complete its active send.' },
          save: 'Save changes',
        },
        profile: {
          title: 'User Profile',
          subtitle: (name) => `How Friday understands ${name}`,
          description: 'Friday has learned your judgment, expression, and working style.',
          tags: ['Conclusion first', 'Do not promise lightly', 'Ask when information is missing'],
          updated: 'Updated today',
          identity: 'My work identity',
          name: 'Name',
          aliases: 'How teammates mention me',
          aliasPlaceholder: 'Add an @alias',
          addAlias: 'Add',
          removeAlias: (alias) => `Remove ${alias}`,
          judgment: 'My judgment',
          judgmentValue: 'Start with the goal and facts; ask when information is missing; do not make promises lightly.',
          expression: 'My expression',
          expressionValue: 'Lead with the conclusion and keep it direct; give next steps for complex work.',
          boundaries: 'My work boundaries',
          boundariesValue: 'Key decisions, external commitments, and sensitive matters always need my confirmation.',
          memory: 'View sources in Memory',
          feedback: 'Calibrate in Feedback',
          save: 'Save identity',
        },
        safety: {
          title: 'Safety Boundaries',
          description: 'Friday always hands important decisions back to you.',
          summary: 'Commitments · Sensitive matters · Missing information · Requested person',
          items: ['Make external commitments, pricing, contracts, or key decisions for you', 'Handle sensitive people, financial, or customer matters', 'Guess when material facts, context, or recipients are unclear', 'Continue answering when the other person explicitly asks for you'],
          handoff: 'In these cases, Friday explains the handoff clearly and notifies you on Home.',
          always: 'These rules are always in effect.',
        },
      },
    },
  },
  zh: {
    journey: ['登录', '建立工作记忆', '确认工作方式', '试运行'],
    language: { switchToChinese: '切换到 English' },
    login: {
      email: {
        eyebrow: '欢迎使用 Friday',
        title: '登录 Friday',
        subtitle: '使用工作邮箱继续。',
        demoLabel: '演示模式',
        demo: '本地演示不会发送真实验证码。请输入任意邮箱后使用',
        demoEnding: '。',
        label: '工作邮箱',
        sending: '正在发送…',
        submit: '获取验证码',
        legalBefore: '继续即表示你同意',
        terms: '服务条款',
        legalBetween: '与',
        privacy: '隐私政策。',
      },
      code: {
        eyebrow: '验证身份',
        title: '输入验证码。',
        subtitle: (email: string) => `验证码已发送至 ${email}。`,
        demoLabel: '演示模式',
        demo: '本地演示可使用',
        demoEnding: '。',
        label: '六位验证码',
        verifying: '正在验证…',
        submit: '验证并进入 Friday',
        edit: '返回修改邮箱',
        resend: '重新发送',
        resendIn: (seconds: number) => `${seconds} 秒后重新发送`,
      },
      errors: {
        invalidEmail: '请输入有效的工作邮箱。',
        sendFailed: '暂时无法发送验证码，请稍后重试。',
        invalidCode: '验证码不正确或已过期，请重新获取。',
        incompleteCode: '请输入六位验证码。',
      },
      authVisualLabel: 'Friday 工作场景',
    },
    workspace: {
      nav: { home: '首页', tasks: '任务', memory: '记忆', feedback: '反馈', settings: '设置' },
      primaryNavigation: '主要导航',
      content: (label: string) => `${label}内容`,
      greeting: (name: string) => `欢迎回来，${name}`,
      unavailableNotifications: '通知暂不可用',
      openAccountMenu: '打开账户菜单',
      accountMenu: '账户菜单',
      signOut: '退出登录',
      home: {
        badge: '尚未设置',
        title: '让你的工作，慢慢变成你的分身。',
        description: '你的工作分身将在这里汇总今天的处理结果和需要你确认的事项。',
        action: '前往设置开始设置',
        today: '今天',
        empty: '还没有工作事件。',
      },
      pages: {
        tasks: ['任务', 'Friday 会从工作消息和会议中整理项目、待办与下一步。', '返回首页'],
        memory: ['记忆', '这里会呈现 Friday 已理解的工作资料和你的工作方式。', '查看设置'],
        feedback: ['反馈', '你和同事对回复的反馈，会在这里帮助 Friday 持续校准。', '返回首页'],
        settings: ['设置', '在这里连接工作应用，并管理分身的处理范围与运行状态。', '查看可连接应用'],
      },
      exit: {
        title: '确认退出 Friday？',
        body: '退出后需要通过邮箱验证码重新登录。',
        cancel: '取消',
      },
      memory: {
        description: '所有工作信息先进入上下文，再沉淀为用户 Memory。',
        layersLabel: '记忆层',
        layers: {
          context: { label: '上下文', description: '所有工作信息先在这里汇聚。' },
          user: { label: '用户', description: 'Friday 从上下文中沉淀出的长期工作理解。' },
        },
        sources: { all: '全部来源', dingtalk: '钉钉', feishu: '飞书', teams: 'Teams', file: '文件', conversation: '对话' },
        sourceLabel: '来源',
        searchLabel: '搜索当前 Memory',
        searchPlaceholder: '搜索当前 Memory',
        add: '添加资料',
        upload: '上传文件',
        migration: '数据迁移',
        uploadModal: { title: '上传文件', description: '添加一份工作资料，Friday 会在整理后将其加入 Memory。', choose: '选择文件', cancel: '取消', submit: '开始添加' },
        migrationModal: {
          title: '数据迁移',
          description: '先在你的对话工具中使用这段 Prompt，将工作相关内容整理成 Markdown。',
          prompt: '请将当前工作中的对话整理为一份 Markdown 文档。\n保留项目背景、已确认的决策、待办、工作偏好和关键结论；\n移除个人生活及非工作内容；不要补充未出现的信息。',
          copy: '复制 Prompt',
          next: '下一步',
          back: '返回',
          choose: '选择 Markdown 文件',
          submit: '开始迁移',
        },
        status: { processing: '正在整理新资料，完成后会加入 Memory。', completed: '已加入 Memory', failed: '这份资料暂时未能加入 Memory', retry: '重试' },
        empty: { layer: '还没有可呈现的工作记忆', source: '这个来源还没有形成可呈现的 Memory', search: '没有找到相关的 Memory', clearSource: '清除筛选', clearSearch: '清除搜索' },
        mapSummary: (layer, source, keyword, count) => `正在显示${layer}层，${source}的 Memory 关系地图${keyword ? `，搜索：${keyword}` : ''}，共${count}项可见 Memory。`,
      },
      settings: {
        title: '设置',
        close: '关闭设置',
        back: '设置',
        saved: '已保存',
        nav: { apps: '已连接的应用', general: '通用', profile: 'Friday 如何为你工作' },
        discard: { title: '放弃更改？', body: '你有尚未保存的更改。', cancel: '继续编辑', confirm: '放弃更改' },
        apps: {
          title: '已连接的应用',
          subtitle: '选择 Friday 可以在哪里与你一起工作。',
          demo: '仅为演示：更改只保留在此浏览器中。Friday 不会开始真实授权或处理消息。',
          status: { disconnected: '未连接', connected: '已连接', 'needs-reconnect': '需要重新连接', connecting: '正在连接…' },
          action: { connect: (name) => `连接${name}`, reconnect: (name) => `重新连接${name}`, disconnect: (name) => `断开${name}` },
          detail: {
            verified: '上次验证：刚刚',
            uses: (name) => `Friday 会使用${name}来：`,
            usesItems: ['处理明确指向你的工作消息', '阅读已授权的关联资料，以理解上下文', '将工作结果沉淀到 Friday'],
            workScope: '工作范围',
            groupScope: '群聊：仅在同事明确 @ 你时处理',
            directScope: '私聊：按当前工作状态处理',
            dataScope: '数据范围',
            dataScopeValue: '工作消息与其已授权的关联资料',
            memory: '已沉淀的 Memory',
            memoryValue: '保留',
            mode: '当前运行状态',
            modeValue: '正式状态',
            manageOnHome: '在 Home 中管理',
            disconnected: (name) => `Friday 尚未连接${name}。`,
            reconnect: (name) => `Friday 暂时无法继续使用${name}。请重新连接后再试。`,
          },
          disconnect: { title: (name) => `断开${name}？`, body: (name) => `Friday 将停止读取和处理新的${name}内容。此前从${name}沉淀的 Memory 会保留；你可以稍后在 Memory 中单独管理它。`, cancel: '取消', confirm: (name) => `断开${name}` },
        },
        general: {
          title: '通用',
          subtitle: '设置长期生效的处理条件、工作节奏和提醒。',
          group: { title: '群聊处理条件', description: '决定 Friday 可以考虑哪些群聊消息。', summary: (enabled) => enabled ? '@ 我和 @所有人' : '仅 @ 我', direct: '群聊中明确 @ 你的消息始终会被考虑。', everyone: '处理群聊中的 @所有人', confirmation: { title: '让 Friday 响应 @所有人？', body: 'Friday 无法确认 @所有人 是否只针对你。只有明确的工作请求才会被处理。', cancel: '取消', confirm: '仍然开启' } },
          rhythm: { title: '工作节奏', description: '在 Friday 介入前，先给你留出亲自回复的时间。', summary: (minutes, quiet) => `等待 ${minutes} 分钟${quiet ? ` · 免打扰 ${quiet}` : ''}`, wait: '先等我处理', waitOptions: (minutes) => `${minutes} 分钟`, quiet: '免打扰时段', quietStart: '开始', quietEnd: '结束', helper: '如果你已亲自回复，Friday 会保持安静。免打扰时段内它仍可生成草稿，但不会自动发送。' },
          notifications: { title: '通知', description: '只在需要你采取行动时提醒。', summary: (count) => `${count} 项已开启`, handoff: '需要我接管', handoffDescription: 'Friday 需要你亲自判断、回复或处理。', reconnect: '连接需要处理', reconnectDescription: '已连接应用需要重新连接或再次授权。', sendFailed: '回复未成功发送', sendFailedDescription: 'Friday 已产生结果，但未能完成正式发送。' },
          save: '保存更改',
        },
        profile: {
          title: 'User Profile',
          subtitle: (name) => `Friday 如何理解${name}`,
          description: 'Friday 已学习你的判断、表达与工作方式。',
          tags: ['结论优先', '不轻易承诺', '信息不足先追问'],
          updated: '已更新 · 今天',
          identity: '我的工作身份',
          name: '姓名',
          aliases: '同事如何 @ 我',
          aliasPlaceholder: '添加 @ 别名',
          addAlias: '添加',
          removeAlias: (alias) => `移除 ${alias}`,
          judgment: '我的判断方式',
          judgmentValue: '先看目标与事实；信息不足先追问；不轻易替人承诺。',
          expression: '我的表达方式',
          expressionValue: '结论优先，简短直接；复杂事项给出下一步。',
          boundaries: '我的工作边界',
          boundariesValue: '涉及关键判断、对外承诺或敏感议题时，必须交由本人确认。',
          memory: '去 Memory 查看来源',
          feedback: '去 Feedback 校准不准确的地方',
          save: '保存身份信息',
        },
        safety: {
          title: 'Safety Boundaries',
          description: 'Friday 始终会把关键决定交还给你。',
          summary: '承诺 · 敏感事项 · 信息不足 · 要求本人',
          items: ['代表你作出对外承诺、价格、合同或关键决策', '处理人事、财务、客户等敏感议题', '在关键信息、材料或对象不明确时猜测', '在对方明确要求你本人时继续代答'],
          handoff: '遇到以上情况，Friday 会生成清晰的转交说明，并在 Home 通知你处理。',
          always: '这些规则始终生效。',
        },
      },
    },
  },
}
