import { useEffect, useRef, useState } from 'react'
import { Button, Modal, useOverlayState } from '@heroui/react'
import type { Locale } from '../appState.ts'
import { translations } from '../content/translations.ts'
import type { HomeCopy } from '../content/translations.ts'
import { homeService } from '../homeService.ts'
import type { HomeService } from '../homeService.ts'
import { activityHours, modeChangeNeedsConfirmation, progressWaitingEvents, selectHomeEvents } from '../homeState.ts'
import type { HomeSource, HomeSnapshot, OperatingMode, OwnerFeedback } from '../homeState.ts'
import HomeActivityChart from './HomeActivityChart.tsx'
import HomeEventDetail from './HomeEventDetail.tsx'
import HomeEventList from './HomeEventList.tsx'

type HomeWorkspaceProps = {
  locale: Locale
  onOpenSettings: () => void
  service?: HomeService
}

type ModeConfirmationProps = {
  copy: HomeCopy
  mode: OperatingMode
  onConfirm: () => Promise<void>
  triggerLabel: string
}

function ModeConfirmation({ copy, mode, onConfirm, triggerLabel }: ModeConfirmationProps) {
  const dialog = useOverlayState()
  const [busy, setBusy] = useState(false)

  const confirm = () => {
    setBusy(true)
    void onConfirm().then(dialog.close).finally(() => setBusy(false))
  }

  return <Modal state={dialog}>
    <Modal.Trigger className="home-mode-trigger">{triggerLabel}</Modal.Trigger>
    <Modal.Backdrop className="home-mode-backdrop"><Modal.Container className="home-mode-container" placement="center"><Modal.Dialog className="home-mode-dialog"><Modal.Header><Modal.Heading>{copy.confirmation.title(mode)}</Modal.Heading></Modal.Header><Modal.Body>{copy.confirmation.body(mode)}</Modal.Body><Modal.Footer><Button isDisabled={busy} onPress={dialog.close} variant="secondary">{copy.actions.cancel}</Button><Button isPending={busy} onPress={confirm}>{copy.confirmation.confirm(mode)}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
  </Modal>
}

type HomeSourceRowProps = {
  connectedSources: readonly HomeSource[]
  copy: HomeCopy
  mode: OperatingMode
  onModeChange: (mode: OperatingMode) => Promise<void>
  onSourceChange: (source: HomeSource | 'all') => void
  source: HomeSource | 'all'
}

export function HomeSourceRow({ connectedSources, copy, mode, onModeChange, onSourceChange, source }: HomeSourceRowProps) {
  const nextMode = mode === 'active' ? 'trial' : 'active'
  const modeAction = modeChangeNeedsConfirmation(mode, nextMode)
    ? <ModeConfirmation copy={copy} mode={nextMode} onConfirm={() => onModeChange(nextMode)} triggerLabel={copy.mode.action(mode)} />
    : <Button onPress={() => { void onModeChange(nextMode) }}>{copy.mode.action(mode)}</Button>

  return <div className="home-source-row">
    <label className="home-source-filter">{copy.source}<select onChange={(event) => onSourceChange(event.target.value as HomeSource | 'all')} value={source}><option value="all">{copy.allSources}</option>{connectedSources.map((item) => <option key={item} value={item}>{copy.sources[item]}</option>)}</select></label>
    <div className="home-source-mode">{modeAction}</div>
  </div>
}

export default function HomeWorkspace({ locale, onOpenSettings, service = homeService }: HomeWorkspaceProps) {
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
    return service.load().then(setSnapshot).catch(() => setError(true))
  }

  useEffect(() => { void load() }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = new Date()
      setNow(next)
      // ponytail: local-demo progression; the real service must provide authoritative event states.
      setSnapshot((current) => current && progressWaitingEvents(current, next))
    }, 1_000)
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

  const updateMode = (mode: OperatingMode) => service.updateMode(mode).then(setSnapshot)

  const resolveEvent = (eventId: string, decision: 'send' | 'cancel', reply: string) => {
    setBusy(true)
    void service.resolveEvent(eventId, decision, reply).then((next) => {
      setSnapshot(next)
      setBusy(false)
    })
  }

  const submitFeedback = (eventId: string, feedback: OwnerFeedback) => {
    void service.submitOwnerFeedback(eventId, feedback).then(setSnapshot)
  }

  if (error) return <section aria-live="polite" className="home-state"><p>{copy.empty.error}</p><Button onPress={() => { void load() }}>{copy.actions.retry}</Button></section>
  if (!snapshot) return <section aria-live="polite" className="home-state">{copy.empty.loading}</section>
  if (!snapshot.connectedSources.length) return <section className="home-state"><p>{copy.empty.noConnections}</p><Button onPress={onOpenSettings}>{copy.actions.goToSettings}</Button></section>

  const selectedEvent = snapshot.events.find((event) => event.id === selectedEventId)
  if (selectedEvent) return <HomeEventDetail busy={busy} copy={copy} event={selectedEvent} now={now} onBack={returnToList} onResolve={(decision, reply) => resolveEvent(selectedEvent.id, decision, reply)} onSubmitFeedback={(feedback) => submitFeedback(selectedEvent.id, feedback)} sourceName={copy.sources[selectedEvent.source]} />

  const events = selectHomeEvents(snapshot, source)

  return <section className="home-page" ref={pageRef}>
    <HomeActivityChart activity={activityHours(events, now)} copy={copy} showDefaultTooltip />
    <HomeSourceRow connectedSources={snapshot.connectedSources} copy={copy} mode={snapshot.mode} onModeChange={updateMode} onSourceChange={setSource} source={source} />
    {events.length ? <HomeEventList copy={copy} events={events} now={now} onOpen={openEvent} sourceNames={copy.sources} /> : <section className="home-state"><p>{source === 'all' ? copy.empty.events : copy.empty.source(copy.sources[source])}</p>{source !== 'all' && <Button onPress={() => setSource('all')} variant="secondary">{copy.actions.clearSource}</Button>}</section>}
  </section>
}
