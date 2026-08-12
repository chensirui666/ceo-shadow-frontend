import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Modal, useOverlayState } from '@heroui/react'
import type { Locale } from '../appState.ts'
import type { MemoryPosition } from '../memoryCanvasState.ts'
import { translations } from '../content/translations.ts'
import {
  finishMaterialTask,
  initialMemoryGraph,
  localizedMemoryGraph,
  resolveMaterialTask,
  startMaterialTask,
  visibleMemoryGraph,
} from '../memoryState.ts'
import type { MaterialKind, MaterialTask, MemoryGraphData, MemoryLayer, MemorySource } from '../memoryState.ts'
import MemoryGraph from './MemoryGraph.tsx'
import MemoryToolbar from './MemoryToolbar.tsx'

type DialogMode = 'upload' | 'migration-prompt' | 'migration-file'

type MemoryWorkspaceProps = {
  initialGraph?: MemoryGraphData
  locale: Locale
  onPositionsCommit?: (positions: Record<string, MemoryPosition>) => void
}

export default function MemoryWorkspace({ initialGraph = initialMemoryGraph, locale, onPositionsCommit }: MemoryWorkspaceProps) {
  const copy = translations[locale].workspace.memory
  const dialogState = useOverlayState()
  const timers = useRef<number[]>([])
  const [graph, setGraph] = useState(initialGraph)
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
    setSelectedFile(null)
    setDialogMode(kind === 'file' ? 'upload' : 'migration-prompt')
    dialogState.open()
  }

  const startTask = (kind: MaterialKind) => {
    if (!selectedFile) return
    runTask(startMaterialTask(kind, selectedFile.name, selectedFile.size))
  }

  const visible = visibleMemoryGraph(localizedMemoryGraph(graph, locale), { layer, source, keyword })
  const applyPositions = useCallback((positions: Record<string, MemoryPosition>) => {
    if (!Object.keys(positions).length) return
    setGraph((current) => ({
      ...current,
      nodes: current.nodes.map((node) => positions[node.id] ? { ...node, position: positions[node.id] } : node),
    }))
    onPositionsCommit?.(positions)
  }, [onPositionsCommit])
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
      <MemoryToolbar copy={copy} keyword={keyword} layer={layer} onKeywordChange={setKeyword} onLayerChange={setLayer} onOpenMaterial={openDialog} onSourceChange={setSource} source={source} />

      {task && <div aria-live="polite" className={`memory-task memory-task-${task.status}`}>
        <span>{copy.status[task.status]}</span>
        {task.status === 'failed' && <Button onPress={() => runTask({ ...task, status: 'processing' })} type="button">{copy.status.retry}</Button>}
      </div>}

      <p aria-live="polite" className="sr-only">{summary}</p>
      <div className="memory-map-area">
        {visible.nodes.length
          ? <MemoryGraph allEdges={graph.edges} edges={visible.edges} nodes={visible.nodes} onPositionsChange={applyPositions} summary={summary} />
          : <div className="memory-empty"><p>{emptyMessage}</p><Button onPress={clearEmptyState} type="button">{clearEmptyLabel}</Button></div>}
      </div>

      <Modal.Backdrop className="memory-modal-backdrop" isOpen={dialogState.isOpen} onOpenChange={dialogState.setOpen}>
        <Modal.Container className="memory-modal-container" placement="center">
          <Modal.Dialog className="memory-modal-dialog">
            <Modal.Header><Modal.Heading className="memory-modal-title">{dialogCopy.title}</Modal.Heading></Modal.Header>
            {dialogMode === 'migration-prompt' ? (
              <Modal.Body className="memory-modal-body">
                <p>{copy.migrationModal.description}</p>
                <pre>{copy.migrationModal.prompt}</pre>
                <div className="memory-modal-actions">
                  <Button className="memory-button memory-button-secondary" onPress={() => void navigator.clipboard?.writeText(copy.migrationModal.prompt)} type="button">{copy.migrationModal.copy}</Button>
                  <Button className="memory-button memory-button-primary" onPress={() => setDialogMode('migration-file')} type="button">{copy.migrationModal.next}</Button>
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
                  <Button className="memory-button memory-button-secondary" onPress={dialogMode === 'migration-file' ? () => setDialogMode('migration-prompt') : dialogState.close} type="button">{dialogMode === 'migration-file' ? copy.migrationModal.back : copy.uploadModal.cancel}</Button>
                  <Button className="memory-button memory-button-primary" isDisabled={!selectedFile} onPress={() => startTask(dialogMode === 'upload' ? 'file' : 'migration')} type="button">{dialogMode === 'upload' ? copy.uploadModal.submit : copy.migrationModal.submit}</Button>
                </div>
              </Modal.Body>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </section>
  )
}
