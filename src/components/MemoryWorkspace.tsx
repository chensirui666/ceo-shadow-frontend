import { useEffect, useRef, useState } from 'react'
import { Modal, useOverlayState } from '@heroui/react'
import type { Locale } from '../appState.ts'
import { translations } from '../content/translations.ts'
import {
  finishMaterialTask,
  initialMemoryGraph,
  memorySources,
  resolveMaterialTask,
  startMaterialTask,
  visibleMemoryGraph,
} from '../memoryState.ts'
import type { MaterialKind, MaterialTask, MemoryLayer, MemorySource } from '../memoryState.ts'
import MemoryGraph from './MemoryGraph.tsx'

type DialogMode = 'upload' | 'migration-prompt' | 'migration-file'

const materialSources = memorySources.filter((source): source is Exclude<MemorySource, 'all'> => source !== 'all')

export default function MemoryWorkspace({ locale }: { locale: Locale }) {
  const copy = translations[locale].workspace.memory
  const dialogState = useOverlayState()
  const addMenu = useRef<HTMLDetailsElement>(null)
  const timers = useRef<number[]>([])
  const [graph, setGraph] = useState(initialMemoryGraph)
  const [layer, setLayer] = useState<MemoryLayer>('context')
  const [source, setSource] = useState<MemorySource>('all')
  const [keyword, setKeyword] = useState('')
  const [task, setTask] = useState<MaterialTask | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timers.current = timers.current.filter((item) => item !== timer)
      callback()
    }, delay)
    timers.current.push(timer)
  }

  const runTask = (pending: MaterialTask) => {
    dialogState.close()
    setSelectedFile(null)
    setTask(pending)
    schedule(() => {
      const resolved = finishMaterialTask(pending)
      setGraph((current) => resolveMaterialTask(current, resolved))
      setTask(resolved)
      if (resolved.status === 'completed') schedule(() => setTask((current) => current?.status === 'completed' ? null : current), 2200)
    }, 500)
  }

  const openDialog = (kind: MaterialKind) => {
    addMenu.current?.removeAttribute('open')
    setSelectedFile(null)
    setDialogMode(kind === 'file' ? 'upload' : 'migration-prompt')
    dialogState.open()
  }

  const startTask = (kind: MaterialKind) => {
    if (!selectedFile) return
    runTask(startMaterialTask(kind, selectedFile.name, selectedFile.size))
  }

  const visible = visibleMemoryGraph(graph, { layer, source, keyword })
  const emptyMessage = keyword.trim()
    ? copy.empty.search
    : source !== 'all'
      ? copy.empty.source
      : copy.empty.layer
  const clearEmptyState = keyword.trim()
    ? () => setKeyword('')
    : () => setSource('all')
  const clearEmptyLabel = keyword.trim() ? copy.empty.clearSearch : copy.empty.clearSource
  const summary = copy.mapSummary(copy.layers[layer].label, copy.sources[source], keyword.trim(), visible.nodes.length)
  const dialogCopy = dialogMode === 'upload' ? copy.uploadModal : copy.migrationModal

  return (
    <section className="memory-page">
      <p className="memory-description">{copy.description}</p>
      <div className="memory-toolbar">
        <div className="memory-layer-control">
          <div aria-label={copy.layersLabel} className="memory-tabs" role="tablist">
            {(['context', 'user'] as const).map((item) => (
              <button aria-selected={layer === item} className={layer === item ? 'memory-tab memory-tab-active' : 'memory-tab'} key={item} onClick={() => setLayer(item)} role="tab" type="button">
                {copy.layers[item].label}
              </button>
            ))}
          </div>
          <p className="memory-layer-description">{copy.layers[layer].description}</p>
        </div>
        <div className="memory-controls">
          <label className="memory-select">
            <span className="sr-only">{copy.sourceLabel}</span>
            <select onChange={(event) => setSource(event.target.value as MemorySource)} value={source}>
              {memorySources.map((item) => <option key={item} value={item}>{copy.sourceLabel}：{copy.sources[item]}</option>)}
            </select>
          </label>
          <div aria-label={copy.sourceLabel} className="memory-source-key">
            {materialSources.map((item) => <span key={item}><i aria-hidden="true" className={`memory-source-dot memory-source-dot-${item}`} />{copy.sources[item]}</span>)}
          </div>
          <label className="memory-search">
            <span className="sr-only">{copy.searchLabel}</span>
            <input onChange={(event) => setKeyword(event.target.value)} placeholder={copy.searchPlaceholder} type="search" value={keyword} />
          </label>
          <details className="memory-add-dropdown" ref={addMenu}>
            <summary className="memory-add-button">{copy.add}<span aria-hidden="true">⌄</span></summary>
            <div aria-label={copy.add} className="memory-add-menu" role="menu">
              <button onClick={() => openDialog('file')} role="menuitem" type="button">{copy.upload}</button>
              <button onClick={() => openDialog('migration')} role="menuitem" type="button">{copy.migration}</button>
            </div>
          </details>
        </div>
      </div>

      {task && <div aria-live="polite" className={`memory-task memory-task-${task.status}`}>
        <span>{copy.status[task.status]}</span>
        {task.status === 'failed' && <button onClick={() => runTask({ ...task, status: 'processing' })} type="button">{copy.status.retry}</button>}
      </div>}

      <p aria-live="polite" className="sr-only">{summary}</p>
      <div className="memory-map-area">
        {visible.nodes.length
          ? <MemoryGraph edges={visible.edges} nodes={visible.nodes} summary={summary} />
          : <div className="memory-empty"><p>{emptyMessage}</p><button onClick={clearEmptyState} type="button">{clearEmptyLabel}</button></div>}
      </div>

      <Modal state={dialogState}>
        <Modal.Backdrop className="memory-modal-backdrop">
          <Modal.Container className="memory-modal-container" placement="center">
            <Modal.Dialog className="memory-modal-dialog">
              <Modal.Header><Modal.Heading className="memory-modal-title">{dialogCopy.title}</Modal.Heading></Modal.Header>
              {dialogMode === 'migration-prompt' ? (
                <Modal.Body className="memory-modal-body">
                  <p>{copy.migrationModal.description}</p>
                  <pre>{copy.migrationModal.prompt}</pre>
                  <div className="memory-modal-actions">
                    <button className="memory-button memory-button-secondary" onClick={() => void navigator.clipboard?.writeText(copy.migrationModal.prompt)} type="button">{copy.migrationModal.copy}</button>
                    <button className="memory-button memory-button-primary" onClick={() => setDialogMode('migration-file')} type="button">{copy.migrationModal.next}</button>
                  </div>
                </Modal.Body>
              ) : (
                <Modal.Body className="memory-modal-body">
                  <p>{dialogCopy.description}</p>
                  <label className="memory-file-picker">
                    <span>{selectedFile?.name ?? dialogCopy.choose}</span>
                    <input accept={dialogMode === 'migration-file' ? '.md,text/markdown' : undefined} onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} type="file" />
                  </label>
                  <div className="memory-modal-actions">
                    <button className="memory-button memory-button-secondary" onClick={dialogMode === 'migration-file' ? () => setDialogMode('migration-prompt') : dialogState.close} type="button">{dialogMode === 'migration-file' ? copy.migrationModal.back : copy.uploadModal.cancel}</button>
                    <button className="memory-button memory-button-primary" disabled={!selectedFile} onClick={() => startTask(dialogMode === 'upload' ? 'file' : 'migration')} type="button">{dialogMode === 'upload' ? copy.uploadModal.submit : copy.migrationModal.submit}</button>
                  </div>
                </Modal.Body>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </section>
  )
}
