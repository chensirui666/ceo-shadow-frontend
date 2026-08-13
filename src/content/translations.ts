import type { Locale, Route } from '../appState.ts'
import type { FeedbackRange, FeedbackSentiment, FeedbackSource, FeedbackTrendPoint } from '../feedbackState.ts'
import type { ActivityHour, HomeOutcome, HomeSource, HomeStatus, OperatingMode } from '../homeState.ts'
import type { MemorySource } from '../memoryState.ts'
import type { MessageCategory, MessageSource, MessageStatus, MessageSummaryRange } from '../messageState.ts'
import type { ConnectorId, ConnectorStatus, SettingsSection } from '../settingsState.ts'

type PageCopy = [string, string, string]

type SettingsCopy = {
  title: string
  close: string
  saved: string
  nav: Record<SettingsSection, string>
  discard: { title: string; body: string; cancel: string; confirm: string }
  apps: {
    title: string
    subtitle: string
    demo: string
    description: Record<ConnectorId, string>
    status: Record<ConnectorStatus | 'connecting', string>
    action: { connect: (name: string) => string; reconnect: (name: string) => string; disconnect: (name: string) => string }
    disconnect: { title: (name: string) => string; body: (name: string) => string; cancel: string; confirm: (name: string) => string }
  }
  general: {
    title: string
    subtitle: string
    group: { title: string; description: string; summary: (enabled: boolean) => string; direct: string; everyone: string; confirmation: { title: string; body: string; cancel: string; confirm: string } }
    rhythm: { title: string; description: string; summary: (minutes: number, quiet: string | null) => string; wait: string; waitOptions: (minutes: number) => string; quiet: string; quietStart: string; quietEnd: string; helper: string }
    notifications: { title: string; description: string; summary: (count: number) => string; handoff: string; handoffDescription: string; reconnect: string; reconnectDescription: string; sendFailed: string; sendFailedDescription: string }
    preferences: { title: string }
    language: { title: string; description: string; english: string; chinese: string }
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
  layersLabel: string
  layers: Record<'context' | 'user', { label: string }>
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

export type HomeCopy = {
  recent: string
  sources: Record<HomeSource, string>
  source: string
  allSources: string
  question: string
  reply: string
  labelSeparator: string
  countdown: (seconds: number) => string
  status: Record<HomeStatus, string>
  outcome: Record<HomeOutcome, string>
  mode: { label: string; choices: Record<OperatingMode, string> }
  chart: { title: string; processed: string; pending: string; failed: string; legend: (totals: Pick<ActivityHour, 'processed' | 'pending' | 'failed'>) => string; hourLabel: (hour: ActivityHour) => string; empty: string }
  empty: { loading: string; error: string; noConnections: string; events: string; source: (source: string) => string }
  detail: { back: string; eventInformation: string; source: string; conversation: string; sender: string; time: string; status: string; result: string; originalMessage: string; rationale: string; response: string; waiting: string; processing: string; paused: string; needsConfirmation: string; trialNote: string; editReply: string }
  feedback: { title: string; matched: string; adjust: string; placeholder: string; save: string; saved: string; recipientTitle: string; recipientQuestion: string; helpful: string; unresolved: string; recipientPending: string }
  actions: { send: string; cancel: string; retry: string; goToSettings: string; clearSource: string }
  confirmation: { title: (mode: OperatingMode) => string; body: (mode: OperatingMode) => string; confirm: (mode: OperatingMode) => string }
}

export type MessageCopy = {
  loading: string
  error: string
  empty: string
  dateLocale: string
  status: Record<MessageStatus | 'all', string>
  sources: Record<MessageSource, string>
  categories: Record<MessageCategory, string>
  list: {
    title: string
    subtitle: string
    statusNavigation: string
    label: string
    columns: { statusTime: string; metadata: string; question: string; handling: string; actions: string }
    confirm: string
    skip: string
    filteredEmpty: string
    aside: {
      filters: { title: string; clear: string; source: string; category: string; subject: string; sender: string }
      sources: { title: string; apps: Record<'dingtalk' | 'feishu' | 'teams' | 'slack' | 'wecom' | 'discord', string> }
      activity: { title: string; rangeLabel: string; ranges: Record<MessageSummaryRange, string>; all: string; needsConfirmation: string; processed: string; failed: string }
      smarter: { title: string; body: string; action: string }
    }
  }
  detail: {
    back: string
    question: string
    rationale: string
    result: string
    tasks: string
    feedback: string
    feedbackPending: string
    liked: string
    disliked: (reason: string) => string
    references: string
    actions: string
    noActions: string
    information: string
    sender: string
    source: string
    category: string
    time: string
    taskSummary: string
    timeline: string
  }
  feedbackControls: { upvote: string; upvoteReason: string; downvote: string; reason: string; submit: string }
}

type OnboardingCopy = {
  progressLabel: string
  steps: [{ label: string; description: string }, { label: string; description: string }, { label: string; description: string }, { label: string; description: string }]
  welcome: { eyebrow: string; storyTitle: string; title: string; duration: string; start: string; dismiss: string; memoryAlt: string }
  stepKicker: (step: number) => string
  actions: { cancel: string; continue: string }
  support: { apps: { title: string; comingSoon: string }; security: { title: string; points: [string, string, string]; learnMore: string }; teams: { title: string; subtitle: string; segments: [string, string, string, string]; detail: string; stories: string } }
  connection: { title: string; subtitle: string; scope: Record<HomeSource, string>; connect: string; connected: string; confirmTitle: (name: string) => string; confirmBody: string; complete: string; continueHint: string }
  memory: { title: string; subtitle: string; signalsTitle: string; signals: Record<'messages' | 'documents' | 'calendar', [string, string]>; findingsLabel: string; findings: Record<'messages' | 'documents' | 'topics', [number, string]>; migration: { title: string; body: string }; confirm: string; view: string; proceed: string; scopeTitle: string; scopeHint: string; readSelected: string; removeSource: (name: string) => string; readingTitle: string; readingSubtitle: string; analysis: string; analysisComplete: string }
  style: { title: string; subtitle: string; summary: string; points: string[]; extract: string; extractingTitle: string; extractingSubtitle: string; analysis: string; analysisComplete: string; editHint: string; promptLabel: string; usePrompt: string; prompt: string }
  trial: { title: string; subtitle: string; suggestions: string; questions: string[]; inputLabel: string; placeholder: string; submit: string; contextTitle: string; context: string; replyTitle: string; note: string; adjustLabel: string; adjustPlaceholder: string; adjustAction: string }
  activation: { start: string; confirmTitle: string; confirmBody: string; confirm: string; celebrating: string; completeTitle: string; completeBody: string; completeAction: string }
}

export type FeedbackCopy = {
  title: string
  subtitle: string
  demo: string
  ranges: Record<FeedbackRange, string>
  metrics: Record<'feedbackCount' | 'coverageRate' | 'positiveRate' | 'attentionCount', string>
  trend: { title: string; positive: string; negative: string; point: (point: FeedbackTrendPoint) => string; empty: string }
  sources: { title: string; names: Record<FeedbackSource, string>; total: (name: string, count: number, rate: number) => string; empty: string }
  sentiment: Record<FeedbackSentiment, string>
  cards: { title: string; question: string; reply: string; note: string; view: string; empty: string }
  detail: { title: string; close: string; question: string; reply: string; feedback: string; loading: string }
  state: { loading: string }
}

export type TasksCopy = {
  loading: string
  error: string
  empty: string
  dashboard: { title: string; projects: string; owned: (count: number) => string; myTodos: string; myTodosHint: string; attention: string; attentionHint: (overdue: number, blocked: number) => string }
  list: { project: string; status: string; owner: string; progress: string; personalTodos: string }
  openTodos: (count: number) => string
  progress: (completed: number, total: number, percent: number) => string
  fraction: (completed: number, total: number) => string
  projectStatus: Record<'not-started' | 'in-progress' | 'overdue' | 'completed', string>
  todoStatus: Record<'open' | 'completed' | 'cancelled', string>
  priority: Record<'high' | 'medium' | 'low', string>
  sections: { details: string; milestones: string; todos: string; conclusions: string; sources: string }
  detail: { started: string; owner: string; participants: string; priority: string; status: string; goal: string; background: string; progress: string; blocker: string; nextStep: string; recentChange: string }
  document: { detail: string; projectDetail: string; open: string; backToProject: (project: string) => string; preview: string; edit: string; save: string; saved: string; titleLabel: string; bodyLabel: string }
  milestone: { current: string; due: string; progress: string; completed: string; active: string; upcoming: string; openLinkedActions: string }
  todo: { owner: string; item: string; progress: string; due: string; completedAt: string; source: string; aiProduct: string; actions: string; noDue: string; empty: string; openAiProduct: string; noAiProduct: string }
  aiProductDocument: { label: string; backToProject: (project: string) => string; actionItem: string; sourceCount: (count: number) => string; titleLabel: string; bodyLabel: string; draft: string; save: string; saved: string; openCopilot: string; closeCopilot: string; copilotTitle: string; copilotHint: string; feedback: string; feedbackPlaceholder: string; sendFeedback: string; feedbackSent: string; noFeedback: string; newConversation: string; messagePlaceholder: string; ask: string }
  conclusion: { summary: string; time: string; source: string }
  personalTodos: { open: (count: number) => string; overdue: (count: number) => string; completed: (count: number) => string; tooltip: string }
  source: { count: (count: number) => string; type: Record<'document' | 'minutes' | 'presentation' | 'audio' | 'folder' | 'file' | 'message' | 'meeting' | 'todo', string> }
  cancelDialog: { title: string; body: string; keep: string; confirm: string }
  actions: { back: string; complete: string; cancel: string; retry: string }
}

export type Translation = {
  journey: string[]
  login: {
    email: Record<'eyebrow' | 'title' | 'label' | 'sending' | 'submit' | 'legalBefore' | 'terms' | 'legalBetween' | 'privacy', string>
    code: Record<'eyebrow' | 'title' | 'label' | 'verifying' | 'submit' | 'edit' | 'resend', string> & { resendIn: (seconds: number) => string }
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
    home: HomeCopy
    message: MessageCopy
    onboarding: OnboardingCopy
    feedback: FeedbackCopy
    tasks: TasksCopy
    pages: Record<string, PageCopy>
    exit: Record<'title' | 'body' | 'cancel', string>
    memory: MemoryCopy
    settings: SettingsCopy
  }
}

export const translations: Record<Locale, Translation> = {
  en: {
    journey: ['Sign in', 'Build work memory', 'Confirm work style', 'Trial'],
    login: {
      email: {
        eyebrow: 'Welcome to Friday',
        title: 'Sign in to Friday',
        label: 'WORK EMAIL',
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
      nav: { home: 'Message', tasks: 'Task', memory: 'Memory', feedback: 'Feedback', settings: 'Settings' },
      primaryNavigation: 'Primary navigation',
      content: (label: string) => `${label} content`,
      greeting: (name: string) => `Welcome back, ${name}`,
      unavailableNotifications: 'Notifications are unavailable',
      openAccountMenu: 'Open account menu',
      accountMenu: 'Account menu',
      signOut: 'Sign out',
      home: {
        recent: 'Recent 24 hours',
        sources: { dingtalk: 'DingTalk', feishu: 'Feishu', teams: 'Teams' },
        source: 'Source',
        allSources: 'All apps',
        question: 'Message',
        reply: 'Reply',
        labelSeparator: ': ',
        countdown: (seconds) => `${Math.floor(seconds / 60)}m ${seconds % 60}s until automatic reply`,
        status: { waiting: 'Waiting for you', processing: 'Processing', 'needs-confirmation': 'Needs your confirmation', completed: 'Processed', 'trial-complete': 'Trial · complete, not sent', 'send-failed': 'Send failed', 'connection-error': 'Connection issue' },
        outcome: { sent: 'Sent', cancelled: 'Cancelled, Friday did not send', 'self-replied': 'You replied, Friday did not send', 'no-reply': 'No reply needed' },
        mode: {
          label: 'Operating mode',
          choices: { active: 'Start', trial: 'Try', paused: 'Pause' },
        },
        chart: {
          title: '24-hour message activity', processed: 'Processed', pending: 'Pending', failed: 'Send failed',
          legend: (totals) => `Processed ${totals.processed} · Pending ${totals.pending} · Send failed ${totals.failed}`,
          hourLabel: (hour) => `${hour.hour}:00: Processed ${hour.processed}, Pending ${hour.pending}, Send failed ${hour.failed}`,
          empty: 'No messages in the last 24 hours.',
        },
        empty: { loading: 'Loading recent events…', error: 'Recent events could not be loaded. Try again.', noConnections: 'Connect a work app before Friday can handle messages.', events: 'No messages in the last 24 hours.', source: (source) => `No work messages from ${source} in the last 24 hours.` },
        detail: { back: 'Back to recent 24 hours', eventInformation: 'Event information', source: 'Source', conversation: 'Conversation', sender: 'Sender', time: 'Time', status: 'Status', result: 'Result', originalMessage: 'Original message', rationale: 'Why this happened', response: 'Reply', waiting: 'Waiting for you to reply.', processing: 'Generating a reply…', paused: 'Paused', needsConfirmation: 'Your judgment is needed.', trialNote: 'This reply was not sent.', editReply: 'Edit reply' },
        feedback: { title: 'Your feedback', matched: 'Matches me', adjust: 'Needs adjustment', placeholder: 'What should be different next time?', save: 'Save feedback', saved: 'Feedback recorded', recipientTitle: 'Recipient feedback', recipientQuestion: 'Did this reply resolve your question?', helpful: 'Helpful', unresolved: 'Not resolved', recipientPending: 'Recipient feedback will appear here when it is available.' },
        actions: { send: 'Send', cancel: 'Cancel', retry: 'Retry', goToSettings: 'Go to Settings', clearSource: 'View all apps' },
        confirmation: { title: (mode) => ({ active: 'Start Friday?', trial: 'Use Try mode?', paused: 'Pause Friday?' })[mode], body: (mode) => ({ active: 'This local demo only changes the displayed mode. Real sending still requires backend gates.', trial: 'Future replies will stay available for your review and will not be sent.', paused: 'Friday will stop processing new messages until you start or try again.' })[mode], confirm: (mode) => ({ active: 'Start Friday', trial: 'Use Try mode', paused: 'Pause Friday' })[mode] },
      },
      message: {
        loading: 'Loading messages…', error: 'Messages could not be loaded.', empty: 'No messages need attention yet.', dateLocale: 'en-US',
        status: { all: 'All', pending: 'Pending', processing: 'Processing', 'needs-confirmation': 'Needs confirmation', processed: 'Processed', skipped: 'Skipped', failed: 'Failed' },
        sources: { dingtalk: 'DingTalk', feishu: 'Feishu', teams: 'Teams', slack: 'Slack', wecom: 'WeCom', discord: 'Discord' },
        categories: { chat: 'Chat', document: 'Document', approval: 'Approval', meeting: 'Meeting' },
        list: {
          title: 'Message', subtitle: 'See what Friday is handling, what needs your confirmation, and what is complete.', statusNavigation: 'Message status', label: 'Message list',
          columns: { statusTime: 'Status and time', metadata: 'Subject / source / category', question: 'Question', handling: "Friday's handling", actions: 'Actions' },
          confirm: 'Confirm', skip: 'Skip', filteredEmpty: 'No messages match this status.',
          aside: {
            filters: { title: 'Filters', clear: 'Clear all', source: 'All sources', category: 'All categories', subject: 'All conversations', sender: 'All senders' },
            sources: { title: 'Sources', apps: { dingtalk: 'DingTalk', feishu: 'Feishu', teams: 'Teams', slack: 'Slack', wecom: 'WeCom', discord: 'Discord' } },
            activity: { title: 'Activity summary', rangeLabel: 'Activity period', ranges: { '7d': 'Last 7 days', '30d': 'Last 30 days', all: 'All' }, all: 'Total messages', needsConfirmation: 'Needs confirmation', processed: 'Completed', failed: 'Failed' },
            smarter: { title: 'Make Friday smarter', body: 'Link more apps and set preferences to get better, more relevant help.', action: 'Go to settings' },
          },
        },
        detail: {
          back: 'Back to Message', question: 'Question', rationale: 'Reasoning', result: 'Handling result', tasks: 'Related Task', feedback: 'Feedback', feedbackPending: 'Feedback is available after handling is complete.', liked: 'Liked', disliked: (reason) => `Disliked: ${reason}`, references: 'Supporting context and materials',
          actions: 'Actions', noActions: 'No action is needed from you.', information: 'Message information', sender: 'Sender', source: 'Source', category: 'Category', time: 'Time', taskSummary: 'Task summary', timeline: 'Activity timeline',
        },
        feedbackControls: { upvote: 'Like', upvoteReason: 'Helpful.', downvote: 'Dislike', reason: 'Feedback reason', submit: 'Submit feedback' },
      },
      onboarding: {
        progressLabel: 'Onboarding progress', steps: [{ label: 'Connect work sources', description: 'Choose the work sources Friday can use.' }, { label: 'Build work Memory', description: 'Confirm the scope for your first work Memory.' }, { label: 'Confirm work style', description: 'Review Friday’s draft of your work style.' }, { label: 'Try it out', description: 'Preview one reply before formal use.' }], welcome: { eyebrow: 'Welcome to Friday', storyTitle: 'Ready to meet your work twin?', title: 'Set up in 4 steps', duration: 'Estimated time: 3 min', start: 'Start setup', dismiss: 'Close welcome dialog', memoryAlt: 'Memory overview' }, stepKicker: (step) => `Step ${step} of 4`, actions: { cancel: 'Cancel', continue: 'Continue' }, support: { apps: { title: 'Supported work apps', comingSoon: 'Coming soon' }, security: { title: 'Security & permissions', points: ['All content is previewed locally on your device.', 'We never access data without your permission.', 'You stay in control. Approval before anything is sent.'], learnMore: 'Learn more about security' }, teams: { title: 'Teams that use Friday', subtitle: 'Trusted by teams to work smarter, together.', segments: ['Product', 'Operations', 'Management', 'Marketing'], detail: 'Join fast-growing teams improving clarity and collaboration with Friday.', stories: 'See customer stories' } },
        connection: { title: 'Connect your work apps', subtitle: 'Connect one app to begin. You can refine detailed rules later in Settings.', scope: { dingtalk: 'Work messages and calendar', feishu: 'Team messages and shared documents', teams: 'Messages and channel updates' }, connect: 'Connect', connected: 'Connected', confirmTitle: (name) => `Connect ${name}`, confirmBody: 'Confirm this connection to continue.', complete: 'Complete connection', continueHint: 'Connect at least one app to continue.' },
        memory: { title: 'Build your Memory', subtitle: 'Review what Friday would read before you create the first work Memory.', signalsTitle: 'What Friday can read', signals: { messages: ['Work messages', 'Chats, decisions, and follow-ups'], documents: ['Work documents', 'Project context and key conclusions'], calendar: ['Calendar context', 'Meetings, events, and timing'] }, findingsLabel: 'Work context found', findings: { messages: [126, 'work messages'], documents: [18, 'documents'], topics: [7, 'recurring topics'] }, migration: { title: 'Bring existing Memory with you', body: 'Complete data migration in Memory when you are ready.' }, confirm: 'Build Memory', view: 'View Memory', proceed: 'Confirm', scopeTitle: 'Choose apps to read', scopeHint: 'Remove any app you do not want included in this Memory.', readSelected: 'Read selected apps', removeSource: (name) => `Remove ${name} from this Memory`, readingTitle: 'Reading connected work context', readingSubtitle: 'Friday is analyzing your connected messages and documents to build your work memory.', analysis: 'Analyzing connected data…', analysisComplete: 'Analysis complete' },
        style: { title: 'Confirm your work style', subtitle: 'Review the work habits Friday distilled from your work context.', summary: 'Friday distilled these four work habits from your work context.', points: ['Expression: concise and explicit about uncertainty.', 'Judgment: check facts, risks, and owner first.', 'Next step: make the next action clear.', 'Boundaries: hand off commitments and sensitive or missing context.'], extract: 'Distill work style', extractingTitle: 'Distilling your work style', extractingSubtitle: 'Friday is analyzing your work context to draft your work style.', analysis: 'Analyzing your work style…', analysisComplete: 'Analysis complete', editHint: 'Review and refine this work-style Prompt before you use it.', promptLabel: 'Work-style Prompt', usePrompt: 'Use this Prompt', prompt: 'Expression\nUse concise language. State uncertainty directly.\n\nDecision order\nConfirm current facts, risks, owners, and due dates before committing.\n\nScenario rules\nFor project and meeting updates, give the next step and owner.\n\nBoundaries\nHand off commitments, sensitive content, and missing context.' },
        trial: { title: 'Try one question', subtitle: 'In Trial, your message only goes to Friday. It is never sent to a colleague.', suggestions: 'Not sure what to ask?', questions: ['Customer asks: Can this project ship this week?', 'Teammate asks: What should we prepare for next week’s meeting?', 'Customer asks: What risks does the current plan have?'], inputLabel: 'Trial question', placeholder: 'Type a work question for Friday…', submit: 'Send to Friday', contextTitle: 'What Friday understood', context: 'This is a Trial based on the current connected-app scope and confirmed work style.', replyTitle: 'Suggested reply', note: 'Trial only: this reply is kept in this session and is not sent to any contact. An adjustment is retained as later calibration material and does not rewrite your work style now.', adjustLabel: 'Adjust this reply', adjustPlaceholder: 'Write one adjustment for this Trial reply', adjustAction: 'Regenerate' },
        activation: { start: 'Start formal mode', confirmTitle: 'Start formal mode?', confirmBody: 'Future replies may be handled under the rules you set. Real sending still requires backend gates.', confirm: 'Confirm formal mode', celebrating: 'Friday is getting ready for you', completeTitle: 'Your work avatar is now active', completeBody: 'Friday is ready to start helping you work', completeAction: 'Start exploring' },
      },

      feedback: {
        title: 'Feedback',
        subtitle: 'From teammate ratings and my reviews',
        demo: 'Local demo data',
        ranges: { '7d': 'Last 7 days', '30d': 'Last 30 days', all: 'ALL' },
        metrics: { feedbackCount: 'Feedback received', coverageRate: 'Feedback coverage', positiveRate: 'Positive rate', attentionCount: 'Feedback needing attention' },
        trend: { title: 'Quality trend', positive: 'Positive', negative: 'Negative', point: (point) => `${point.label}: Positive ${point.positive}, Negative ${point.negative}`, empty: 'No feedback trend for this range.' },
        sources: { title: 'Feedback sources', names: { recipient: 'Teammate rating', owner: 'My review' }, total: (name, count, rate) => `${name} ${count} · ${rate}%`, empty: 'No feedback sources for this range.' },
        sentiment: { positive: 'Positive', negative: 'Needs adjustment' },
        cards: { title: 'Feedback wall', question: 'Question', reply: 'Final reply', note: 'Feedback', view: 'View details', empty: 'No feedback collected in this range.' },
        detail: { title: 'Feedback details', close: 'Close feedback details', question: 'Complete question', reply: 'Final reply', feedback: 'All feedback', loading: 'Loading feedback details…' },
        state: { loading: 'Loading demo feedback…' },
      },
      tasks: {
        loading: 'Loading Projects…', error: 'Projects could not be loaded. Try again shortly.', empty: 'No projects relevant to you have been formed yet.',
        dashboard: { title: 'My projects', projects: 'Projects involved', owned: (count) => `${count} owned`, myTodos: 'My action items', myTodosHint: 'Completed / active total', attention: 'Needs attention', attentionHint: (overdue, blocked) => `${overdue} overdue · ${blocked} blocked only` },
        list: { project: 'Project', status: 'Status', owner: 'Owner', progress: 'Progress', personalTodos: 'My actions' }, openTodos: (count) => `${count} open`, progress: (completed, total, percent) => `${completed}/${total} · ${percent}%`, fraction: (completed, total) => `${completed}/${total}`,
        projectStatus: { 'not-started': 'Not started', 'in-progress': 'In progress', overdue: 'Overdue', completed: 'Completed' }, todoStatus: { open: 'Open', completed: 'Completed', cancelled: 'Cancelled' }, priority: { high: 'P0', medium: 'P1', low: 'P2' },
        sections: { details: 'Project overview', milestones: 'Current progress', todos: 'Todos', conclusions: 'Conclusions', sources: 'Project sources' },
        detail: { started: 'Started', owner: 'Owner', participants: 'Participants', priority: 'Priority', status: 'Status', goal: 'Project goal', background: 'Background', progress: 'Current progress', blocker: 'Blocker', nextStep: 'Next step', recentChange: 'Recent change' },
        document: { detail: 'Detail', projectDetail: 'Project detail', open: 'Open file', backToProject: (project) => 'Back to ' + project, preview: 'Preview', edit: 'Edit', save: 'Save changes', saved: 'Saved in this session', titleLabel: 'Document title', bodyLabel: 'Document content' },
        milestone: { current: 'Current milestone', due: 'Due', progress: 'Progress', completed: 'Completed', active: 'In progress', upcoming: 'Upcoming', openLinkedActions: 'View linked action items' },
        todo: { owner: 'Owner', item: 'Todos', progress: 'Status', due: 'Due', completedAt: 'Completed at', source: 'Source', aiProduct: 'AI Product', actions: 'Actions', noDue: 'No due date', empty: 'No todos yet', openAiProduct: 'View draft', noAiProduct: 'No draft' }, aiProductDocument: { label: 'AI Product document', backToProject: (project) => `Back to ${project}`, actionItem: 'Action item', sourceCount: (count) => `${count} source${count === 1 ? '' : 's'} linked`, titleLabel: 'Document title', bodyLabel: 'Document content', draft: 'Draft', save: 'Save changes', saved: 'Saved in this session', openCopilot: 'Open Copilot', closeCopilot: 'Close Copilot', copilotTitle: 'Copilot', copilotHint: 'Review this draft and record feedback. Copilot will not send or overwrite anything.', feedback: 'Feedback', feedbackPlaceholder: 'Describe what should change…', sendFeedback: 'Save feedback', feedbackSent: 'Feedback saved for this session', noFeedback: 'No feedback yet', newConversation: 'New AI conversation', messagePlaceholder: 'Ask anything about this document…', ask: 'Ask' }, source: { count: (count) => `${count} source${count === 1 ? '' : 's'}`, type: { document: 'Document', minutes: 'Minutes', presentation: 'Presentation', audio: 'Audio', folder: 'Folder', file: 'File', message: 'Message', meeting: 'Meeting', todo: 'Action item' } },
        conclusion: { summary: 'Conclusion', time: 'Time', source: 'Sources' },
        personalTodos: { open: (count) => `${count} open`, overdue: (count) => `${count} overdue`, completed: (count) => `${count} completed`, tooltip: 'Personal action-item details' },
        cancelDialog: { title: 'Cancel this action item?', body: 'This only updates the current page session and cannot be undone in this demo.', keep: 'Keep action item', confirm: 'Cancel action item' }, actions: { back: 'Back to Projects', complete: 'Complete', cancel: 'Cancel', retry: 'Retry' },
      },
      pages: {
        tasks: ['Projects', 'Friday will organize projects, action items, and next steps from your work messages and meetings.', 'Back to Home'],
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
        layersLabel: 'Memory layer',
        layers: {
          context: { label: 'Context' },
          user: { label: 'User' },
        },
        sources: { all: 'All sources', dingtalk: 'DingTalk', feishu: 'Feishu', teams: 'Teams', file: 'File', conversation: 'Conversation' },
        sourceLabel: 'Source',
        searchLabel: 'Search current Memory',
        searchPlaceholder: 'Search current Memory',
        add: 'Add material',
        upload: 'Upload file',
        migration: 'Migrate data',
        uploadModal: { title: 'Upload file', description: 'In this local demo, choosing a work document only simulates a Memory result. The file is not uploaded or read.', choose: 'Choose file', cancel: 'Cancel', submit: 'Start adding' },
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
        status: { processing: 'Simulating a local Memory result…', completed: 'Local simulated result added to the map', failed: 'This local demo could not simulate a result', retry: 'Retry' },
        empty: { layer: 'There is no work memory ready to show yet.', source: 'This source has not formed Memory ready to show.', search: 'No related Memory found.', clearSource: 'Clear source filter', clearSearch: 'Clear search' },
        mapSummary: (layer, source, keyword, count) => `Showing the ${layer} Memory relationship map for ${source}${keyword ? `, searching for ${keyword}` : ''}, with ${count} visible Memory items.`,
      },
      settings: {
        title: 'Settings',
        close: 'Close Settings',
        saved: 'Saved',
        nav: { apps: 'Connected apps', general: 'General', profile: 'How Friday works for you' },
        discard: { title: 'Discard changes?', body: 'You have changes that have not been saved.', cancel: 'Keep editing', confirm: 'Discard changes' },
        apps: {
          title: 'Connected apps',
          subtitle: 'Choose where Friday can work with you.',
          demo: 'Demo only: changes stay in this browser. Friday does not start live authorization or process messages.',
          description: { dingtalk: 'Work messages and relevant updates', feishu: 'Team messages and shared documents', teams: 'Team chats, channels, and shared files' },
          status: { disconnected: 'Not connected', connected: 'Connected', 'needs-reconnect': 'Reconnect needed', connecting: 'Connecting…' },
          action: { connect: (name) => `Connect ${name}`, reconnect: (name) => `Reconnect ${name}`, disconnect: (name) => `Disconnect ${name}` },
          disconnect: { title: (name) => `Disconnect ${name}?`, body: (name) => `Friday will stop reading and handling new ${name} content. Existing Memory from ${name} stays available and can be managed separately in Memory.`, cancel: 'Cancel', confirm: (name) => `Disconnect ${name}` },
        },
        general: {
          title: 'General',
          subtitle: 'Set the conditions, rhythm, and alerts that stay in effect.',
          group: { title: 'Group chat handling', description: 'Decide which group messages Friday can consider.', summary: (enabled) => enabled ? '@ me and @everyone' : 'Only @ me', direct: 'Messages that @mention you are always considered.', everyone: 'Handle @everyone in group chats', confirmation: { title: 'Let Friday respond to @everyone?', body: 'Friday cannot know whether @everyone is intended for you. Only clear work requests will be considered.', cancel: 'Cancel', confirm: 'Enable anyway' } },
          rhythm: { title: 'Work rhythm', description: 'Give yourself time to reply before Friday steps in.', summary: (minutes, quiet) => `Wait ${minutes} min${quiet ? ` · Quiet ${quiet}` : ''}`, wait: 'Wait for me first', waitOptions: (minutes) => `${minutes} minute${minutes === 1 ? '' : 's'}`, quiet: 'Quiet hours', quietStart: 'Start', quietEnd: 'End', helper: 'If you reply first, Friday stays quiet. During quiet hours it may draft, but does not automatically send.' },
          notifications: { title: 'Notifications', description: 'Only alert me when an action is needed.', summary: (count) => `${count} enabled`, handoff: 'I need to take over', handoffDescription: 'Friday needs your judgment, reply, or action.', reconnect: 'A connection needs attention', reconnectDescription: 'A connected app needs to be reconnected or authorised again.', sendFailed: 'A reply did not send', sendFailedDescription: 'Friday produced a result but could not complete its active send.' },
          preferences: { title: 'Personal preferences' },
          language: { title: 'Language', description: 'Choose the language Friday uses throughout the workspace.', english: 'English', chinese: '中文' },
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
    login: {
      email: {
        eyebrow: '欢迎使用 Friday',
        title: '登录 Friday',
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
      nav: { home: 'Message', tasks: 'Task', memory: '记忆', feedback: '反馈', settings: '设置' },
      primaryNavigation: '主要导航',
      content: (label: string) => `${label}内容`,
      greeting: (name: string) => `欢迎回来，${name}`,
      unavailableNotifications: '通知暂不可用',
      openAccountMenu: '打开账户菜单',
      accountMenu: '账户菜单',
      signOut: '退出登录',
      home: {
        recent: '最近 24 小时',
        sources: { dingtalk: '钉钉', feishu: '飞书', teams: '微软 Teams' },
        source: '来源',
        allSources: '全部应用',
        question: '问题',
        reply: '回复',
        labelSeparator: '：',
        countdown: (seconds) => `${Math.floor(seconds / 60)}分${seconds % 60}秒后自动回复`,
        status: { waiting: '等待你先回复', processing: '正在处理', 'needs-confirmation': '待你确认', completed: '已处理', 'trial-complete': '试运行 · 已完成，未发送', 'send-failed': '发送失败', 'connection-error': '连接异常' },
        outcome: { sent: '已发送', cancelled: '已取消，Friday 未发送', 'self-replied': '你已回复，Friday 未发送', 'no-reply': '无需回复' },
        mode: {
          label: '运行模式',
          choices: { active: '启动', trial: '尝试', paused: '暂停' },
        },
        chart: {
          title: '24 小时消息处理总览', processed: '已处理', pending: '待处理', failed: '发送失败',
          legend: (totals) => `已处理 ${totals.processed} · 待处理 ${totals.pending} · 发送失败 ${totals.failed}`,
          hourLabel: (hour) => `${hour.hour}:00：已处理 ${hour.processed}，待处理 ${hour.pending}，发送失败 ${hour.failed}`,
          empty: '最近 24 小时暂无消息。',
        },
        empty: { loading: '正在加载最近事件…', error: '暂时无法加载最近事件，请重试。', noConnections: '连接一个工作应用后，Friday 才能开始处理消息。', events: '最近 24 小时暂无消息。', source: (source) => `最近 24 小时内没有来自${source}的工作消息。` },
        detail: { back: '返回最近 24 小时', eventInformation: '事件信息', source: '来源应用', conversation: '会话', sender: '发送人', time: '发生时间', status: '当前状态', result: '处理结果', originalMessage: '原消息', rationale: '执行依据', response: '回复', waiting: '等待你先回复，尚未开始处理。', processing: '正在生成回复…', paused: '已暂停', needsConfirmation: '需要你判断。', trialNote: '这条回复未发送。', editReply: '编辑回复' },
        feedback: { title: '内部反馈', matched: '符合我', adjust: '需要调整', placeholder: '哪里不对、以后应怎样处理或表达？', save: '保存反馈', saved: '反馈已记录', recipientTitle: '收件人反馈', recipientQuestion: '这条回复是否解决了你的问题？', helpful: '有帮助', unresolved: '未解决', recipientPending: '收件人反馈可用后会在这里展示。' },
        actions: { send: '发送', cancel: '取消', retry: '重试', goToSettings: '前往设置', clearSource: '查看全部应用' },
        confirmation: { title: (mode) => ({ active: '启动 Friday？', trial: '切换到尝试模式？', paused: '暂停 Friday？' })[mode], body: (mode) => ({ active: '此本地演示只会改变显示的运行状态；真实发送仍需要后端门禁。', trial: '后续回复只供你查看，不会发送。', paused: 'Friday 将停止处理新消息，直到你再次启动或尝试。' })[mode], confirm: (mode) => ({ active: '启动 Friday', trial: '切换到尝试', paused: '暂停 Friday' })[mode] },
      },
      message: {
        loading: '正在加载消息…', error: '消息暂时无法加载。', empty: '还没有需要处理的消息。', dateLocale: 'zh-CN',
        status: { all: '全部', pending: '待处理', processing: '处理中', 'needs-confirmation': '待确认', processed: '已处理', skipped: '已跳过', failed: '处理失败' },
        sources: { dingtalk: '钉钉', feishu: '飞书', teams: 'Teams', slack: 'Slack', wecom: '企微', discord: 'Discord' },
        categories: { chat: '聊天', document: '文档', approval: '审批', meeting: '会议' },
        list: {
          title: 'Message', subtitle: '集中查看 Friday 正在处理、等待你确认和已经完成的事项。', statusNavigation: 'Message 状态', label: 'Message 列表',
          columns: { statusTime: '状态与时间', metadata: '对象／来源／类别', question: '用户问题', handling: 'Friday 的处理', actions: '操作' },
          confirm: '确认', skip: '跳过', filteredEmpty: '这里还没有符合当前状态的消息。',
          aside: {
            filters: { title: '筛选', clear: '清除全部', source: '全部来源', category: '全部类别', subject: '全部会话', sender: '全部发起人' },
            sources: { title: '来源', apps: { dingtalk: '钉钉', feishu: '飞书', teams: 'Teams', slack: 'Slack', wecom: '企微', discord: 'Discord' } },
            activity: { title: '处理概览', rangeLabel: '统计范围', ranges: { '7d': '过去 7 天', '30d': '过去一个月', all: '全部' }, all: '消息总数', needsConfirmation: '待确认', processed: '已处理', failed: '处理失败' },
            smarter: { title: '让 Friday 更聪明', body: '连接更多应用并完善偏好设置，让 Friday 提供更贴合的帮助。', action: '前往设置' },
          },
        },
        detail: {
          back: '返回 Message', question: '用户问题', rationale: '判断依据', result: '回答／处理结果', tasks: '关联 Task', feedback: '反馈', feedbackPending: '处理完成后可反馈。', liked: '已点赞', disliked: (reason) => `点踩：${reason}`, references: '处理依据与材料',
          actions: '操作', noActions: '当前没有需要你执行的操作。', information: 'Message 信息', sender: '发送人', source: '来源', category: '类别', time: '时间', taskSummary: 'Task 汇总', timeline: '活动时间线',
        },
        feedbackControls: { upvote: '点赞', upvoteReason: '有帮助。', downvote: '点踩', reason: '反馈原因', submit: '提交反馈' },
      },
      onboarding: {
        progressLabel: '引导进度', steps: [{ label: '连接工作来源', description: '选择 Friday 可以使用的工作来源。' }, { label: '建立工作记忆', description: '确认范围，建立第一份工作记忆。' }, { label: '确认工作风格', description: '检查 Friday 提炼出的工作方式。' }, { label: '试运行', description: '先预览一条仅在本会话显示的回复。' }], welcome: { eyebrow: '欢迎使用 Friday', storyTitle: '准备好认识你的工作分身了吗？', title: '4 步完成配置', duration: '预计耗时 3 分钟', start: '开始配置', dismiss: '关闭欢迎弹窗', memoryAlt: '工作记忆概览' }, stepKicker: (step) => `第 ${step} 步，共 4 步`, actions: { cancel: '取消', continue: '继续' }, support: { apps: { title: '支持的工作应用', comingSoon: '即将支持' }, security: { title: '安全与权限', points: ['所有内容均在你的设备上本地预览。', '未经你的许可，我们不会访问数据。', '控制权始终在你手中。任何内容发送前都需批准。'], learnMore: '了解更多安全信息' }, teams: { title: '正在使用 Friday 的团队', subtitle: '深受团队信赖，让工作更聪明、更高效。', segments: ['产品', '运营', '管理', '市场'], detail: '加入快速成长的团队，借助 Friday 提升清晰度与协作效率。', stories: '查看客户故事' } },
        connection: { title: '连接你的工作应用', subtitle: '先连接一个应用即可开始，详细规则稍后在设置中调整。', scope: { dingtalk: '工作消息与日程', feishu: '团队消息与共享文档', teams: '消息与频道动态' }, connect: '连接', connected: '已连接', confirmTitle: (name) => `连接${name}`, confirmBody: '确认连接后继续。', complete: '完成连接', continueHint: '至少连接一个应用后继续。' },
        memory: { title: '建立你的工作记忆', subtitle: '先确认 Friday 将读取的范围，再建立第一份工作记忆。', signalsTitle: 'Friday 会读取什么', signals: { messages: ['工作消息', '对话、决策与待办'], documents: ['工作文档', '项目背景与关键结论'], calendar: ['日历信息', '会议、事件与时间安排'] }, findingsLabel: '已发现的工作信息', findings: { messages: [126, '工作消息'], documents: [18, '文档'], topics: [7, '重复工作主题'] }, migration: { title: '迁移已有工作记忆', body: '你可以在 Memory 中完成数据迁移。' }, confirm: '建立工作记忆', view: '查看工作记忆', proceed: '确认', scopeTitle: '选择要读取的应用', scopeHint: '可移除本次不想纳入工作记忆的应用。', readSelected: '读取所选应用', removeSource: (name) => `从本次工作记忆中移除${name}`, readingTitle: '正在读取已连接的工作信息', readingSubtitle: 'Friday 正在分析你已连接的消息与文档，建立你的工作记忆。', analysis: '正在分析已连接的信息…', analysisComplete: '分析完成' },
        style: { title: '确认你的工作风格', subtitle: '查看 Friday 从你的工作材料中提炼出的工作习惯。', summary: 'Friday 从你的工作材料里提炼出四类习惯。', points: ['表达：简洁直接；不确定会说清楚。', '判断：先确认事实、风险与负责人。', '下一步：更新后说清下一步。', '边界：承诺、敏感事项或信息不足，交给你。'], extract: '蒸馏工作风格', extractingTitle: '正在蒸馏你的工作风格', extractingSubtitle: 'Friday 正在分析你的工作上下文，起草你的工作风格。', analysis: '正在分析你的工作风格…', analysisComplete: '分析完成', editHint: '确认前可直接修改这份工作风格。', promptLabel: '工作风格提示词', usePrompt: '使用这份提示词', prompt: '表达方式\n使用简洁语言，直接说明不确定性。\n\n决策顺序\n先确认当前事实、风险、负责人和截止时间，再做出承诺。\n\n场景规则\n项目和会议更新后，给出下一步与负责人。\n\n必须交由本人\n承诺、敏感内容和信息不足时必须交由本人。' },
        trial: { title: '用一条问题试运行', subtitle: '试运行中，消息只会发给 Friday，不会发给同事。', suggestions: '不知道问什么？', questions: ['客户问：这个项目本周能交付吗？', '同事问：下周会议要准备什么？', '客户问：当前方案有什么风险？'], inputLabel: '试运行问题', placeholder: '输入一句工作问题，让 Friday 试着回复…', submit: '发送给 Friday', contextTitle: 'Friday 理解到的背景', context: '这是一次基于当前连接范围与已确认工作风格的试运行。', replyTitle: '建议回复', note: '试运行：本次回复只保留在当前会话，不会发送给任何联系人。调整要求会作为后续校准材料，但不会立即改写长期工作风格。', adjustLabel: '调整这次回复', adjustPlaceholder: '输入一句对当前试运行回复的调整要求', adjustAction: '重新生成' },
        activation: { start: '正式运行', confirmTitle: '正式启用 Friday？', confirmBody: '后续回复会按你设定的规则处理；真实发送仍需要后端门禁。', confirm: '确认正式运行', celebrating: 'Friday 正在为你准备工作空间', completeTitle: '你的工作分身已启用', completeBody: 'Friday 已准备好开始协助你工作', completeAction: '开始体验' },
      },

      feedback: {
        title: '反馈',
        subtitle: '来自同事评价和我的审核',
        demo: '本地演示数据',
        ranges: { '7d': '近 7 天', '30d': '近 30 天', all: '全部' },
        metrics: { feedbackCount: '收到反馈', coverageRate: '反馈覆盖率', positiveRate: '好评率', attentionCount: '需关注反馈' },
        trend: { title: '质量趋势', positive: '正向', negative: '负向', point: (point) => `${point.label}：正向 ${point.positive}，负向 ${point.negative}`, empty: '当前范围内暂无反馈趋势。' },
        sources: { title: '反馈来源', names: { recipient: '同事评价', owner: '我的审核' }, total: (name, count, rate) => `${name} ${count} · ${rate}%`, empty: '当前范围内暂无反馈来源。' },
        sentiment: { positive: '正向', negative: '需调整' },
        cards: { title: '反馈卡片', question: '问题', reply: '最终回答', note: '反馈原话', view: '查看详情', empty: '当前范围内还没有收集到反馈。' },
        detail: { title: '反馈详情', close: '关闭反馈详情', question: '完整问题', reply: '当时最终回复', feedback: '全部反馈', loading: '正在加载反馈详情…' },
        state: { loading: '正在载入演示反馈…' },
      },
      tasks: {
        loading: '正在加载项目…', error: '暂时无法加载项目，请稍后重试。', empty: '暂时没有沉淀出与你相关的项目。',
        dashboard: { title: '我的项目', projects: '参与项目', owned: (count) => `其中负责 ${count} 个`, myTodos: '我的行动项', myTodosHint: '已完成 / 未取消总数', attention: '需要关注', attentionHint: (overdue, blocked) => `${overdue} 项逾期 · ${blocked} 项仅阻塞` },
        list: { project: '项目', status: '当前状态', owner: '负责人', progress: '进展', personalTodos: '个人行动项' }, openTodos: (count) => `${count} 项待处理`, progress: (completed, total, percent) => `${completed}/${total} · ${percent}%`, fraction: (completed, total) => `${completed}/${total}`,
        projectStatus: { 'not-started': '未开始', 'in-progress': '进行中', overdue: '已逾期', completed: '已完成' }, todoStatus: { open: '待处理', completed: '已完成', cancelled: '已取消' }, priority: { high: 'P0', medium: 'P1', low: 'P2' },
        sections: { details: '项目概览', milestones: '当前进展', todos: '待办', conclusions: '结论', sources: '项目来源' },
        detail: { started: '项目启动时间', owner: '负责人', participants: '参与人', priority: '重要程度', status: '当前状态', goal: '项目目标', background: '背景', progress: '当前进展', blocker: '阻塞点', nextStep: '下一步', recentChange: '最近变化' },
        document: { detail: '详情', projectDetail: '项目详情', open: '打开文件', backToProject: (project) => '返回 ' + project, preview: '预览', edit: '编辑', save: '保存修改', saved: '已保存到当前会话', titleLabel: '文档标题', bodyLabel: '文档正文' },
        milestone: { current: '当前里程碑', due: '截止时间', progress: '进度', completed: '已完成', active: '进行中', upcoming: '未开始', openLinkedActions: '查看关联行动项' },
        todo: { owner: '负责人', item: '待办', progress: '状态', due: '截止日期', completedAt: '完成时间', source: '来源', aiProduct: 'AI 产品', actions: '操作', noDue: '暂无截止日期', empty: '暂无待办', openAiProduct: '查看草稿', noAiProduct: '暂无生成内容' }, aiProductDocument: { label: 'AI 产品文档', backToProject: (project) => `返回 ${project}`, actionItem: '关联行动项', sourceCount: (count) => `关联 ${count} 个来源`, titleLabel: '文档标题', bodyLabel: '文档正文', draft: '草稿', save: '保存修改', saved: '已保存到当前会话', openCopilot: '打开 AI 助手', closeCopilot: '关闭 AI 助手', copilotTitle: 'AI 助手', copilotHint: '查看当前草稿并记录反馈；不会自动覆盖正文或发送给外部对象。', feedback: '反馈', feedbackPlaceholder: '描述需要调整的内容…', sendFeedback: '保存反馈', feedbackSent: '反馈已保存到当前会话', noFeedback: '暂未记录反馈', newConversation: '新建 AI 对话', messagePlaceholder: '万事问 AI…', ask: '问问' }, source: { count: (count) => `${count} 个来源`, type: { document: '文档', minutes: '听记', presentation: 'PPT', audio: '音频', folder: '文件夹', file: '文件', message: '工作消息', meeting: '会议', todo: '行动项' } },
        conclusion: { summary: '结论', time: '时间', source: '来源' },
        personalTodos: { open: (count) => `${count} 项待处理`, overdue: (count) => `${count} 项逾期`, completed: (count) => `${count} 项已完成`, tooltip: '个人行动项详情' },
        cancelDialog: { title: '取消这项行动项？', body: '这只会更新当前页面会话内的演示数据，且本次演示中无法恢复。', keep: '保留行动项', confirm: '确认取消' }, actions: { back: '返回项目', complete: '完成', cancel: '取消', retry: '重试' },
      },
      pages: {
        tasks: ['项目', 'Friday 会从工作消息和会议中整理项目、行动项与下一步。', '返回首页'],
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
        layersLabel: '记忆层',
        layers: {
          context: { label: '上下文' },
          user: { label: '用户' },
        },
        sources: { all: '全部来源', dingtalk: '钉钉', feishu: '飞书', teams: '微软 Teams', file: '文件', conversation: '对话' },
        sourceLabel: '来源',
        searchLabel: '搜索当前工作记忆',
        searchPlaceholder: '搜索当前工作记忆',
        add: '添加资料',
        upload: '上传文件',
        migration: '数据迁移',
        uploadModal: { title: '上传文件', description: '仅在本地演示：选择工作资料只会模拟一条工作记忆结果，文件不会上传或读取。', choose: '选择文件', cancel: '取消', submit: '开始添加' },
        migrationModal: {
          title: '数据迁移',
          description: '先在你的对话工具中使用这段提示词，将工作相关内容整理成 Markdown。',
          prompt: '请将当前工作中的对话整理为一份 Markdown 文档。\n保留项目背景、已确认的决策、待办、工作偏好和关键结论；\n移除个人生活及非工作内容；不要补充未出现的信息。',
          copy: '复制提示词',
          next: '下一步',
          back: '返回',
          choose: '选择 Markdown 文件',
          submit: '开始迁移',
        },
        status: { processing: '正在模拟本地工作记忆结果…', completed: '本地模拟结果已加入关系图', failed: '本地演示暂时无法模拟结果', retry: '重试' },
        empty: { layer: '还没有可呈现的工作记忆', source: '这个来源还没有形成可呈现的工作记忆', search: '没有找到相关的工作记忆', clearSource: '清除筛选', clearSearch: '清除搜索' },
        mapSummary: (layer, source, keyword, count) => `正在显示${layer}层，${source}的工作记忆关系图${keyword ? `，搜索：${keyword}` : ''}，共${count}项可见工作记忆。`,
      },
      settings: {
        title: '设置',
        close: '关闭设置',
        saved: '已保存',
        nav: { apps: '已连接的应用', general: '通用', profile: 'Friday 如何为你工作' },
        discard: { title: '放弃更改？', body: '你有尚未保存的更改。', cancel: '继续编辑', confirm: '放弃更改' },
        apps: {
          title: '已连接的应用',
          subtitle: '选择 Friday 可以在哪里与你一起工作。',
          demo: '仅为演示：更改只保留在此浏览器中。Friday 不会开始真实授权或处理消息。',
          description: { dingtalk: '工作消息与相关动态', feishu: '团队消息与共享文档', teams: '团队聊天、频道与共享文件' },
          status: { disconnected: '未连接', connected: '已连接', 'needs-reconnect': '需要重新连接', connecting: '正在连接…' },
          action: { connect: (name) => `连接${name}`, reconnect: (name) => `重新连接${name}`, disconnect: (name) => `断开${name}` },
          disconnect: { title: (name) => `断开${name}？`, body: (name) => `Friday 将停止读取和处理新的${name}内容。此前从${name}沉淀的工作记忆会保留；你可以稍后在工作记忆中单独管理它。`, cancel: '取消', confirm: (name) => `断开${name}` },
        },
        general: {
          title: '通用',
          subtitle: '设置长期生效的处理条件、工作节奏和提醒。',
          group: { title: '群聊处理条件', description: '决定 Friday 可以考虑哪些群聊消息。', summary: (enabled) => enabled ? '@ 我和 @所有人' : '仅 @ 我', direct: '群聊中明确 @ 你的消息始终会被考虑。', everyone: '处理群聊中的 @所有人', confirmation: { title: '让 Friday 响应 @所有人？', body: 'Friday 无法确认 @所有人 是否只针对你。只有明确的工作请求才会被处理。', cancel: '取消', confirm: '仍然开启' } },
          rhythm: { title: '工作节奏', description: '在 Friday 介入前，先给你留出亲自回复的时间。', summary: (minutes, quiet) => `等待 ${minutes} 分钟${quiet ? ` · 免打扰 ${quiet}` : ''}`, wait: '先等我处理', waitOptions: (minutes) => `${minutes} 分钟`, quiet: '免打扰时段', quietStart: '开始', quietEnd: '结束', helper: '如果你已亲自回复，Friday 会保持安静。免打扰时段内它仍可生成草稿，但不会自动发送。' },
          notifications: { title: '通知', description: '只在需要你采取行动时提醒。', summary: (count) => `${count} 项已开启`, handoff: '需要我接管', handoffDescription: 'Friday 需要你亲自判断、回复或处理。', reconnect: '连接需要处理', reconnectDescription: '已连接应用需要重新连接或再次授权。', sendFailed: '回复未成功发送', sendFailedDescription: 'Friday 已产生结果，但未能完成正式发送。' },
          preferences: { title: '个人偏好' },
          language: { title: '语言', description: '选择 Friday 在整个工作台中使用的语言。', english: 'English', chinese: '中文' },
          save: '保存更改',
        },
        profile: {
          title: '个人资料',
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
          memory: '去工作记忆查看来源',
          feedback: '去反馈校准不准确的地方',
          save: '保存身份信息',
        },
        safety: {
          title: '安全边界',
          description: 'Friday 始终会把关键决定交还给你。',
          summary: '承诺 · 敏感事项 · 信息不足 · 要求本人',
          items: ['代表你作出对外承诺、价格、合同或关键决策', '处理人事、财务、客户等敏感议题', '在关键信息、材料或对象不明确时猜测', '在对方明确要求你本人时继续代答'],
          handoff: '遇到以上情况，Friday 会生成清晰的转交说明，并在首页通知你处理。',
          always: '这些规则始终生效。',
        },
      },
    },
  },
}
