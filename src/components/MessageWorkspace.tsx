import { useEffect, useState } from 'react'
import { messageService } from '../messageService.ts'
import type { MessageCopy } from '../content/translations.ts'
import { createDefaultMessageFilters } from '../messageState.ts'
import type { MessageFeedback, MessageFilters, MessageSnapshot, MessageStatus } from '../messageState.ts'
import type { MessageService } from '../messageService.ts'
import MessageDetail from './MessageDetail.tsx'
import MessageList from './MessageList.tsx'

type MessageWorkspaceContentProps = {
  copy: MessageCopy
  snapshot: MessageSnapshot
  status: MessageStatus | 'all'
  selectedId: string | null
  onBack: () => void
  onConfirm: (id: string) => void
  onFeedback: (id: string, feedback: MessageFeedback) => void
  onOpen: (id: string) => void
  onSkip: (id: string) => void
  onStatusChange: (status: MessageStatus | 'all') => void
  filters?: MessageFilters
  onFiltersChange?: (filters: MessageFilters) => void
  onOpenSettings?: () => void
}

export function MessageWorkspaceContent({ copy, snapshot, status, selectedId, onBack, onConfirm, onFeedback, onOpen, onSkip, onStatusChange, filters = createDefaultMessageFilters(), onFiltersChange = () => {}, onOpenSettings }: MessageWorkspaceContentProps) {
  if (!snapshot.messages.length) return <section aria-live="polite" className="message-state"><p>{copy.empty}</p></section>
  const selectedMessage = snapshot.messages.find((message) => message.id === selectedId)
  if (selectedMessage) return <MessageDetail copy={copy} message={selectedMessage} onBack={onBack} onConfirm={onConfirm} onFeedback={onFeedback} onSkip={onSkip} />
  return <MessageList copy={copy} filters={filters} messages={snapshot.messages} onConfirm={onConfirm} onFeedback={onFeedback} onFiltersChange={onFiltersChange} onOpen={onOpen} onOpenSettings={onOpenSettings} onSkip={onSkip} onStatusChange={onStatusChange} status={status} />
}

export default function MessageWorkspace({ copy, service = messageService, onOpenSettings }: { copy: MessageCopy; service?: MessageService; onOpenSettings?: () => void }) {
  const [snapshot, setSnapshot] = useState<MessageSnapshot | null>(null)
  const [status, setStatus] = useState<MessageStatus | 'all'>('all')
  const [filters, setFilters] = useState<MessageFilters>(createDefaultMessageFilters)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    void service.load().then((next) => { if (active) setSnapshot(next) }).catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [service])

  const update = (action: Promise<MessageSnapshot>) => { void action.then(setSnapshot) }
  const feedback = (id: string, value: MessageFeedback) => update(service.submitFeedback(id, value))

  if (error) return <section aria-live="polite" className="message-state"><p>{copy.error}</p></section>
  if (!snapshot) return <section aria-live="polite" className="message-state"><p>{copy.loading}</p></section>
  return <MessageWorkspaceContent copy={copy} filters={filters} onBack={() => setSelectedId(null)} onConfirm={(id) => update(service.confirm(id))} onFeedback={feedback} onFiltersChange={setFilters} onOpen={setSelectedId} onOpenSettings={onOpenSettings} onSkip={(id) => update(service.skip(id))} onStatusChange={setStatus} selectedId={selectedId} snapshot={snapshot} status={status} />
}
