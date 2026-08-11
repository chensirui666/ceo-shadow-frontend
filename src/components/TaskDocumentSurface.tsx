import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import type { TaskDocument } from '../tasksState.ts'

export type TaskDocumentCopy = {
  saved: string
  titleLabel: string
  bodyLabel: string
}

export const documentAutosaveDelay = 5_000

type TaskDocumentSurfaceProps = {
  backLabel: string
  copy: TaskDocumentCopy
  document: TaskDocument
  label: string
  onBack: () => void
  onSave: (update: Pick<TaskDocument, 'title' | 'content'>) => void
  sidePanel?: ReactNode
}

export default function TaskDocumentSurface({ backLabel, copy, document, label, onBack, onSave, sidePanel }: TaskDocumentSurfaceProps) {
  const [title, setTitle] = useState(document.title)
  const [content, setContent] = useState(document.content)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const className = sidePanel ? 'task-document task-document-side-panel' : 'task-document'

  useEffect(() => {
    setTitle(document.title)
    setContent(document.content)
    setDirty(false)
    setSaved(false)
  }, [document])

  useEffect(() => {
    if (!dirty || !title.trim()) return
    const timer = window.setTimeout(() => {
      onSave({ title: title.trim(), content })
      setDirty(false)
      setSaved(true)
    }, documentAutosaveDelay)
    return () => window.clearTimeout(timer)
  }, [content, dirty, onSave, title])

  return <section aria-label={label} className={className}>
    <div className="task-document-shell">
      <main className="task-document-editor" role="document">
        <div className="task-document-toolbar">
          <Button className="task-document-back" onPress={onBack} type="button" variant="ghost"><ArrowLeft aria-hidden="true" />{backLabel}</Button>
        </div>
        <input aria-label={copy.titleLabel} className="task-document-title" onChange={(event) => { setTitle(event.target.value); setDirty(true); setSaved(false) }} value={title} />
        <textarea aria-label={copy.bodyLabel} className="task-document-body" onChange={(event) => { setContent(event.target.value); setDirty(true); setSaved(false) }} value={content} />
        <span aria-live="polite" className="sr-only">{saved ? copy.saved : ''}</span>
      </main>
      {sidePanel}
    </div>
  </section>
}
