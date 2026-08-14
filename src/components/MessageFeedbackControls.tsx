import { Button, Input } from '@heroui/react'
import { useState } from 'react'
import type { MouseEvent } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import type { MessageCopy } from '../content/translations.ts'
import type { MessageFeedback } from '../messageState.ts'

type MessageFeedbackControlsProps = {
  copy: MessageCopy['feedbackControls']
  id: string
  onFeedback: (id: string, feedback: MessageFeedback) => void
  stopPropagation?: boolean
}

export function MessageFeedbackControls({ copy, id, onFeedback, stopPropagation = false }: MessageFeedbackControlsProps) {
  const [selection, setSelection] = useState<MessageFeedback['rating'] | null>(null)
  const [reason, setReason] = useState('')
  const [savedReason, setSavedReason] = useState('')
  const stop = (event: MouseEvent<HTMLSpanElement>) => { if (stopPropagation) event.stopPropagation() }
  const choose = (rating: MessageFeedback['rating']) => {
    setSelection(rating)
    if (rating === 'up') onFeedback(id, { rating, reason: copy.upvoteReason })
  }
  const saveReason = () => {
    const nextReason = reason.trim()
    if (!nextReason || nextReason === savedReason) return
    onFeedback(id, { rating: 'down', reason: nextReason })
    setSavedReason(nextReason)
  }

  return <span className="message-feedback-controls" onClick={stop}>
    <Button aria-label={copy.upvote} aria-pressed={selection === 'up'} className="message-feedback-control message-feedback-upvote" isIconOnly onPress={() => choose('up')} size="sm" type="button" variant="secondary"><ThumbsUp aria-hidden="true" /></Button>
    <Button aria-label={copy.downvote} aria-pressed={selection === 'down'} className="message-feedback-control message-feedback-downvote" isIconOnly onPress={() => choose('down')} size="sm" type="button" variant="secondary"><ThumbsDown aria-hidden="true" /></Button>
    {selection === 'down' && <Input aria-label={copy.reason} className="message-feedback-reason" onBlur={saveReason} onChange={(event) => setReason(event.target.value)} value={reason} />}
  </span>
}
