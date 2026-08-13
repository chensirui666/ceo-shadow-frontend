import { canProvideMessageFeedback, messageStatuses } from '../messageState.ts'
import type { Message, MessageFeedback, MessageStatus } from '../messageState.ts'
import { MessageFeedbackControls } from './MessageFeedbackControls.tsx'

type MessageListProps = {
  messages: Message[]
  status: MessageStatus | 'all'
  onConfirm: (id: string) => void
  onFeedback: (id: string, feedback: MessageFeedback) => void
  onOpen: (id: string) => void
  onSkip: (id: string) => void
  onStatusChange: (status: MessageStatus | 'all') => void
}

const statusLabels: Record<MessageStatus | 'all', string> = {
  all: '全部', pending: '待处理', processing: '处理中', 'needs-confirmation': '待确认', processed: '已处理', skipped: '已跳过', failed: '处理失败',
}

const sourceLabels = { dingtalk: '钉钉', feishu: '飞书', teams: 'Teams' }

export default function MessageList({ messages, status, onConfirm, onFeedback, onOpen, onSkip, onStatusChange }: MessageListProps) {
  const visibleMessages = status === 'all' ? messages : messages.filter((message) => message.status === status)
  const sourceCount = new Set(visibleMessages.map((message) => message.source)).size

  return <section aria-labelledby="message-list-title" className="message-list">
    <header><h1 id="message-list-title">消息</h1><p>集中查看 Friday 正在处理、等待你确认和已经完成的事项。</p></header>
    <nav aria-label="消息状态"><button aria-pressed={status === 'all'} onClick={() => onStatusChange('all')} type="button">全部 {messages.length}</button>{messageStatuses.map((item) => <button aria-pressed={status === item} key={item} onClick={() => onStatusChange(item)} type="button">{statusLabels[item]} {messages.filter((message) => message.status === item).length}</button>)}</nav>
    <div className="message-list-layout">
      <section aria-label="消息列表">
        <div className="message-list-columns" role="row"><span>状态与时间</span><span>对象／来源／类别</span><span>用户问题</span><span>Friday 的处理</span><span>操作</span></div>
        {visibleMessages.length ? visibleMessages.map((message) => <article className="message-list-row" key={message.id}>
          <button className="message-list-open" onClick={() => onOpen(message.id)} title={`${message.question}\n${message.result}`} type="button">
            <span>{statusLabels[message.status]}<time dateTime={message.receivedAt}>{new Date(message.receivedAt).toLocaleString('zh-CN')}</time></span>
            <span>{message.subject}<small>{message.sender} · {sourceLabels[message.source]} · {message.category}</small></span>
            <span>{message.question}</span><span>{message.result}</span>
          </button>
          <span className="message-list-actions">{message.status === 'needs-confirmation' && <><button onClick={(event) => { event.stopPropagation(); onConfirm(message.id) }} type="button">确认</button><button onClick={(event) => { event.stopPropagation(); onSkip(message.id) }} type="button">跳过</button></>}{canProvideMessageFeedback(message) && <MessageFeedbackControls id={message.id} onFeedback={onFeedback} stopPropagation />}</span>
        </article>) : <p className="message-empty">这里还没有符合当前状态的消息。</p>}
      </section>
      <aside aria-label="快捷概览" className="message-list-quick"><h2>快捷概览</h2><p>当前筛选：{statusLabels[status]}</p><p>消息 {visibleMessages.length} 条</p><p>来源 {sourceCount} 个</p><ul>{[...new Set(visibleMessages.map((message) => message.source))].map((source) => <li key={source}>{sourceLabels[source]}</li>)}</ul></aside>
    </div>
  </section>
}
