export const homeSources = ['dingtalk', 'feishu', 'teams'] as const

export type HomeSource = typeof homeSources[number]
export type OperatingMode = 'trial' | 'active' | 'paused'
export type HomeStatus = 'waiting' | 'processing' | 'needs-confirmation' | 'completed' | 'trial-complete' | 'send-failed' | 'connection-error'
export type HomeOutcome = 'sent' | 'cancelled' | 'self-replied' | 'no-reply'
export type OwnerFeedback = { kind: 'matched' | 'adjust'; note: string }
export type HomeEvent = {
  id: string
  source: HomeSource
  conversation?: string
  sender: string
  receivedAt: string
  status: HomeStatus
  outcome?: HomeOutcome
  question: string
  reply?: string
  rationale: string
  waitUntil?: string
  ownerFeedback?: OwnerFeedback
}
export type HomeSnapshot = { mode: OperatingMode; connectedSources: HomeSource[]; events: HomeEvent[] }
export type ActivityHour = { hour: string; processed: number; pending: number; failed: number }

const at = (now: Date, minutes: number) => new Date(now.getTime() + minutes * 60_000).toISOString()

export const createDemoHomeSnapshot = (now = new Date(), locale: 'en' | 'zh' = 'zh'): HomeSnapshot => ({
  mode: 'active',
  connectedSources: [...homeSources],
  events: locale === 'en'
    ? [
        { id: 'waiting', source: 'feishu', conversation: 'Product launch group', sender: 'Lena Liu', receivedAt: at(now, -3), status: 'waiting', question: 'Can we confirm next week’s launch date?', reply: 'We are targeting next Wednesday. I’ll share the final schedule on Monday.', rationale: 'Waiting for your reply before taking action.', waitUntil: at(now, 2) },
        { id: 'processing', source: 'dingtalk', conversation: 'Engineering sync', sender: 'Ethan Zhou', receivedAt: at(now, -27), status: 'processing', question: 'Can we reconfirm the rollout scope?', rationale: 'Reviewing context and drafting a reply.' },
        { id: 'needs-confirmation', source: 'feishu', conversation: 'Client delivery group', sender: 'Owen Zhao', receivedAt: at(now, -52), status: 'needs-confirmation', question: 'Can we commit to completing delivery this month?', reply: 'We are working toward delivery this month and will confirm the final resourcing plan this week.', rationale: 'This is a delivery commitment and needs your confirmation before we reply.' },
        { id: 'sent', source: 'dingtalk', sender: 'Nina Wang', receivedAt: at(now, -91), status: 'completed', outcome: 'sent', question: 'Can you share the weekly meeting conclusions?', reply: 'Yes. I’ll share this week’s conclusions and open items this afternoon.', rationale: 'This follows your current rules, so the reply was sent automatically.' },
        { id: 'trial-complete', source: 'teams', conversation: 'Project channel', sender: 'Maya', receivedAt: at(now, -138), status: 'trial-complete', question: 'Can you share the launch checklist?', reply: 'I will share the updated launch checklist after today’s review.', rationale: 'In trial mode, this reply is for your review only and will not be sent.' },
        { id: 'no-reply', source: 'dingtalk', sender: 'System notification', receivedAt: at(now, -219), status: 'completed', outcome: 'no-reply', question: 'Meeting room booking updated', rationale: 'This is a notification and does not need a reply.' },
        { id: 'send-failed', source: 'feishu', sender: 'Alex Chen', receivedAt: at(now, -284), status: 'send-failed', question: 'Has the budget sheet been updated?', reply: 'The budget sheet is updated. I’ll add this week’s change notes.', rationale: 'The Feishu connection expired, so the reply was not sent.' },
        { id: 'connection-error', source: 'teams', sender: 'System', receivedAt: at(now, -347), status: 'connection-error', question: 'Teams connection issue', rationale: 'Friday cannot access Teams right now, so it did not process new messages.' },
      ]
    : [
        { id: 'waiting', source: 'feishu', conversation: '产品项目群', sender: '刘晨', receivedAt: at(now, -3), status: 'waiting', question: '下周的上线时间能确定吗？', reply: '目前计划在下周三完成上线，我会在周一同步最终排期。', rationale: '等待你先回复，尚未开始处理。', waitUntil: at(now, 2) },
        { id: 'processing', source: 'dingtalk', conversation: '研发协同群', sender: '周航', receivedAt: at(now, -27), status: 'processing', question: '灰度范围能再确认一下吗？', rationale: '正在整理上下文并生成回复。' },
        { id: 'needs-confirmation', source: 'feishu', conversation: '客户交付群', sender: '赵明', receivedAt: at(now, -52), status: 'needs-confirmation', question: '是否可以承诺本月完成交付？', reply: '我们会以本月完成交付为目标，并在本周确认最终资源安排。', rationale: '涉及交付时间承诺，需要你确认后再回复。' },
        { id: 'sent', source: 'dingtalk', sender: '王琳', receivedAt: at(now, -91), status: 'completed', outcome: 'sent', question: '周会结论可以同步吗？', reply: '可以，今天下午我会同步本周的结论和待确认事项。', rationale: '符合当前处理规则，回复已自动发送。' },
        { id: 'trial-complete', source: 'teams', conversation: '项目频道', sender: 'Maya', receivedAt: at(now, -138), status: 'trial-complete', question: '可以分享一下上线检查清单吗？', reply: '今天评审结束后，我会分享更新后的上线检查清单。', rationale: '试运行中，回复只供你查看，不会发送。' },
        { id: 'no-reply', source: 'dingtalk', sender: '系统通知', receivedAt: at(now, -219), status: 'completed', outcome: 'no-reply', question: '会议室预订已更新', rationale: '这是一条通知信息，无需回复。' },
        { id: 'send-failed', source: 'feishu', sender: '陈晓', receivedAt: at(now, -284), status: 'send-failed', question: '预算表已经更新了吗？', reply: '预算表已更新，我会补充本周的变更说明。', rationale: '飞书连接已失效，回复未发送。' },
        { id: 'connection-error', source: 'teams', sender: '系统', receivedAt: at(now, -347), status: 'connection-error', question: 'Teams 连接异常', rationale: 'Friday 暂时无法使用 Teams，因此没有继续处理新的消息。' },
      ],
})

