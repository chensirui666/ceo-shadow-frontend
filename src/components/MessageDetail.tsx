import { useState } from 'react'
import type { Message, MessageFeedback } from '../messageState.ts'

type MessageDetailProps = {
  message: Message
  onBack: () => void
  onConfirm: (id: string) => void
  onFeedback: (id: string, feedback: MessageFeedback) => void
  onSkip: (id: string) => void
}

function FeedbackControls({ id, onFeedback }: Pick<MessageDetailProps, 'onFeedback'> & { id: string }) {
  const [reason, setReason] = useState('')
  return <div className="message-detail-feedback-actions"><button onClick={() => onFeedback(id, { rating: 'up', reason: '有帮助。' })} type="button">点赞</button><details><summary>点踩</summary><form onSubmit={(event) => { event.preventDefault(); onFeedback(id, { rating: 'down', reason }) }}><label>反馈原因<input aria-label="反馈原因" onChange={(event) => setReason(event.target.value)} value={reason} /></label><button type="submit">提交反馈</button></form></details></div>
}

export default function MessageDetail({ message, onBack, onConfirm, onFeedback, onSkip }: MessageDetailProps) {
  const canDecide = message.status === 'needs-confirmation'
  return <section aria-labelledby="message-detail-title" className="message-detail">
    <header><button onClick={onBack} type="button">返回消息</button><h1 id="message-detail-title">{message.subject}</h1></header>
    <div className="message-detail-layout"><main>
      <section><h2>用户问题</h2><p>{message.question}</p></section>
      <section><h2>判断依据</h2><p>{message.rationale}</p></section>
      <section><h2>回答／处理结果</h2><p>{message.result}</p></section>
      <section><h2>关联 Task</h2><p>{message.taskSummary}</p></section>
      <section><h2>反馈</h2><FeedbackControls id={message.id} onFeedback={onFeedback} />{message.feedback.map((feedback, index) => <p key={`${feedback.rating}-${index}`}>{feedback.rating === 'up' ? '已点赞' : `点踩：${feedback.reason}`}</p>)}</section>
      <details><summary>处理依据与材料</summary><ul>{message.references.map((reference) => <li key={reference}>{reference}</li>)}</ul></details>
    </main><aside>
      <section><h2>操作</h2>{canDecide ? <><button onClick={() => onConfirm(message.id)} type="button">确认</button><button onClick={() => onSkip(message.id)} type="button">跳过</button></> : <p>当前没有需要你执行的操作。</p>}</section>
      <section><h2>Message 信息</h2><p>{message.sender} · {message.source} · {message.category}</p><time dateTime={message.receivedAt}>{new Date(message.receivedAt).toLocaleString('zh-CN')}</time></section>
      <section><h2>Task 汇总</h2><p>{message.taskSummary}</p></section>
      <section><h2>活动时间线</h2><ol>{message.timeline.map((item) => <li key={item}>{item}</li>)}</ol></section>
    </aside></div>
  </section>
}
