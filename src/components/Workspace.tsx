import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Dropdown, Modal, useOverlayState } from '@heroui/react'
import { Button as AriaButton } from 'react-aria-components'
import { resolveRoute } from '../appState.ts'
import type { Locale, Route, Session } from '../appState.ts'
import { translations } from '../content/translations.ts'
import RoutineWorkspace from './RoutineWorkspace.tsx'
import type { RoutineLeaveGuard } from './RoutineWorkspace.tsx'
import { createRoutineService } from '../routineService.ts'
import { createMessageService } from '../messageService.ts'
import { createLibraryService } from '../libraryService.ts'
import LibraryWorkspace from './LibraryWorkspace.tsx'
import { createContactsService } from '../contactsService.ts'
import ContactsWorkspace from './ContactsWorkspace.tsx'
import { createOnboardingState, needsOnboarding } from '../onboardingState.ts'
import { createBackgroundProgressState, markBackgroundNotificationsRead, queueBackgroundJob } from '../backgroundProgressState.ts'
import type { BackgroundJobKind } from '../backgroundProgressState.ts'
import { hasSeenOnboardingWelcome, markOnboardingWelcomeSeen, saveSession } from '../sessionStore.ts'
import type { SettingsSection } from '../settingsState.ts'
import Icon from './Icon.tsx'
import type { IconName } from './Icon.tsx'
import FeedbackWorkspace from './FeedbackWorkspace.tsx'
import MemoryWorkspace from './MemoryWorkspace.tsx'
import MessageWorkspace from './MessageWorkspace.tsx'
import OnboardingHome from './OnboardingHome.tsx'
import SettingsWorkspace from './SettingsWorkspace.tsx'
import Brand from './Brand.tsx'
import TasksWorkspace from './TasksWorkspace.tsx'
import type { TasksDetailHeader } from './TasksWorkspace.tsx'
import { BackgroundProgressPanel } from './BackgroundProgressPanel.tsx'
import { BackgroundNotificationsPanel } from './BackgroundNotificationsPanel.tsx'

type WorkspaceProps = {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
  onSignOut: () => void
  session: Session
}

const pages: Array<{ id: Route; icon: IconName }> = [
  { id: 'home', icon: 'home' },
  { id: 'routine', icon: 'routine' },
  { id: 'tasks', icon: 'tasks' },
  { id: 'library', icon: 'library' },
  { id: 'contacts', icon: 'contacts' },
  { id: 'memory', icon: 'memory' },
  { id: 'feedback', icon: 'feedback' },
  { id: 'settings', icon: 'settings' },
]

