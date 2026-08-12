import { useEffect, useRef, useState } from 'react'
import { Button } from '@heroui/react'
import { Circle, CircleCheck, Clock3 } from 'lucide-react'
import type { Locale } from '../appState.ts'
import { translations } from '../content/translations.ts'
import type { TasksCopy } from '../content/translations.ts'
import { createTasksService } from '../tasksService.ts'
import { createDemoTasksSnapshot, getTasksSummary, localizedTasksSnapshot, myTodoProgress, projectDisplayStatus, projectPersonalTodoSummary, projectProgress, selectTaskProjects } from '../tasksState.ts'
import type { ProjectStatus, TaskAiProduct, TaskDocument, TaskProject, TasksSnapshot, TodoStatus } from '../tasksState.ts'
import TaskAiProductDocument from './TaskAiProductDocument.tsx'
import TaskDocumentSurface from './TaskDocumentSurface.tsx'
import TaskProjectDetail from './TaskProjectDetail.tsx'

export type TasksDetailHeader = { title: string; status: ProjectStatus }
type TasksWorkspaceProps = { currentUser: string; locale: Locale; onDetailHeaderChange: (header: TasksDetailHeader | null) => void; returnToListRequest: number }
type SelectedDocument = { kind: 'project-detail' } | { kind: 'ai-product'; todoId: string } | null

export function PersonalTodos({ copy, currentUser, project }: { copy: TasksCopy; currentUser: string; project: TaskProject }) {
  const summary = projectPersonalTodoSummary(project, currentUser)
  const todos = project.todos.filter((todo) => todo.owner === currentUser && todo.status !== 'cancelled')
  const tooltipId = `personal-todos-${project.id}`
  return <><Button aria-describedby={tooltipId} aria-label={`${copy.personalTodos.open(summary.open)} · ${copy.personalTodos.overdue(summary.overdue)} · ${copy.personalTodos.completed(summary.completed)}`} className="task-personal-todo-trigger" type="button" variant="ghost"><span aria-hidden="true" className="task-personal-todo-metric"><Circle /><b>{summary.open}</b></span><span aria-hidden="true" className="task-personal-todo-metric task-personal-todo-overdue"><Clock3 /><b>{summary.overdue}</b></span><span aria-hidden="true" className="task-personal-todo-metric task-personal-todo-completed"><CircleCheck /><b>{summary.completed}</b></span></Button><span className="task-personal-todo-tooltip" id={tooltipId} role="tooltip">{todos.length ? todos.map((todo) => <span key={todo.id}><strong>{todo.title}</strong><small>{copy.todoStatus[todo.status]}{todo.dueAt ? ` · ${todo.dueAt}` : ''}</small></span>) : copy.todo.empty}</span></>
}

