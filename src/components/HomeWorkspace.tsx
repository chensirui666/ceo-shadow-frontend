import { useEffect, useRef, useState } from 'react'
import { Button, Modal, useOverlayState } from '@heroui/react'
import type { Locale } from '../appState.ts'
import { translations } from '../content/translations.ts'
import { homeService } from '../homeService.ts'
import { activityHours, modeChangeNeedsConfirmation, selectHomeEvents } from '../homeState.ts'
import type { HomeSource, HomeSnapshot, OperatingMode, OwnerFeedback } from '../homeState.ts'
import HomeActivityChart from './HomeActivityChart.tsx'
import HomeEventDetail from './HomeEventDetail.tsx'
import HomeEventList from './HomeEventList.tsx'

type HomeWorkspaceProps = {
  locale: Locale
  onOpenSettings: () => void
}

const homeDate = (locale: Locale) => new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date())

type ModeConfirmationProps = {
  copy: typeof translations.zh.workspace.home
  mode: OperatingMode
  onConfirm: () => Promise<void>
  secondary?: boolean
  triggerLabel: string
}

function ModeConfirmation({ copy, mode, onConfirm, secondary = false, triggerLabel }: ModeConfirmationProps) {
  const dialog = useOverlayState()
  const [busy, setBusy] = useState(false)

  const confirm = () => {
    setBusy(true)
    void onConfirm().then(dialog.close).finally(() => setBusy(false))
  }

  return <Modal state={dialog}>
    <Modal.Trigger className={`home-mode-trigger${secondary ? ' home-mode-trigger-secondary' : ''}`}>{triggerLabel}</Modal.Trigger>
    <Modal.Backdrop className="home-mode-backdrop"><Modal.Container className="home-mode-container" placement="center"><Modal.Dialog className="home-mode-dialog"><Modal.Header><Modal.Heading>{copy.confirmation.title(mode)}</Modal.Heading></Modal.Header><Modal.Body>{copy.confirmation.body(mode)}</Modal.Body><Modal.Footer><Button isDisabled={busy} onPress={dialog.close} variant="secondary">{copy.actions.cancel}</Button><Button isPending={busy} onPress={confirm}>{copy.confirmation.confirm(mode)}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
  </Modal>
}

export default function HomeWorkspace({ locale, onOpenSettings }: HomeWorkspaceProps) {
  const copy = translations[locale].workspace.home
  const [snapshot, setSnapshot] = useState<HomeSnapshot | null>(null)
  const [error, setError] = useState(false)
  const [source, setSource] = useState<HomeSource | 'all'>('all')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const pageRef = useRef<HTMLElement>(null)
  const savedScrollTop = useRef(0)
  const restoringScroll = useRef(false)

  const load = () => {
    setError(false)
    return homeService.load().then(setSnapshot).catch(() => setError(true))
  }

  useEffect(() => { void load() }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (selectedEventId || !restoringScroll.current) return
    window.requestAnimationFrame(() => {
      pageRef.current?.closest<HTMLElement>('.workspace-canvas')?.scrollTo({ top: savedScrollTop.current })
      restoringScroll.current = false
    })
  }, [selectedEventId])

  const openEvent = (eventId: string) => {
    const canvas = pageRef.current?.closest<HTMLElement>('.workspace-canvas')
    savedScrollTop.current = canvas?.scrollTop ?? 0
    canvas?.scrollTo({ top: 0 })
    setSelectedEventId(eventId)
  }

  const returnToList = () => {
    restoringScroll.current = true
    setSelectedEventId(null)
  }

  const updateMode = (mode: OperatingMode) => homeService.updateMode(mode).then(setSnapshot)

  const resolveEvent = (eventId: string, decision: 'send' | 'cancel', reply: string) => {
    setBusy(true)
    void homeService.resolveEvent(eventId, decision, reply).then((next) => {
      setSnapshot(next)
      setBusy(false)
    })
  }

  const submitFeedback = (eventId: string, feedback: OwnerFeedback) => {
    void homeService.submitOwnerFeedback(eventId, feedback).then(setSnapshot)
  }

  if (error) return <section aria-live="polite" className="home-state"><p>{copy.empty.error}</p><Button onPress={() => { void load() }}>{copy.actions.retry}</Button></section>
  if (!snapshot) return <section aria-live="polite" className="home-state">{copy.empty.loading}</section>
  if (!snapshot.connectedSources.length) return <section className="home-state"><p>{copy.empty.noConnections}</p><Button onPress={onOpenSettings}>{copy.actions.goToSettings}</Button></section>

  const selectedEvent = snapshot.events.find((event) => event.id === selectedEventId)
  if (selectedEvent) return <HomeEventDetail busy={busy} copy={copy} event={selectedEvent} onBack={returnToList} onResolve={(decision, reply) => resolveEvent(selectedEvent.id, decision, reply)} onSubmitFeedback={(feedback) => submitFeedback(selectedEvent.id, feedback)} sourceName={copy.sources[selectedEvent.source]} />

  const events = selectHomeEvents(snapshot, source)
  const nextMode = snapshot.mode === 'trial' ? 'active' : snapshot.mode === 'active' ? 'paused' : 'active'
  const modeAction = modeChangeNeedsConfirmation(snapshot.mode, nextMode)
    ? <ModeConfirmation copy={copy} mode={nextMode} onConfirm={() => updateMode(nextMode)} triggerLabel={copy.mode.action(snapshot.mode)} />
    : <Button onPress={() => { void updateMode(nextMode) }}>{copy.mode.action(snapshot.mode)}</Button>

  return <section className="home-page" ref={pageRef}>
    <div className="home-page-heading"><h2>{copy.title}</h2><time>{homeDate(locale)}</time></div>
    <section className="home-mode" aria-label={copy.mode.label(snapshot.mode)}>
      <div><strong>{copy.mode.label(snapshot.mode)}</strong><p>{copy.mode.description(snapshot.mode)}</p></div>
      <div className="home-mode-actions">{modeAction}{snapshot.mode === 'active' && <ModeConfirmation copy={copy} mode="trial" onConfirm={() => updateMode('trial')} secondary triggerLabel={copy.mode.switchToTrial} />}</div>
      <p className="home-demo-disclosure">{copy.demoDisclosure}</p>
    </section>
    <HomeActivityChart activity={activityHours(events, now)} copy={copy} />
    <label className="home-source-filter">{copy.source}<select onChange={(event) => setSource(event.target.value as HomeSource | 'all')} value={source}><option value="all">{copy.allSources}</option>{snapshot.connectedSources.map((item) => <option key={item} value={item}>{copy.sources[item]}</option>)}</select></label>
    {events.length ? <HomeEventList copy={copy} events={events} now={now} onOpen={openEvent} sourceNames={copy.sources} /> : <section className="home-state"><p>{source === 'all' ? copy.empty.events : copy.empty.source(copy.sources[source])}</p>{source !== 'all' && <Button onPress={() => setSource('all')} variant="secondary">{copy.actions.clearSource}</Button>}</section>}
  </section>
}
