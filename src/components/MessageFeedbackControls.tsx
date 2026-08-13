import type { FormEvent, MouseEvent } from 'react'
import type { MessageFeedback } from '../messageState.ts'

type MessageFeedbackControlsProps = {
  id: string
  onFeedback: (id: string, feedback: MessageFeedback) => void
  stopPropagation?: boolean
}

export function MessageFeedbackControls({ id, onFeedback, stopPropagation = false }: MessageFeedbackControlsProps) {
  const stop = (event: MouseEvent<HTMLSpanElement>) => { if (stopPropagation) event.stopPropagation() }
  const submitDownvote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const reason = (event.currentTarget.elements.namedItem('reason') as HTMLInputElement | null)?.value.trim() ?? ''
    if (!reason) return
    onFeedback(id, { rating: 'down', reason })
    event.currentTarget.reset()
  }

  return <span className="message-feedback-controls" onClick={stop}>
    <button aria-label="点赞" onClick={() => onFeedback(id, { rating: 'up', reason: '有帮助。' })} type="button">点赞</button>
    <details><summary>点踩</summary><form onSubmit={submitDownvote}><label>反馈原因<input aria-label="反馈原因" name="reason" required /></label><button type="submit">提交反馈</button></form></details>
  </span>
}