export default function Workspace({ locale, onLocaleChange, onSignOut, session }: WorkspaceProps) {
  const storedRoute = resolveRoute(session.route)
  const [route, setRoute] = useState<Route>(() => storedRoute === 'settings' ? 'home' : storedRoute)
  const [settingsOpen, setSettingsOpen] = useState(() => storedRoute === 'settings')
  const [onboarding, setOnboarding] = useState(() => needsOnboarding(session.email))
  const [onboardingState, setOnboardingState] = useState(() => createOnboardingState())
  const [backgroundProgress, setBackgroundProgress] = useState(createBackgroundProgressState)
  const [backgroundProgressOpen, setBackgroundProgressOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const backgroundProgressTimer = useRef<number | null>(null)
  const [settingsSection, setSettingsSection] = useState<SettingsSection | undefined>()
  const [welcomeOpen, setWelcomeOpen] = useState(() => typeof window === 'undefined' || !hasSeenOnboardingWelcome(window.localStorage, session.email))
  const [routineService] = useState(() => createRoutineService(typeof window === 'undefined' ? undefined : window.localStorage, session.email, { locale, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }))
  const routineLeaveGuard = useRef<RoutineLeaveGuard | null>(null)
  const registerRoutineGuard = useCallback((guard: RoutineLeaveGuard | null) => { routineLeaveGuard.current = guard }, [])
  const [routineVisit, setRoutineVisit] = useState(0)
  const [sessionMessageService] = useState(createMessageService)
  const [sessionLibraryService] = useState(createLibraryService)
  const [sessionContactsService] = useState(createContactsService)
  const [messageSourceId, setMessageSourceId] = useState<string | undefined>()
  const [tasksDetailHeader, setTasksDetailHeader] = useState<TasksDetailHeader | null>(null)
  const [tasksListRequest, setTasksListRequest] = useState(0)
  const exitDialog = useOverlayState()
  const name = session.email.split('@')[0]
  const copy = translations[locale].workspace
  const current = pages.find((page) => page.id === route) ?? pages[0]
  const currentLabel = copy.nav[current.id]
  const pageCopy = copy.pages[route]

  useEffect(() => {
    saveSession(window.localStorage, { ...session, route })
  }, [route, session])

  useEffect(() => () => {
    if (backgroundProgressTimer.current !== null) window.clearTimeout(backgroundProgressTimer.current)
  }, [])

  const openSettings = (section?: SettingsSection) => {
    setSettingsSection(section)
    setSettingsOpen(true)
  }
  const dismissWelcome = () => {
    markOnboardingWelcomeSeen(window.localStorage, session.email)
    setWelcomeOpen(false)
  }

  const goTo = (nextRoute: unknown) => {
    setMessageSourceId(undefined)
    const next = resolveRoute(nextRoute)
    if (next === 'settings') { openSettings(); return }
    const navigate = () => {
      if (next === 'tasks' && route === 'tasks' && tasksDetailHeader) setTasksListRequest((request) => request + 1)
      else {
        setTasksDetailHeader(null)
        if (next === 'routine') setRoutineVisit((visit) => visit + 1)
        setRoute(next)
      }
    }
    if (route === 'routine' && routineLeaveGuard.current) routineLeaveGuard.current(navigate)
    else navigate()
  }

  const finishOnboarding = () => {
    setOnboarding(false)
    setRoute('home')
  }
  const queueBackground = (kind: BackgroundJobKind) => {
    setBackgroundProgress((current) => queueBackgroundJob(current, kind))
    setNotificationsOpen(false)
    setBackgroundProgressOpen(true)
    if (backgroundProgressTimer.current !== null) window.clearTimeout(backgroundProgressTimer.current)
    backgroundProgressTimer.current = window.setTimeout(() => setBackgroundProgressOpen(false), 3_000)
  }
  const toggleNotifications = () => {
    const opening = !notificationsOpen
    setNotificationsOpen(opening)
    if (opening) {
      setBackgroundProgressOpen(false)
      setBackgroundProgress((current) => markBackgroundNotificationsRead(current))
    }
  }
  const openWorkStyleNotification = () => {
    setNotificationsOpen(false)
    openSettings('profile')
  }

  return (
    <main className="workspace-shell">
      <header aria-hidden={settingsOpen} className="workspace-global-bar" inert={settingsOpen || undefined}>
        <div className="workspace-tools">
          <Button aria-expanded={backgroundProgressOpen} aria-label={copy.backgroundProgress.open} className="background-progress-trigger" isIconOnly onPress={() => { setNotificationsOpen(false); setBackgroundProgressOpen((open) => !open) }} type="button"><Icon name="progress" /></Button>
          <Button aria-expanded={notificationsOpen} aria-label={copy.notifications.open} className="notification-trigger" isIconOnly onPress={toggleNotifications} type="button"><Icon name="bell" />{backgroundProgress.unreadCompletedJobs.length > 0 && <i aria-hidden="true" />}</Button>
          <Dropdown>
            <AriaButton aria-label={copy.openAccountMenu} className="account-menu-trigger" type="button"><Icon name="user" /></AriaButton>
            <Dropdown.Popover className="account-menu-popover" placement="bottom right">
              <div className="account-profile">
                <span aria-hidden="true" className="avatar-fallback">{name.slice(0, 1).toUpperCase()}</span>
                <span className="account-profile-email">{session.email}</span>
              </div>
              <Dropdown.Menu aria-label={copy.accountMenu} className="account-menu" onAction={(key) => key === 'sign-out' && exitDialog.open()}>
                <Dropdown.Item className="account-menu-item" id="sign-out" textValue={copy.signOut}>{copy.signOut}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
          {backgroundProgressOpen && <div className="background-progress-popover"><BackgroundProgressPanel copy={copy.backgroundProgress} jobs={backgroundProgress.jobs.filter((job) => job.status === 'running')} /></div>}
          {notificationsOpen && <div className="background-notifications-popover"><BackgroundNotificationsPanel copy={copy.notifications} jobs={backgroundProgress.jobs} onOpenWorkStyle={openWorkStyleNotification} /></div>}
        </div>
      </header>

      <aside aria-hidden={settingsOpen} className="workspace-rail" inert={settingsOpen || undefined}>
        <Brand className="workspace-brand" />
        <nav aria-label={copy.primaryNavigation} className="workspace-nav">
          {pages.filter((page) => page.id !== 'settings').map((page) => (
            <Button className={route === page.id ? 'nav-item nav-item-active' : 'nav-item'} key={page.id} onPress={() => goTo(page.id)} type="button">
              <Icon name={page.icon} />
              <span>{copy.nav[page.id]}</span>
            </Button>
          ))}
        </nav>
        <div className="workspace-rail-bottom">
          <Button className={settingsOpen ? 'nav-item nav-item-active' : 'nav-item'} onPress={() => openSettings()} type="button">
            <Icon name="settings" />
            <span>{copy.nav.settings}</span>
          </Button>
        </div>
      </aside>

      <section aria-hidden={settingsOpen} aria-label={copy.content(currentLabel)} className="workspace-canvas" inert={settingsOpen || undefined}>
        {route !== 'home' && route !== 'routine' && route !== 'library' && route !== 'contacts' && <header className={`workspace-header${route === 'memory' ? ' workspace-header-compact' : ''}`}>
          <div className="workspace-header-title"><h1>{tasksDetailHeader?.title ?? currentLabel}</h1>{route === 'tasks' && tasksDetailHeader && <span className={`task-status task-status-${tasksDetailHeader.status}`}>{copy.tasks.projectStatus[tasksDetailHeader.status]}</span>}</div>
        </header>}

        {route === 'library' ? (
          <LibraryWorkspace locale={locale} service={sessionLibraryService} onOpenSource={(source) => { if (source.kind === 'message') { setMessageSourceId(source.recordId); setRoute('home') } }} />
        ) : route === 'contacts' ? (
          <ContactsWorkspace copy={copy.contacts} locale={locale} onOpenSettings={() => openSettings('apps')} service={sessionContactsService} />
        ) : route === 'routine' ? (
          <RoutineWorkspace key={routineVisit} locale={locale} service={routineService} registerLeaveGuard={registerRoutineGuard} />
        ) : route === 'feedback' ? (
          <FeedbackWorkspace locale={locale} />
        ) : route === 'memory' ? (
          <MemoryWorkspace locale={locale} />
        ) : route === 'home' ? (
          onboarding && !messageSourceId
            ? <OnboardingHome initialState={onboardingState} locale={locale} onComplete={finishOnboarding} onQueueBackgroundJob={queueBackground} onStateChange={setOnboardingState} onWelcomeDismiss={dismissWelcome} welcomeOpen={welcomeOpen} />
            : <MessageWorkspace copy={copy.message} initialMessageId={messageSourceId} key={messageSourceId ?? 'messages'} onOpenSettings={openSettings} service={sessionMessageService} />
        ) : route === 'tasks' ? (
          <TasksWorkspace currentUser={name} locale={locale} onDetailHeaderChange={setTasksDetailHeader} returnToListRequest={tasksListRequest} />
        ) : (
          <section className="empty-page">
            <p className="eyebrow">{currentLabel}</p>
            <h2>{pageCopy[0]}</h2>
            <p>{pageCopy[1]}</p>
            <Button className="empty-action" onPress={() => goTo('home')}>{pageCopy[2]}</Button>
          </section>
        )}
      </section>

      <Modal.Backdrop className="exit-backdrop" isOpen={exitDialog.isOpen} onOpenChange={exitDialog.setOpen}>
        <Modal.Container className="exit-container" placement="center">
          <Modal.Dialog className="exit-dialog">
            <Modal.Header><Modal.Heading className="exit-title">{copy.exit.title}</Modal.Heading></Modal.Header>
            <Modal.Body className="exit-body">{copy.exit.body}</Modal.Body>
            <Modal.Footer className="exit-footer">
              <Button className="modal-cancel" onPress={exitDialog.close}>{copy.exit.cancel}</Button>
              <Button className="modal-confirm" onPress={() => { const leave = () => { exitDialog.close(); onSignOut() }; if (route === 'routine' && routineLeaveGuard.current) routineLeaveGuard.current(leave); else leave() }}>{copy.signOut}</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {settingsOpen && <SettingsWorkspace initialSection={settingsSection} locale={locale} onClose={() => { setSettingsOpen(false); setSettingsSection(undefined) }} onLocaleChange={onLocaleChange} onNavigate={goTo} />}
    </main>
  )
}
