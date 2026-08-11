import { useEffect, useState } from 'react'
import { Button, Dropdown, Modal, useOverlayState } from '@heroui/react'
import { AudioLines, CalendarDays, CheckCircle2, ChevronRight, Circle, CircleDotDashed, Ellipsis, FileText, FileType2, Folder, Headphones, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Locale } from '../appState.ts'
import type { TasksCopy } from '../content/translations.ts'
import { milestoneProgress, projectProgress } from '../tasksState.ts'
import type { TaskMilestone, TaskProject, TaskSource, TodoStatus } from '../tasksState.ts'

type TaskProjectDetailProps = {
  copy: TasksCopy
  locale: Locale
  onOpenAiProduct: (todoId: string) => void
  onOpenProjectDetail: () => void
  onTodoStatusChange: (todoId: string, status: Extract<TodoStatus, 'completed' | 'cancelled'>) => void
  project: TaskProject
  updatingTodoId: string | null
}

const formatDate = (value: string, locale: Locale) => new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }).format(new Date(value.includes('T') ? value : `${value}T12:00:00`))
const initialMilestoneId = (project: TaskProject) => project.milestones.find((milestone) => milestone.status === 'active')?.id ?? project.milestones.at(-1)?.id ?? null

const sourceIcons: Record<TaskSource['type'], LucideIcon> = {
  document: FileText,
  minutes: Headphones,
  presentation: FileType2,
  audio: AudioLines,
  folder: Folder,
  file: FileText,
  message: FileText,
  meeting: CalendarDays,
  todo: CheckCircle2,
}

const sourceExtensions: Partial<Record<TaskSource['type'], string>> = { minutes: '.md', document: '.docx', presentation: '.pptx', audio: '.mp3' }
const sourceFileName = (source: TaskSource) => `${source.name}${sourceExtensions[source.type] ?? ''}`

function SourceRailItem({ copy, group }: { copy: TasksCopy; group: { type: TaskSource['type']; items: TaskSource[] } }) {
  const SourceIcon = sourceIcons[group.type]
  const tooltipId = `project-source-${group.type}`
  const label = `${copy.source.type[group.type]} · ${copy.source.count(group.items.length)}`

  return <span aria-describedby={tooltipId} aria-label={label} className="task-source-rail-item" data-source-type={group.type} tabIndex={0}>
    <SourceIcon aria-hidden="true" className="task-source-rail-icon" />
    <strong>{copy.source.type[group.type]}</strong>
    <small>{group.items.length}</small>
    <ChevronRight aria-hidden="true" className="task-source-rail-chevron" />
    <span className="task-source-rail-tooltip" id={tooltipId} role="tooltip">{group.items.map((source) => <strong key={source.id} title={sourceFileName(source)}>{sourceFileName(source)}</strong>)}</span>
  </span>
}

function MilestoneIcon({ status }: { status: TaskMilestone['status'] }) {
  if (status === 'completed') return <CheckCircle2 aria-hidden="true" />
  if (status === 'active') return <CircleDotDashed aria-hidden="true" />
  return <Circle aria-hidden="true" />
}

