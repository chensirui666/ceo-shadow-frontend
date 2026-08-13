import type { FormEvent, MouseEvent } from 'react'
import type { MessageCopy } from '../content/translations.ts'
import type { MessageFeedback } from '../messageState.ts'

type MessageFeedbackControlsProps = {
  copy: MessageCopy['feedbackControls']
  id: string
  onFeedback: (id: string, feedback: MessageFeedback) => void
  stopPropagation?: boolean
}

export function MessageFeedbackControls({ copy, id, onFeedback, stopPropagation = false }: MessageFeedbackControlsProps) {
  const stop = (event: MouseEvent<HTMLSpanElement>) => { if (stopPropagation) event.stopPropagation() }
  const submitDownvote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const reason = (event.currentTarget.elements.namedItem('reason') as HTMLInputElement | null)?.value.trim() ?? ''
    if (!reason) return
    onFeedback(id, { rating: 'down', reason })
    event.currentTarget.reset()
  }

  return <span className="message-feedback-controls" onClick={stop}>
    <button aria-label={copy.upvote} onClick={() => onFeedback(id, { rating: 'up', reason: copy.upvoteReason })} type="button">{copy.upvote}</button>
    <details><summary>{copy.downvote}</summary><form onSubmit={submitDownvote}><label>{copy.reason}<input aria-label={copy.reason} name="reason" required /></label><button type="submit">{copy.submit}</button></form></details>
  </span>
}
