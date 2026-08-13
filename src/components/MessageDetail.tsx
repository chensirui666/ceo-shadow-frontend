import { Button } from '@heroui/react'
import { canProvideMessageFeedback } from '../messageState.ts'
import type { MessageCopy } from '../content/translations.ts'
import type { Message, MessageFeedback } from '../messageState.ts'
import { MessageFeedbackControls } from './MessageFeedbackControls.tsx'

type MessageDetailProps = {
  copy: MessageCopy
  message: Message
  onBack: () => void
  onConfirm: (id: string) => void
  onFeedback: (id: string, feedback: MessageFeedback) => void
  onSkip: (id: string) => void
}

export default function MessageDetail({ copy, message, onBack, onConfirm, onFeedback, onSkip }: MessageDetailProps) {
  const canDecide = message.status === 'needs-confirmation'
  return <section aria-labelledby="message-detail-title" className="message-detail">
    <header className="message-detail-header"><Button className="message-detail-back" onPress={onBack} type="button" variant="ghost">{copy.detail.back}</Button><div className="message-detail-title"><h1 id="message-detail-title">{message.subject}</h1><span className={`message-detail-status message-detail-status-${message.status}`}>{copy.status[message.status]}</span></div><div className="message-detail-meta"><span><strong>{copy.detail.sender}</strong>{message.sender}</span><span><strong>{copy.detail.source}</strong>{copy.sources[message.source]}</span><span><strong>{copy.detail.category}</strong>{message.category}</span><span><strong>{copy.detail.time}</strong><time dateTime={message.receivedAt}>{new Date(message.receivedAt).toLocaleString(copy.dateLocale)}</time></span></div></header>
    <div className="message-detail-layout"><main className="message-detail-reading">
      <section className="message-detail-card"><h2>{copy.detail.question}</h2><p>{message.question}</p></section>
      <section className="message-detail-card"><h2>{copy.detail.rationale}</h2><p>{message.rationale}</p></section>
      <section className="message-detail-card message-detail-result"><h2>{copy.detail.result}</h2><p>{message.result}</p></section>
      <section className="message-detail-card"><h2>{copy.detail.tasks}</h2><p>{message.taskSummary}</p></section>
      <section className="message-detail-card"><h2>{copy.detail.feedback}</h2>{canProvideMessageFeedback(message) ? <MessageFeedbackControls copy={copy.feedbackControls} id={message.id} onFeedback={onFeedback} /> : <p>{copy.detail.feedbackPending}</p>}{message.feedback.map((feedback, index) => <p key={`${feedback.rating}-${index}`}>{feedback.rating === 'up' ? copy.detail.liked : copy.detail.disliked(feedback.reason)}</p>)}</section>
      <details className="message-detail-references"><summary>{copy.detail.references}</summary><ul>{message.references.map((reference) => <li key={reference}>{reference}</li>)}</ul></details>
    </main><aside className="message-detail-aside">
      <section><h2>{copy.detail.actions}</h2>{canDecide ? <><Button onPress={() => onConfirm(message.id)} type="button">{copy.list.confirm}</Button><Button onPress={() => onSkip(message.id)} type="button" variant="secondary">{copy.list.skip}</Button></> : <p>{copy.detail.noActions}</p>}</section>
      <section><h2>{copy.detail.information}</h2><p><strong>{copy.detail.sender}</strong> {message.sender}</p><p><strong>{copy.detail.source}</strong> {copy.sources[message.source]}</p><p><strong>{copy.detail.category}</strong> {message.category}</p><p><strong>{copy.detail.time}</strong> <time dateTime={message.receivedAt}>{new Date(message.receivedAt).toLocaleString(copy.dateLocale)}</time></p></section>
      <section><h2>{copy.detail.taskSummary}</h2><p>{message.taskSummary}</p></section>
      <section><h2>{copy.detail.timeline}</h2><ol>{message.timeline.map((item) => <li key={item}>{item}</li>)}</ol></section>
    </aside></div>
  </section>
}