export default function TasksWorkspace({ currentUser, locale, onDetailHeaderChange, returnToListRequest }: TasksWorkspaceProps) {
  const copy = translations[locale].workspace.tasks
  const [service] = useState(() => createTasksService(createDemoTasksSnapshot(currentUser)))
  const [snapshot, setSnapshot] = useState<TasksSnapshot | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<SelectedDocument>(null)
  const [updatingTodoId, setUpdatingTodoId] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const pageRef = useRef<HTMLElement>(null)
  const savedScrollTop = useRef(0)
  const restoringScroll = useRef(false)
  const detailHistoryEntry = useRef(false)
  const handledReturnRequest = useRef(returnToListRequest)

  const load = () => { setError(false); return service.load().then(setSnapshot).catch(() => setError(true)) }
  const closeDetail = () => { detailHistoryEntry.current = false; restoringScroll.current = true; onDetailHeaderChange(null); setSelectedDocument(null); setSelectedProjectId(null) }
  const returnToList = () => {
    if (detailHistoryEntry.current) { window.history.back(); return }
    closeDetail()
  }
  useEffect(() => { void load() }, [])
  useEffect(() => {
    if (selectedProjectId || !restoringScroll.current) return
    window.requestAnimationFrame(() => { pageRef.current?.closest<HTMLElement>('.workspace-canvas')?.scrollTo({ top: savedScrollTop.current }); restoringScroll.current = false })
  }, [selectedProjectId])
  useEffect(() => {
    window.addEventListener('popstate', closeDetail)
    return () => window.removeEventListener('popstate', closeDetail)
  }, [])
  useEffect(() => {
    if (returnToListRequest === handledReturnRequest.current) return
    handledReturnRequest.current = returnToListRequest
    if (selectedProjectId) returnToList()
  }, [returnToListRequest, selectedProjectId])
  useEffect(() => {
    const project = snapshot && localizedTasksSnapshot(snapshot, locale).projects.find((item) => item.id === selectedProjectId)
    if (project) onDetailHeaderChange({ title: project.name, status: projectDisplayStatus(project) })
  }, [locale, onDetailHeaderChange, selectedProjectId, snapshot])

  const openProject = (project: TaskProject) => {
    const canvas = pageRef.current?.closest<HTMLElement>('.workspace-canvas')
    savedScrollTop.current = canvas?.scrollTop ?? 0
    canvas?.scrollTo({ top: 0 })
    window.history.pushState({ tasksProjectId: project.id }, '')
    detailHistoryEntry.current = true
    onDetailHeaderChange({ title: project.name, status: projectDisplayStatus(project) })
    setSelectedDocument(null)
    setSelectedProjectId(project.id)
  }
  const updateTodoStatus = (todoId: string, status: Extract<TodoStatus, 'completed' | 'cancelled'>) => {
    setUpdatingTodoId(todoId)
    void service.updateTodoStatus(todoId, status).then(setSnapshot).finally(() => setUpdatingTodoId(null))
  }
  const saveAiProduct = (todoId: string, update: Pick<TaskAiProduct, 'title' | 'content' | 'feedback'>) => {
    void service.updateAiProduct(todoId, update).then(setSnapshot)
  }
  const saveProjectDocument = (update: Pick<TaskDocument, 'title' | 'content'>) => {
    if (!selectedProjectId) return
    void service.updateProjectDocument(selectedProjectId, update).then(setSnapshot)
  }

  if (error) return <section aria-live="polite" className="tasks-state"><p>{copy.error}</p><Button onPress={() => { void load() }}>{copy.actions.retry}</Button></section>
  if (!snapshot) return <section aria-live="polite" className="tasks-state">{copy.loading}</section>

  const projects = selectTaskProjects(localizedTasksSnapshot(snapshot, locale), currentUser)
  const selectedProject = projects.find((project) => project.id === selectedProjectId)
  if (selectedProject) {
    if (selectedDocument?.kind === 'project-detail') return <section ref={pageRef}><TaskDocumentSurface backLabel={copy.document.backToProject(selectedProject.name)} copy={copy.document} document={selectedProject.detailDocument} label={copy.document.projectDetail} onBack={() => setSelectedDocument(null)} onSave={saveProjectDocument} /></section>
    const selectedTodo = selectedDocument?.kind === 'ai-product' ? selectedProject.todos.find((todo) => todo.id === selectedDocument.todoId) : undefined
    if (selectedTodo?.aiProduct) return <section ref={pageRef}><TaskAiProductDocument copy={copy} onBack={() => setSelectedDocument(null)} onSave={saveAiProduct} project={selectedProject} todo={selectedTodo as typeof selectedTodo & { aiProduct: TaskAiProduct }} /></section>
    return <section ref={pageRef}><TaskProjectDetail copy={copy} locale={locale} onOpenAiProduct={(todoId) => { pageRef.current?.closest<HTMLElement>('.workspace-canvas')?.scrollTo({ top: 0 }); setSelectedDocument({ kind: 'ai-product', todoId }) }} onOpenProjectDetail={() => { pageRef.current?.closest<HTMLElement>('.workspace-canvas')?.scrollTo({ top: 0 }); setSelectedDocument({ kind: 'project-detail' }) }} onTodoStatusChange={updateTodoStatus} project={selectedProject} updatingTodoId={updatingTodoId} /></section>
  }

  const summary = getTasksSummary(projects, currentUser)
  const myTodos = myTodoProgress(projects, currentUser)
  return <section className="tasks-page" ref={pageRef}>
    <section aria-label={copy.dashboard.title} className="tasks-dashboard">
      <div className="task-metric"><span>{copy.dashboard.projects}</span><strong>{summary.projects}</strong><small>{copy.dashboard.owned(summary.owned)}</small></div>
      <div className="task-metric task-metric-arch"><span>{copy.dashboard.myTodos}</span><div aria-label={copy.progress(myTodos.completed, myTodos.total, myTodos.percent)} className="task-metric-arc" role="img"><svg aria-hidden="true" viewBox="0 0 200 112"><path className="task-metric-arc-track" d="M 20 100 A 80 80 0 0 1 180 100" pathLength="100" /><path className="task-metric-arc-progress" d="M 20 100 A 80 80 0 0 1 180 100" pathLength="100" style={{ strokeDasharray: `${myTodos.percent} 100` }} /></svg><strong>{myTodos.completed}/{myTodos.total}</strong><small>{copy.dashboard.myTodosHint}</small></div></div>
      <div className="task-metric"><span>{copy.dashboard.attention}</span><strong>{summary.attention}</strong><small>{copy.dashboard.attentionHint(summary.overdueProjects, summary.blockedProjects)}</small></div>
    </section>
    {projects.length ? <div className="tasks-project-list"><div className="task-project-table-head"><span>{copy.list.project}</span><span>{copy.list.status}</span><span>{copy.list.owner}</span><span>{copy.list.progress}</span><span>{copy.list.personalTodos}</span></div>{projects.map((project) => {
      const progress = projectProgress(project)
      const displayStatus = projectDisplayStatus(project)
      return <div className="task-project-row" key={project.id}><Button aria-label={project.name} className="task-project-open" onPress={() => openProject(project)} type="button" variant="ghost"><span className="task-project-name"><strong title={project.name}>{project.name}</strong></span><span><i className={`task-status task-status-${displayStatus}`}>{copy.projectStatus[displayStatus]}</i></span><span title={project.owner}>{project.owner}</span><span>{copy.fraction(progress.completed, progress.total)}</span></Button><PersonalTodos copy={copy} currentUser={currentUser} project={project} /></div>
    })}</div> : <section className="tasks-state"><p>{copy.empty}</p></section>}
  </section>
}
