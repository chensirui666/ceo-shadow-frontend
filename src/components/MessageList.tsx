import { Button } from '@heroui/react'
import { Check, Clock, SkipForward } from 'lucide-react'
import { connectorLogos } from '../content/connectorLogos.ts'
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

const shortTime = (value: string, locale: string) => new Intl.DateTimeFormat(locale, {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(value))

export default function MessageList({ copy, messages, status, onConfirm, onFeedback, onOpen, onSkip, onStatusChange }: MessageListProps) {
  const visibleMessages = status === 'all' ? messages : messages.filter((message) => message.status === status)
  const sourceCounts = [...new Set(messages.map((message) => message.source))]
    .map((source) => ({ source, count: messages.filter((message) => message.source === source).length }))
    .sort((a, b) => b.count - a.count)
  const count = (item: MessageStatus) => messages.filter((message) => message.status === item).length

  return <section aria-labelledby="message-list-title" className="message-list">
    <header className="message-list-header"><h1 id="message-list-title">{copy.list.title}</h1><p>{copy.list.subtitle}</p></header>
    <nav aria-label={copy.list.statusNavigation} className="message-status-tabs"><button aria-pressed={status === 'all'} onClick={() => onStatusChange('all')} type="button">{copy.status.all} {messages.length}</button>{messageStatuses.map((item) => <button aria-pressed={status === item} key={item} onClick={() => onStatusChange(item)} type="button">{copy.status[item]} {count(item)}</button>)}</nav>
    <div className="message-list-layout">
      <section aria-label={copy.list.label} className="message-list-stream">
        <div className="message-list-columns"><span>{copy.list.columns.statusTime}</span><span>{copy.list.columns.metadata}</span><span>{copy.list.columns.question}</span><span>{copy.list.columns.handling}</span><span>{copy.list.columns.actions}</span></div>
        {visibleMessages.length ? visibleMessages.map((message) => <article className="message-list-row" key={message.id}>
          <button className="message-list-open" onClick={() => onOpen(message.id)} title={`${message.question}\n${message.result}`} type="button">
            <span className={`message-list-status message-list-status-${message.status}`}><strong><i aria-hidden="true" className="message-list-status-dot" />{copy.status[message.status]}</strong><time className="message-list-time" dateTime={message.receivedAt}><Clock aria-hidden="true" />{shortTime(message.receivedAt, copy.dateLocale)}</time></span>
            <span className="message-list-object" title={message.subject}><span aria-hidden="true" className="message-list-avatar">{message.sender.slice(0, 1)}</span><span className="message-list-identity"><strong>{message.sender}</strong><span className="message-list-source"><img alt="" className="message-list-source-icon" src={connectorLogos[message.source]} />{copy.sources[message.source]}</span><small className="message-list-category">{message.category}</small></span></span>
            <span className="message-list-clamp" title={message.question}>{message.question}</span><span className="message-list-clamp" title={message.result}>{message.result}</span>
          </button>
          <span className="message-list-actions">{message.status === 'needs-confirmation' && <><button className="message-list-action-confirm" onClick={(event) => { event.stopPropagation(); onConfirm(message.id) }} type="button"><Check aria-hidden="true" />{copy.list.confirm}</button><button className="message-list-action-skip" onClick={(event) => { event.stopPropagation(); onSkip(message.id) }} type="button"><SkipForward aria-hidden="true" />{copy.list.skip}</button></>}{canProvideMessageFeedback(message) && <MessageFeedbackControls copy={copy.feedbackControls} id={message.id} onFeedback={onFeedback} stopPropagation />}</span>
        </article>) : <p className="message-empty">{copy.list.filteredEmpty}</p>}
      </section>
      <aside aria-label={copy.list.quick.label} className="message-list-quick">
        <section className="message-list-quick-filters"><h2>{copy.list.statusNavigation}</h2><Button aria-pressed={status === 'needs-confirmation'} onPress={() => onStatusChange('needs-confirmation')} type="button" variant="ghost"><span>{copy.status['needs-confirmation']}</span> <strong>{count('needs-confirmation')}</strong></Button><Button aria-pressed={status === 'failed'} onPress={() => onStatusChange('failed')} type="button" variant="ghost"><span>{copy.status.failed}</span> <strong>{count('failed')}</strong></Button></section>
        <section className="message-list-sources"><h2>{copy.detail.source}</h2><ul>{sourceCounts.map(({ source, count: sourceCount }) => <li key={source}><span>{copy.sources[source]}</span><strong>{sourceCount}</strong></li>)}</ul></section>
        <section className="message-list-summary"><h2>{copy.list.quick.title}<span className="sr-only">{copy.list.quick.messages(messages.length)}</span></h2><dl><div><dt>{copy.status.all}</dt><dd>{messages.length}</dd></div><div><dt>{copy.status['needs-confirmation']}</dt><dd>{count('needs-confirmation')}</dd></div><div><dt>{copy.status.processed}</dt><dd>{count('processed')}</dd></div><div><dt>{copy.status.failed}</dt><dd>{count('failed')}</dd></div></dl></section>
      </aside>
    </div>
  </section>
}