export const localizedHomeSnapshot = (snapshot: HomeSnapshot, locale: 'en' | 'zh'): HomeSnapshot => {
  const fixture = new Map(createDemoHomeSnapshot(new Date(0), locale).events.map((event) => [event.id, event]))
  const alternateFixture = new Map(createDemoHomeSnapshot(new Date(0), locale === 'en' ? 'zh' : 'en').events.map((event) => [event.id, event]))
  return {
    ...snapshot,
    events: snapshot.events.map((event) => {
      const copy = fixture.get(event.id)
      if (!copy) return event
      const progressed = event.id === 'waiting' && event.status === 'processing'
      const resolved = event.id === 'needs-confirmation' && event.status === 'completed'
      const hasFixtureReply = Boolean(event.reply) && [copy.reply, alternateFixture.get(event.id)?.reply].includes(event.reply)
      return {
        ...event,
        conversation: copy.conversation,
        sender: copy.sender,
        question: copy.question,
        reply: progressed ? undefined : resolved ? hasFixtureReply ? copy.reply : event.reply : copy.reply,
        rationale: progressed
          ? locale === 'en' ? 'Reviewing context and drafting a reply.' : '正在整理上下文并生成回复。'
          : resolved
            ? event.outcome === 'sent'
              ? locale === 'en' ? 'The reply was sent.' : '回复已发送。'
              : locale === 'en' ? 'Sending was cancelled; Friday did not send this reply.' : '已取消发送；Friday 未发送这条回复。'
            : copy.rationale,
      }
    }),
  }
}

export const selectHomeEvents = (snapshot: HomeSnapshot, source: HomeSource | 'all'): HomeEvent[] => (
  source === 'all' ? snapshot.events : snapshot.events.filter((event) => event.source === source)
)

export const activityHours = (events: HomeEvent[], now: Date): ActivityHour[] => {
  const start = new Date(now)
  start.setUTCMinutes(0, 0, 0)
  start.setUTCHours(start.getUTCHours() - 23)

  return Array.from({ length: 24 }, (_, index) => {
    const time = new Date(start)
    time.setUTCHours(start.getUTCHours() + index)
    const hourEvents = events.filter((event) => event.receivedAt.slice(0, 13) === time.toISOString().slice(0, 13))
    return {
      hour: time.toISOString().slice(11, 13),
      processed: hourEvents.filter((event) => event.status === 'completed' || event.status === 'trial-complete').length,
      pending: hourEvents.filter((event) => event.status === 'waiting' || event.status === 'processing' || event.status === 'needs-confirmation').length,
      failed: hourEvents.filter((event) => event.status === 'send-failed').length,
    }
  })
}

export const modeChangeNeedsConfirmation = (from: OperatingMode, to: OperatingMode): boolean => (
  from !== to
)

export const setOperatingMode = (snapshot: HomeSnapshot, mode: OperatingMode): HomeSnapshot => ({ ...snapshot, mode })

export const progressWaitingEvents = (snapshot: HomeSnapshot, now: Date): HomeSnapshot => {
  if (snapshot.mode === 'paused') return snapshot
  let progressed = false
  const events = snapshot.events.map((event) => {
    if (event.status !== 'waiting' || !event.waitUntil || new Date(event.waitUntil).getTime() > now.getTime()) return event
    progressed = true
    return { ...event, status: 'processing' as const, rationale: '正在整理上下文并生成回复。', waitUntil: undefined }
  })
  return progressed ? { ...snapshot, events } : snapshot
}

export const resolveConfirmation = (snapshot: HomeSnapshot, eventId: string, decision: 'send' | 'cancel', reply: string): HomeSnapshot => ({
  ...snapshot,
  events: snapshot.events.map((event) => event.id !== eventId || event.status !== 'needs-confirmation' ? event : {
    ...event,
    status: 'completed',
    outcome: decision === 'send' ? 'sent' : 'cancelled',
    reply,
    rationale: decision === 'send' ? '回复已发送。' : '已取消发送；Friday 未发送这条回复。',
  }),
})

export const recordOwnerFeedback = (snapshot: HomeSnapshot, eventId: string, feedback: OwnerFeedback): HomeSnapshot => ({
  ...snapshot,
  events: snapshot.events.map((event) => event.id !== eventId || !event.reply ? event : { ...event, ownerFeedback: feedback }),
})
