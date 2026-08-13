import { useEffect, useState } from 'react'
import { messageService } from '../messageService.ts'
import type { MessageFeedback, MessageSnapshot, MessageStatus } from '../messageState.ts'
import type { MessageService } from '../messageService.ts'
import MessageDetail from './MessageDetail.tsx'
import MessageList from './MessageList.tsx'

export default function MessageWorkspace({ service = messageService }: { service?: MessageService }) {
  const [snapshot, setSnapshot] = useState<MessageSnapshot | null>(null)
  const [status, setStatus] = useState<MessageStatus | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    void service.load().then((next) => { if (active) setSnapshot(next) }).catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [service])

  const update = (action: Promise<MessageSnapshot>) => { void action.then(setSnapshot) }
  const feedback = (id: string, value: MessageFeedback) => update(service.submitFeedback(id, value))

  if (error) return <section aria-live="polite" className="message-state"><p>消息暂时无法加载。</p></section>
  if (!snapshot) return <section aria-live="polite" className="message-state"><p>正在加载消息…</p></section>
  if (!snapshot.messages.length) return <section aria-live="polite" className="message-state"><p>还没有需要处理的消息。</p></section>

  const selectedMessage = snapshot.messages.find((message) => message.id === selectedId)
  if (selectedMessage) return <MessageDetail message={selectedMessage} onBack={() => setSelectedId(null)} onConfirm={(id) => update(service.confirm(id))} onFeedback={feedback} onSkip={(id) => update(service.skip(id))} />
  return <MessageList messages={snapshot.messages} onConfirm={(id) => update(service.confirm(id))} onFeedback={feedback} onOpen={setSelectedId} onSkip={(id) => update(service.skip(id))} onStatusChange={setStatus} status={status} />
}
