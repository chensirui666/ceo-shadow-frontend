import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { Bot, ChevronDown, FileText, SendHorizontal, X } from 'lucide-react'
import type { TasksCopy } from '../content/translations.ts'
import type { TaskAiProduct, TaskProject, TaskTodo } from '../tasksState.ts'
import TaskDocumentSurface from './TaskDocumentSurface.tsx'

type TodoWithAiProduct = TaskTodo & { aiProduct: TaskAiProduct }

type TaskAiProductDocumentProps = {
  copy: TasksCopy
  onBack: () => void
  onSave: (todoId: string, update: Pick<TaskAiProduct, 'title' | 'content' | 'feedback'>) => void
  project: TaskProject
  todo: TodoWithAiProduct
}

type AiProductCopilotProps = {
  copy: TasksCopy['aiProductDocument']
  documentTitle: string
  messages: readonly string[]
  onClose: () => void
  onSend: (message: string) => void
}

export function AiProductCopilot({ copy, documentTitle, messages, onClose, onSend }: AiProductCopilotProps) {
  const [draft, setDraft] = useState('')
  const send = () => {
    const message = draft.trim()
    if (!message) return
    onSend(message)
    setDraft('')
  }

  return <aside aria-label={copy.copilotTitle} className="ai-product-copilot">
    <header className="ai-product-copilot-heading"><span><Bot aria-hidden="true" />{copy.newConversation}<ChevronDown aria-hidden="true" /></span><Button aria-label={copy.closeCopilot} isIconOnly onPress={onClose} type="button" variant="ghost"><X aria-hidden="true" /></Button></header>
    <ol aria-live="polite" className="ai-product-copilot-messages">{messages.map((message, index) => <li key={[message, index].join('-')}>{message}</li>)}</ol>
    <form className="ai-product-copilot-composer" onSubmit={(event) => { event.preventDefault(); send() }}>
      <span><FileText aria-hidden="true" />{documentTitle}</span>
      <textarea aria-label={copy.copilotTitle} onChange={(event) => setDraft(event.target.value)} placeholder={copy.messagePlaceholder} value={draft} />
      <div><Button isDisabled={!draft.trim()} type="submit"><SendHorizontal aria-hidden="true" />{copy.ask}</Button></div>
    </form>
  </aside>
}

export default function TaskAiProductDocument({ copy, onBack, onSave, project, todo }: TaskAiProductDocumentProps) {
  const product = todo.aiProduct
  const [messages, setMessages] = useState(product.feedback)
  const [copilotOpen, setCopilotOpen] = useState(false)

  useEffect(() => {
    setMessages(product.feedback)
  }, [product])

  const sidePanel = copilotOpen ? <AiProductCopilot copy={copy.aiProductDocument} documentTitle={product.title} messages={messages} onClose={() => setCopilotOpen(false)} onSend={(message) => setMessages((current) => [...current, message])} /> : undefined

  return <>
    <TaskDocumentSurface
      backLabel={copy.document.backToProject(project.name)}
      copy={copy.document}
      document={product}
      label={copy.aiProductDocument.label}
      onBack={onBack}
      onSave={(update) => onSave(todo.id, { ...update, feedback: product.feedback })}
      sidePanel={sidePanel}
    />
    {!copilotOpen && <Button aria-expanded={false} aria-label={copy.aiProductDocument.openCopilot} className="ai-product-copilot-trigger" onPress={() => setCopilotOpen(true)} type="button"><Bot aria-hidden="true" /></Button>}
  </>
}
