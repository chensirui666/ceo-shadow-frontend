import { useEffect, useRef, useState } from 'react'
import { Button, Dropdown, ListBox, Modal, Select, useOverlayState } from '@heroui/react'
import { ChevronDown } from 'lucide-react'
import type { Locale } from '../appState.ts'
import { translations } from '../content/translations.ts'
import type { HomeCopy } from '../content/translations.ts'
import { homeService } from '../homeService.ts'
import type { HomeService } from '../homeService.ts'
import { activityHours, localizedHomeSnapshot, progressWaitingEvents, selectHomeEvents } from '../homeState.ts'
import type { HomeSource, HomeSnapshot, OperatingMode, OwnerFeedback } from '../homeState.ts'
import HomeActivityChart from './HomeActivityChart.tsx'
import HomeEventDetail from './HomeEventDetail.tsx'
import HomeEventList from './HomeEventList.tsx'

type HomeWorkspaceProps = {
  locale: Locale
  onOpenSettings: () => void
  service?: HomeService
}

type ModePickerProps = {
  copy: HomeCopy
  mode: OperatingMode
  onModeChange: (mode: OperatingMode) => Promise<void>
}

function ModePicker({ copy, mode, onModeChange }: ModePickerProps) {
  const dialog = useOverlayState()
  const [busy, setBusy] = useState(false)
  const [pendingMode, setPendingMode] = useState<OperatingMode | null>(null)
  const modes: OperatingMode[] = ['active', 'trial', 'paused']

  const close = () => {
    dialog.close()
    setPendingMode(null)
  }

  const choose = (nextMode: OperatingMode) => {
    if (nextMode === mode) return
    setPendingMode(nextMode)
    dialog.open()
  }

  const confirm = () => {
    if (!pendingMode) return
    setBusy(true)
    void onModeChange(pendingMode).then(close).finally(() => setBusy(false))
  }

  return <div className="home-source-mode">
    <Dropdown>
      <Button aria-label={copy.mode.label} className="home-mode-trigger" type="button">{copy.mode.choices[mode]}<ChevronDown aria-hidden="true" /></Button>
      <Dropdown.Popover className="home-mode-menu" placement="bottom right"><Dropdown.Menu aria-label={copy.mode.label} onAction={(key) => choose(key as OperatingMode)} selectedKeys={[mode]} selectionMode="single">{modes.map((item) => <Dropdown.Item id={item} key={item} textValue={copy.mode.choices[item]}>{copy.mode.choices[item]}<Dropdown.ItemIndicator /></Dropdown.Item>)}</Dropdown.Menu></Dropdown.Popover>
    </Dropdown>
    <Modal state={dialog}>
      {pendingMode && <Modal.Backdrop className="home-mode-backdrop"><Modal.Container className="home-mode-container" placement="center"><Modal.Dialog className="home-mode-dialog"><Modal.Header><Modal.Heading>{copy.confirmation.title(pendingMode)}</Modal.Heading></Modal.Header><Modal.Body>{copy.confirmation.body(pendingMode)}</Modal.Body><Modal.Footer><Button isDisabled={busy} onPress={close} variant="secondary">{copy.actions.cancel}</Button><Button isPending={busy} onPress={confirm}>{copy.confirmation.confirm(pendingMode)}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>}
    </Modal>
  </div>
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
  return <div className="home-source-row">
    <div className="home-source-filter"><span>{copy.source}</span><Select aria-label={copy.source} className="home-source-select" onSelectionChange={(key) => onSourceChange(key as HomeSource | 'all')} selectedKey={source} variant="secondary"><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox><ListBox.Item id="all" textValue={copy.allSources}>{copy.allSources}<ListBox.ItemIndicator /></ListBox.Item>{connectedSources.map((item) => <ListBox.Item id={item} key={item} textValue={copy.sources[item]}>{copy.sources[item]}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover></Select></div>
    <ModePicker copy={copy} mode={mode} onModeChange={onModeChange} />
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

  const localizedSnapshot = localizedHomeSnapshot(snapshot, locale)
  const selectedEvent = localizedSnapshot.events.find((event) => event.id === selectedEventId)
  if (selectedEvent) return <HomeEventDetail busy={busy} copy={copy} event={selectedEvent} mode={localizedSnapshot.mode} now={now} onBack={returnToList} onResolve={(decision, reply) => resolveEvent(selectedEvent.id, decision, reply)} onSubmitFeedback={(feedback) => submitFeedback(selectedEvent.id, feedback)} sourceName={copy.sources[selectedEvent.source]} />

  const events = selectHomeEvents(localizedSnapshot, source)

  return <section className="home-page" ref={pageRef}>
    <HomeActivityChart activity={activityHours(events, now)} copy={copy} />
    <HomeSourceRow connectedSources={localizedSnapshot.connectedSources} copy={copy} mode={localizedSnapshot.mode} onModeChange={updateMode} onSourceChange={setSource} source={source} />
    {events.length ? <HomeEventList copy={copy} events={events} mode={localizedSnapshot.mode} now={now} onOpen={openEvent} sourceNames={copy.sources} /> : <section className="home-state"><p>{source === 'all' ? copy.empty.events : copy.empty.source(copy.sources[source])}</p>{source !== 'all' && <Button onPress={() => setSource('all')} variant="secondary">{copy.actions.clearSource}</Button>}</section>}
  </section>
}
