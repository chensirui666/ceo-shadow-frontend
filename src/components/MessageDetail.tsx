import { canProvideMessageFeedback } from '../messageState.ts'
import type { Message, MessageFeedback } from '../messageState.ts'
import { MessageFeedbackControls } from './MessageFeedbackControls.tsx'

type MessageDetailProps = {
  message: Message
  onBack: () => void
  onConfirm: (id: string) => void
  onFeedback: (id: string, feedback: MessageFeedback) => void
  onSkip: (id: string) => void
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
      <section><h2>反馈</h2>{canProvideMessageFeedback(message) ? <MessageFeedbackControls id={message.id} onFeedback={onFeedback} /> : <p>处理完成后可反馈。</p>}{message.feedback.map((feedback, index) => <p key={`${feedback.rating}-${index}`}>{feedback.rating === 'up' ? '已点赞' : `点踩：${feedback.reason}`}</p>)}</section>
      <details><summary>处理依据与材料</summary><ul>{message.references.map((reference) => <li key={reference}>{reference}</li>)}</ul></details>
    </main><aside>
      <section><h2>操作</h2>{canDecide ? <><button onClick={() => onConfirm(message.id)} type="button">确认</button><button onClick={() => onSkip(message.id)} type="button">跳过</button></> : <p>当前没有需要你执行的操作。</p>}</section>
      <section><h2>Message 信息</h2><p>{message.sender} · {message.source} · {message.category}</p><time dateTime={message.receivedAt}>{new Date(message.receivedAt).toLocaleString('zh-CN')}</time></section>
      <section><h2>Task 汇总</h2><p>{message.taskSummary}</p></section>
      <section><h2>活动时间线</h2><ol>{message.timeline.map((item) => <li key={item}>{item}</li>)}</ol></section>
    </aside></div>
  </section>
}
