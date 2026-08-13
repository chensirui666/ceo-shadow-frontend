import { canProvideMessageFeedback, messageStatuses } from '../messageState.ts'
import type { MessageCopy } from '../content/translations.ts'
import type { Message, MessageFeedback, MessageStatus } from '../messageState.ts'
import { MessageFeedbackControls } from './MessageFeedbackControls.tsx'

type MessageListProps = {
  copy: MessageCopy
  messages: Message[]
  status: MessageStatus | 'all'
  onConfirm: (id: string) => void
  onFeedback: (id: string, feedback: MessageFeedback) => void
  onOpen: (id: string) => void
  onSkip: (id: string) => void
  onStatusChange: (status: MessageStatus | 'all') => void
}

export default function MessageList({ copy, messages, status, onConfirm, onFeedback, onOpen, onSkip, onStatusChange }: MessageListProps) {
  const visibleMessages = status === 'all' ? messages : messages.filter((message) => message.status === status)
  const sourceCount = new Set(visibleMessages.map((message) => message.source)).size

  return <section aria-labelledby="message-list-title" className="message-list">
    <header><h1 id="message-list-title">{copy.list.title}</h1><p>{copy.list.subtitle}</p></header>
    <nav aria-label={copy.list.statusNavigation}><button aria-pressed={status === 'all'} onClick={() => onStatusChange('all')} type="button">{copy.status.all} {messages.length}</button>{messageStatuses.map((item) => <button aria-pressed={status === item} key={item} onClick={() => onStatusChange(item)} type="button">{copy.status[item]} {messages.filter((message) => message.status === item).length}</button>)}</nav>
    <div className="message-list-layout">
      <section aria-label={copy.list.label}>
        <div className="message-list-columns" role="row"><span>{copy.list.columns.statusTime}</span><span>{copy.list.columns.metadata}</span><span>{copy.list.columns.question}</span><span>{copy.list.columns.handling}</span><span>{copy.list.columns.actions}</span></div>
        {visibleMessages.length ? visibleMessages.map((message) => <article className="message-list-row" key={message.id}>
          <button className="message-list-open" onClick={() => onOpen(message.id)} title={`${message.question}\n${message.result}`} type="button">
            <span>{copy.status[message.status]}<time dateTime={message.receivedAt}>{new Date(message.receivedAt).toLocaleString(copy.dateLocale)}</time></span>
            <span>{message.subject}<small>{message.sender} · {copy.sources[message.source]} · {message.category}</small></span>
            <span>{message.question}</span><span>{message.result}</span>
          </button>
          <span className="message-list-actions">{message.status === 'needs-confirmation' && <><button onClick={(event) => { event.stopPropagation(); onConfirm(message.id) }} type="button">{copy.list.confirm}</button><button onClick={(event) => { event.stopPropagation(); onSkip(message.id) }} type="button">{copy.list.skip}</button></>}{canProvideMessageFeedback(message) && <MessageFeedbackControls copy={copy.feedbackControls} id={message.id} onFeedback={onFeedback} stopPropagation />}</span>
        </article>) : <p className="message-empty">{copy.list.filteredEmpty}</p>}
      </section>
      <aside aria-label={copy.list.quick.label} className="message-list-quick"><h2>{copy.list.quick.title}</h2><p>{copy.list.quick.filter(copy.status[status])}</p><p>{copy.list.quick.messages(visibleMessages.length)}</p><p>{copy.list.quick.sources(sourceCount)}</p><ul>{[...new Set(visibleMessages.map((message) => message.source))].map((source) => <li key={source}>{copy.sources[source]}</li>)}</ul></aside>
    </div>
  </section>
}
