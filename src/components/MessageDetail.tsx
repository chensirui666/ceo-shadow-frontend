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
    <header><button onClick={onBack} type="button">{copy.detail.back}</button><h1 id="message-detail-title">{message.subject}</h1></header>
    <div className="message-detail-layout"><main>
      <section><h2>{copy.detail.question}</h2><p>{message.question}</p></section>
      <section><h2>{copy.detail.rationale}</h2><p>{message.rationale}</p></section>
      <section><h2>{copy.detail.result}</h2><p>{message.result}</p></section>
      <section><h2>{copy.detail.tasks}</h2><p>{message.taskSummary}</p></section>
      <section><h2>{copy.detail.feedback}</h2>{canProvideMessageFeedback(message) ? <MessageFeedbackControls copy={copy.feedbackControls} id={message.id} onFeedback={onFeedback} /> : <p>{copy.detail.feedbackPending}</p>}{message.feedback.map((feedback, index) => <p key={`${feedback.rating}-${index}`}>{feedback.rating === 'up' ? copy.detail.liked : copy.detail.disliked(feedback.reason)}</p>)}</section>
      <details><summary>{copy.detail.references}</summary><ul>{message.references.map((reference) => <li key={reference}>{reference}</li>)}</ul></details>
    </main><aside>
      <section><h2>{copy.detail.actions}</h2>{canDecide ? <><button onClick={() => onConfirm(message.id)} type="button">{copy.list.confirm}</button><button onClick={() => onSkip(message.id)} type="button">{copy.list.skip}</button></> : <p>{copy.detail.noActions}</p>}</section>
      <section><h2>{copy.detail.information}</h2><p><strong>{copy.detail.sender}</strong> {message.sender}</p><p><strong>{copy.detail.source}</strong> {copy.sources[message.source]}</p><p><strong>{copy.detail.category}</strong> {message.category}</p><p><strong>{copy.detail.time}</strong> <time dateTime={message.receivedAt}>{new Date(message.receivedAt).toLocaleString(copy.dateLocale)}</time></p></section>
      <section><h2>{copy.detail.taskSummary}</h2><p>{message.taskSummary}</p></section>
      <section><h2>{copy.detail.timeline}</h2><ol>{message.timeline.map((item) => <li key={item}>{item}</li>)}</ol></section>
    </aside></div>
  </section>
}
