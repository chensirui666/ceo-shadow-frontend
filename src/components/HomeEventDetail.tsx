import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import type { HomeCopy } from '../content/translations.ts'
import type { HomeEvent, OwnerFeedback } from '../homeState.ts'

type HomeEventDetailProps = {
  busy: boolean
  copy: HomeCopy
  event: HomeEvent
  now: Date
  onBack: () => void
  onResolve: (decision: 'send' | 'cancel', reply: string) => void
  onSubmitFeedback: (feedback: OwnerFeedback) => void
  sourceName: string
}

const detailTime = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const replyContent = (event: HomeEvent, copy: HomeCopy) => {
  if (event.status === 'waiting') return copy.detail.waiting
  if (event.status === 'processing') return copy.detail.processing
  if (event.outcome === 'no-reply') return copy.outcome['no-reply']
  return event.reply ?? copy.status[event.status]
}

export default function HomeEventDetail({ busy, copy, event, now, onBack, onResolve, onSubmitFeedback, sourceName }: HomeEventDetailProps) {
  const [reply, setReply] = useState(event.reply ?? '')
  const [feedbackKind, setFeedbackKind] = useState<OwnerFeedback['kind'] | null>(event.ownerFeedback?.kind ?? null)
  const [feedbackNote, setFeedbackNote] = useState(event.ownerFeedback?.note ?? '')
  const [feedbackSaved, setFeedbackSaved] = useState(Boolean(event.ownerFeedback))

  useEffect(() => {
    setReply(event.reply ?? '')
    setFeedbackKind(event.ownerFeedback?.kind ?? null)
    setFeedbackNote(event.ownerFeedback?.note ?? '')
    setFeedbackSaved(Boolean(event.ownerFeedback))
  }, [event])

  const canGiveFeedback = Boolean(event.reply) && ['completed', 'trial-complete', 'send-failed'].includes(event.status)
  const stateSummary = event.status === 'waiting' && event.waitUntil
    ? copy.countdown(Math.max(0, Math.floor((new Date(event.waitUntil).getTime() - now.getTime()) / 1000)))
    : copy.status[event.status]
  const stateNote = event.status === 'needs-confirmation'
    ? copy.detail.needsConfirmation
    : event.outcome ? copy.outcome[event.outcome] : event.status === 'processing' ? copy.detail.processing : event.status === 'waiting' ? copy.detail.waiting : undefined
  const saveFeedback = () => {
    if (!feedbackKind || (feedbackKind === 'adjust' && !feedbackNote.trim())) return
    onSubmitFeedback({ kind: feedbackKind, note: feedbackNote.trim() })
    setFeedbackSaved(true)
  }

  return <article className="home-detail">
    <header className="home-detail-hero">
      <button className="home-back" onClick={onBack} type="button">← {copy.detail.back}</button>
      <div className="home-detail-hero-content">
        <div>
          <p className="home-detail-source">{sourceName}{event.conversation && ` · ${event.conversation}`}</p>
          <h2>{event.question}</h2>
          <p className="home-detail-sender">{event.sender} · {detailTime(event.receivedAt)}</p>
        </div>
        <aside aria-label={copy.detail.status} className={`home-detail-state home-detail-state-${event.status}`}>
          <strong>{stateSummary}</strong>
          {stateNote && <p>{stateNote}</p>}
        </aside>
      </div>
    </header>
    <div className="home-detail-reading">
      <section className="home-detail-section"><h2>{copy.detail.originalMessage}</h2><p>{event.question}</p></section>
      <section className="home-detail-section home-detail-rationale"><h2>{copy.detail.rationale}</h2><p>{event.rationale}</p></section>
      {event.status !== 'waiting' && <section className="home-detail-section home-detail-response"><h2>{copy.detail.response}</h2>
        {event.status === 'needs-confirmation' ? <textarea aria-label={copy.detail.editReply} onChange={(next) => setReply(next.target.value)} value={reply} /> : <p>{replyContent(event, copy)}</p>}
        {event.status === 'trial-complete' && <p className="home-detail-note">{copy.detail.trialNote}</p>}
        {event.status === 'needs-confirmation' && <div className="home-detail-actions">
          <Button isDisabled={!reply.trim()} isPending={busy} onPress={() => onResolve('send', reply)}>{copy.actions.send}</Button>
          <Button isDisabled={busy} onPress={() => onResolve('cancel', reply)} variant="secondary">{copy.actions.cancel}</Button>
        </div>}
      </section>}
    </div>
    <section className="home-detail-section home-detail-event-information">
      <h2>{copy.detail.eventInformation}</h2>
      <dl className="home-detail-meta">
        <div><dt>{copy.detail.source}</dt><dd>{sourceName}</dd></div>
        {event.conversation && <div><dt>{copy.detail.conversation}</dt><dd>{event.conversation}</dd></div>}
        <div><dt>{copy.detail.sender}</dt><dd>{event.sender}</dd></div>
        <div><dt>{copy.detail.time}</dt><dd>{detailTime(event.receivedAt)}</dd></div>
        <div><dt>{copy.detail.status}</dt><dd>{copy.status[event.status]}</dd></div>
        {event.outcome && <div><dt>{copy.detail.result}</dt><dd>{copy.outcome[event.outcome]}</dd></div>}
      </dl>
    </section>
    {canGiveFeedback && <section className="home-detail-section home-owner-feedback"><h2>{copy.feedback.title}</h2>
      <div className="home-feedback-options">
        <button aria-pressed={feedbackKind === 'matched'} onClick={() => { setFeedbackKind('matched'); setFeedbackSaved(false) }} type="button">{copy.feedback.matched}</button>
        <button aria-pressed={feedbackKind === 'adjust'} onClick={() => { setFeedbackKind('adjust'); setFeedbackSaved(false) }} type="button">{copy.feedback.adjust}</button>
      </div>
      {feedbackKind === 'adjust' && <textarea aria-label={copy.feedback.placeholder} onChange={(next) => { setFeedbackNote(next.target.value); setFeedbackSaved(false) }} placeholder={copy.feedback.placeholder} value={feedbackNote} />}
      {feedbackSaved ? <p className="home-feedback-saved">{copy.feedback.saved}</p> : <Button isDisabled={!feedbackKind || (feedbackKind === 'adjust' && !feedbackNote.trim())} onPress={saveFeedback} variant="secondary">{copy.feedback.save}</Button>}
    </section>}
    {event.outcome === 'sent' && <section aria-labelledby="recipient-feedback" className="home-detail-section home-recipient-feedback">
      <h2 id="recipient-feedback">{copy.feedback.recipientTitle}</h2>
      <p>{copy.feedback.recipientQuestion}</p>
      <div className="home-recipient-feedback-options"><span>{copy.feedback.helpful}</span><span>{copy.feedback.unresolved}</span></div>
      <p className="home-recipient-feedback-preview">{copy.feedback.recipientPending}</p>
    </section>}
  </article>
}
