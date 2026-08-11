import { useEffect, useState } from 'react'
import { Button, Dropdown, Modal, useOverlayState } from '@heroui/react'
import { Button as AriaButton } from 'react-aria-components'
import { resolveRoute } from '../appState.ts'
import type { Locale, Route, Session } from '../appState.ts'
import { translations } from '../content/translations.ts'
import { saveSession } from '../sessionStore.ts'
import Icon from './Icon.tsx'
import type { IconName } from './Icon.tsx'
import FeedbackWorkspace from './FeedbackWorkspace.tsx'
import HomeWorkspace from './HomeWorkspace.tsx'
import MemoryWorkspace from './MemoryWorkspace.tsx'
import SettingsWorkspace from './SettingsWorkspace.tsx'
import Brand from './Brand.tsx'
import TasksWorkspace from './TasksWorkspace.tsx'
import type { TasksDetailHeader } from './TasksWorkspace.tsx'

type WorkspaceProps = {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
  onSignOut: () => void
  session: Session
}

const pages: Array<{ id: Route; icon: IconName }> = [
  { id: 'home', icon: 'home' },
  { id: 'tasks', icon: 'tasks' },
  { id: 'memory', icon: 'memory' },
  { id: 'feedback', icon: 'feedback' },
  { id: 'settings', icon: 'settings' },
]

export default function Workspace({ locale, onLocaleChange, onSignOut, session }: WorkspaceProps) {
  const storedRoute = resolveRoute(session.route)
  const [route, setRoute] = useState<Route>(() => storedRoute === 'settings' ? 'home' : storedRoute)
  const [settingsOpen, setSettingsOpen] = useState(() => storedRoute === 'settings')
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

  const openSettings = () => setSettingsOpen(true)

  const goTo = (nextRoute: unknown) => {
    const next = resolveRoute(nextRoute)
    if (next === 'settings') openSettings()
    else if (next === 'tasks' && route === 'tasks' && tasksDetailHeader) setTasksListRequest((request) => request + 1)
    else {
      setTasksDetailHeader(null)
      setRoute(next)
    }
  }

  return (
    <main className="workspace-shell">
      <header aria-hidden={settingsOpen} className="workspace-global-bar" inert={settingsOpen || undefined}>
        <div className="workspace-tools">
          <Button aria-label={copy.unavailableNotifications} className="icon-button" isDisabled isIconOnly type="button"><Icon name="bell" /><span className="sr-only">{copy.unavailableNotifications}</span></Button>
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
        </div>
      </header>

      <aside aria-hidden={settingsOpen} className="workspace-rail" inert={settingsOpen || undefined}>
        <Brand className="workspace-brand" />
        <nav aria-label={copy.primaryNavigation} className="workspace-nav">
          {pages.slice(0, 4).map((page) => (
            <Button className={route === page.id ? 'nav-item nav-item-active' : 'nav-item'} key={page.id} onPress={() => goTo(page.id)} type="button">
              <Icon name={page.icon} />
              <span>{copy.nav[page.id]}</span>
            </Button>
          ))}
        </nav>
        <div className="workspace-rail-bottom">
          <Button className={settingsOpen ? 'nav-item nav-item-active' : 'nav-item'} onPress={openSettings} type="button">
            <Icon name="settings" />
            <span>{copy.nav.settings}</span>
          </Button>
        </div>
      </aside>

      <section aria-hidden={settingsOpen} aria-label={copy.content(currentLabel)} className="workspace-canvas" inert={settingsOpen || undefined}>
        <header className={`workspace-header${route === 'memory' ? ' workspace-header-compact' : ''}`}>
          <div className="workspace-header-title"><h1>{route === 'home' ? copy.greeting(name) : tasksDetailHeader?.title ?? currentLabel}</h1>{route === 'tasks' && tasksDetailHeader && <span className={`task-status task-status-${tasksDetailHeader.status}`}>{copy.tasks.projectStatus[tasksDetailHeader.status]}</span>}</div>
        </header>

        {route === 'feedback' ? (
          <FeedbackWorkspace locale={locale} />
        ) : route === 'memory' ? (
          <MemoryWorkspace locale={locale} />
        ) : route === 'home' ? (
          <HomeWorkspace locale={locale} onOpenSettings={openSettings} />
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
              <Button className="modal-confirm" onPress={onSignOut}>{copy.signOut}</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {settingsOpen && <SettingsWorkspace locale={locale} onClose={() => setSettingsOpen(false)} onLocaleChange={onLocaleChange} onNavigate={goTo} />}
    </main>
  )
}