export default function TaskProjectDetail({ copy, locale, onOpenAiProduct, onOpenProjectDetail, onTodoStatusChange, project, updatingTodoId }: TaskProjectDetailProps) {
  const cancelDialog = useOverlayState()
  const [todoToCancel, setTodoToCancel] = useState<string | null>(null)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(() => initialMilestoneId(project))
  const progress = projectProgress(project)
  const selectedMilestone = project.milestones.find((milestone) => milestone.id === selectedMilestoneId) ?? project.milestones[0]
  const selectedMilestoneProgress = selectedMilestone ? milestoneProgress(project, selectedMilestone) : { completed: 0, total: 0, percent: 0 }
  const sourceGroups = project.sources.reduce<Array<{ type: TaskSource['type']; items: TaskSource[] }>>((groups, source) => {
    const group = groups.find((item) => item.type === source.type)
    if (group) group.items.push(source)
    else groups.push({ type: source.type, items: [source] })
    return groups
  }, [])

  useEffect(() => {
    setSelectedMilestoneId(initialMilestoneId(project))
  }, [project.id])

  const scrollToActionItems = () => document.getElementById('task-action-items')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const cancelTodo = () => {
    if (!todoToCancel) return
    onTodoStatusChange(todoToCancel, 'cancelled')
    cancelDialog.close()
    setTodoToCancel(null)
  }

  return <section className="tasks-detail">
    <header className="tasks-detail-header">
      <dl className="tasks-project-facts tasks-detail-panel">
        <div><dt>{copy.detail.started}</dt><dd>{formatDate(project.startedAt, locale)}</dd></div>
        <div><dt>{copy.detail.owner}</dt><dd>{project.owner}</dd></div>
        <div><dt>{copy.detail.participants}</dt><dd>{project.participants.join('、')}</dd></div>
        <div><dt>{copy.detail.priority}</dt><dd>{copy.priority[project.priority]}</dd></div>
        <div><dt>{copy.document.detail}</dt><dd><Button aria-label={copy.document.open} className="task-project-detail-action" data-project-detail-action onPress={onOpenProjectDetail} type="button" variant="ghost"><FileText aria-hidden="true" />{copy.document.open}</Button></dd></div>
      </dl>
    </header>
    <section className="tasks-detail-section">
      <div className="tasks-section-heading"><h3>{copy.sections.milestones}</h3>{selectedMilestone && <span>{copy.fraction(selectedMilestoneProgress.completed, selectedMilestoneProgress.total)}</span>}</div>
      <div className="tasks-detail-panel tasks-milestones-panel"><div aria-label={copy.sections.milestones} className="task-milestone-navigator" role="tablist">{project.milestones.map((milestone) => <button aria-controls={`milestone-panel-${milestone.id}`} aria-selected={selectedMilestone?.id === milestone.id} className={`task-milestone task-milestone-${milestone.status}${selectedMilestone?.id === milestone.id ? ' task-milestone-selected' : ''}`} key={milestone.id} onClick={() => setSelectedMilestoneId(milestone.id)} role="tab" type="button"><MilestoneIcon status={milestone.status} /><span><strong>{milestone.title}</strong><small>{copy.milestone[milestone.status]}</small></span><time dateTime={milestone.dueAt}>{formatDate(milestone.dueAt, locale)}</time></button>)}</div>
        {selectedMilestone && <section aria-labelledby={`milestone-title-${selectedMilestone.id}`} className="task-milestone-detail" id={`milestone-panel-${selectedMilestone.id}`} role="tabpanel" tabIndex={0}><div><h4 id={`milestone-title-${selectedMilestone.id}`}>{selectedMilestone.title}</h4><p>{selectedMilestone.summary}</p></div><div className="task-milestone-progress"><span>{copy.milestone.progress} · {copy.fraction(selectedMilestoneProgress.completed, selectedMilestoneProgress.total)}</span><progress aria-label={`${copy.milestone.progress}: ${copy.fraction(selectedMilestoneProgress.completed, selectedMilestoneProgress.total)}`} max={selectedMilestoneProgress.total || 1} value={selectedMilestoneProgress.completed} /></div><div className="task-milestone-detail-facts"><span><CalendarDays aria-hidden="true" /><small>{copy.milestone.due}</small><strong>{formatDate(selectedMilestone.dueAt, locale)}</strong></span><Button className="task-milestone-linked-actions" onPress={scrollToActionItems} type="button" variant="ghost">{copy.milestone.openLinkedActions}<ChevronRight aria-hidden="true" /></Button></div></section>}</div>
    </section>

    <section className="tasks-detail-section" id="task-action-items">
      <div className="tasks-section-heading"><h3>{copy.sections.todos}</h3><span>{copy.fraction(progress.completed, progress.total)}</span></div>
      <div className="tasks-detail-panel tasks-action-items-panel">{project.todos.length ? <div className="task-todo-list"><div className="task-todo-table-head"><span>{copy.todo.item}</span><span>{copy.todo.owner}</span><span>{copy.todo.progress}</span><span>{copy.todo.due}</span><span>{copy.todo.completedAt}</span><span>{copy.todo.source}</span><span>{copy.todo.aiProduct}</span><span>{copy.todo.actions}</span></div>{project.todos.map((todo) => {
        const todoSources = project.sources.filter((source) => todo.sourceIds.includes(source.id))
        return <article className="task-todo" key={todo.id}>
          <span className="task-todo-title" data-label={copy.todo.item} title={todo.title}>{todo.title}</span><span data-label={copy.todo.owner} title={todo.owner}>{todo.owner}</span><span data-label={copy.todo.progress} title={copy.todoStatus[todo.status]}>{copy.todoStatus[todo.status]}</span><span data-label={copy.todo.due} title={todo.dueAt ? formatDate(todo.dueAt, locale) : copy.todo.noDue}>{todo.dueAt ? formatDate(todo.dueAt, locale) : copy.todo.noDue}</span><span data-label={copy.todo.completedAt} title={todo.completedAt ? formatDate(todo.completedAt, locale) : todo.cancelledAt ? copy.todoStatus.cancelled : '—'}>{todo.completedAt ? formatDate(todo.completedAt, locale) : todo.cancelledAt ? copy.todoStatus.cancelled : '—'}</span>
          <span className="task-todo-source" data-label={copy.todo.source}>{todoSources.length ? <><span aria-describedby={`todo-source-${todo.id}`} aria-label={`${copy.todo.source}: ${copy.source.count(todoSources.length)}`} className="task-todo-source-trigger" data-todo-source={todo.id} tabIndex={0}><FileText aria-hidden="true" /><strong>{todoSources.length}</strong></span><span className="task-todo-source-tooltip" id={`todo-source-${todo.id}`} role="tooltip">{todoSources.map((source) => <span key={source.id}><strong>{sourceFileName(source)}</strong><p>{source.excerpt}</p></span>)}</span></> : '—'}</span>
          <span data-label={copy.todo.aiProduct}>{todo.aiProduct ? <Button className="task-todo-link task-todo-ai-product" data-ai-product-action={todo.id} onPress={() => onOpenAiProduct(todo.id)} variant="ghost"><Sparkles aria-hidden="true" />{copy.todo.openAiProduct}</Button> : <small>{copy.todo.noAiProduct}</small>}</span>
          <span className="task-todo-actions" data-label={copy.todo.actions}>{todo.status === 'open' && <Dropdown><Dropdown.Trigger><Button aria-label={copy.todo.actions} className="task-todo-action-menu-trigger" isDisabled={updatingTodoId === todo.id} variant="ghost"><Ellipsis aria-hidden="true" /></Button></Dropdown.Trigger><Dropdown.Popover className="task-todo-action-menu" placement="bottom right"><Dropdown.Menu aria-label={copy.todo.actions} onAction={(key) => { if (key === 'complete') onTodoStatusChange(todo.id, 'completed'); else { setTodoToCancel(todo.id); cancelDialog.open() } }}><Dropdown.Item className="task-todo-action-menu-item" id="complete" textValue={copy.actions.complete}>{copy.actions.complete}</Dropdown.Item><Dropdown.Item className="task-todo-action-menu-item" id="cancel" textValue={copy.actions.cancel}>{copy.actions.cancel}</Dropdown.Item></Dropdown.Menu></Dropdown.Popover></Dropdown>}</span>
        </article>
      })}</div> : <p className="tasks-empty-detail">{copy.todo.empty}</p>}</div>
    </section>

    <section className="tasks-detail-section">
      <h3>{copy.sections.sources}</h3>
      <div className="tasks-detail-panel tasks-sources-panel"><div className="tasks-source-rail">{sourceGroups.map((group) => <SourceRailItem copy={copy} group={group} key={group.type} />)}</div></div>
    </section>

    <Modal.Backdrop className="tasks-cancel-backdrop" isOpen={cancelDialog.isOpen} onOpenChange={cancelDialog.setOpen}>
      <Modal.Container className="tasks-cancel-container" placement="center"><Modal.Dialog className="tasks-cancel-dialog"><Modal.Header><Modal.Heading>{copy.cancelDialog.title}</Modal.Heading></Modal.Header><Modal.Body>{copy.cancelDialog.body}</Modal.Body><Modal.Footer><Button onPress={() => { cancelDialog.close(); setTodoToCancel(null) }} variant="secondary">{copy.cancelDialog.keep}</Button><Button isPending={Boolean(todoToCancel && updatingTodoId === todoToCancel)} onPress={cancelTodo} variant="danger">{copy.cancelDialog.confirm}</Button></Modal.Footer></Modal.Dialog></Modal.Container>
    </Modal.Backdrop>
  </section>
}
