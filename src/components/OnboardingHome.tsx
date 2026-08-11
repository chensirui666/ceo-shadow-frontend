import { useEffect, useRef, useState } from 'react'
import { Button } from '@heroui/react'
import { ArrowRight, CalendarCheck, Check, FileText, MessageCircle, Repeat2, Scale, ShieldCheck } from 'lucide-react'
import connectIllustration from '../assets/onboarding-connect-editorial.png'
import memoryIllustration from '../assets/onboarding-memory-editorial.png'
import trialIllustration from '../assets/onboarding-trial-editorial.png'
import workStyleIllustration from '../assets/onboarding-work-style-editorial.png'
import type { Locale } from '../appState.ts'
import { onboardingConnectorLogos } from '../content/connectorLogos.ts'
import { translations } from '../content/translations.ts'
import { activityHours, homeSources } from '../homeState.ts'
import type { HomeSource } from '../homeState.ts'
import { advanceFromMemory, completeOnboarding, confirmMemory, confirmWorkStyle, connectSource, continueToMemory, createOnboardingState, createTrialEvent, recordTrial, recordTrialFeedback, regenerateTrial, selectOnboardingStep, skipMemory, skipWorkStyle } from '../onboardingState.ts'
import type { OnboardingState } from '../onboardingState.ts'
import HomeActivityChart from './HomeActivityChart.tsx'
import HomeEventDetail from './HomeEventDetail.tsx'
import HomeEventList from './HomeEventList.tsx'

type OnboardingHomeProps = {
  initialState?: OnboardingState
  locale: Locale
  onComplete: (state: OnboardingState) => void
  onOpenMemory: () => void
  onStateChange?: (state: OnboardingState) => void
}

type ActivationStage = 'idle' | 'confirm' | 'celebrating' | 'contacts'
type MemoryStage = 'reading' | 'ready' | 'building' | null
type StyleStage = 'extracting' | 'ready' | null

const contacts = ['刘晨', '周航', '赵明']
const memorySignalIcons = { messages: MessageCircle, documents: FileText, calendar: CalendarCheck }
const memoryFindingIcons = { messages: MessageCircle, documents: FileText, topics: Repeat2 }
const memoryFindingKeys = ['messages', 'documents', 'topics'] as const
const stylePointIcons = [MessageCircle, Scale, ArrowRight, ShieldCheck]

export default function OnboardingHome({ initialState, locale, onComplete, onOpenMemory, onStateChange }: OnboardingHomeProps) {
  const copy = translations[locale].workspace.onboarding
  const homeCopy = translations[locale].workspace.home
  const fallbackInitialState = useRef(createOnboardingState())
  const trialStartedAt = useRef(new Date())
  const [state, setState] = useState(() => initialState ?? fallbackInitialState.current)
  const [connecting, setConnecting] = useState<HomeSource | null>(null)
  const [memoryStage, setMemoryStage] = useState<MemoryStage>(null)
  const [memoryProgress, setMemoryProgress] = useState(0)
  const [styleStage, setStyleStage] = useState<StyleStage>(null)
  const [styleProgress, setStyleProgress] = useState(0)
  const [promptDraft, setPromptDraft] = useState(() => state.workStylePrompt ?? copy.style.prompt)
  const [question, setQuestion] = useState('')
  const [activation, setActivation] = useState<ActivationStage>('idle')
  const [contact, setContact] = useState(contacts[0])
  const [viewingTrial, setViewingTrial] = useState(false)
  const trialEvent = createTrialEvent(state, trialStartedAt.current)
  const trialEvents = trialEvent ? [trialEvent] : []

  useEffect(() => {
    if (memoryStage !== 'reading') return
    const progressTimer = window.setInterval(() => setMemoryProgress((value) => Math.min(value + 2.5, 95)), 100)
    const completionTimer = window.setTimeout(() => {
      window.clearInterval(progressTimer)
      setMemoryProgress(100)
    }, 3_800)
    const summaryTimer = window.setTimeout(() => {
      setMemoryStage('ready')
    }, 4_100)
    return () => {
      window.clearInterval(progressTimer)
      window.clearTimeout(completionTimer)
      window.clearTimeout(summaryTimer)
    }
  }, [memoryStage])

  useEffect(() => {
    if (styleStage !== 'extracting') return
    const progressTimer = window.setInterval(() => setStyleProgress((value) => Math.min(value + 2.5, 95)), 100)
    const completionTimer = window.setTimeout(() => {
      window.clearInterval(progressTimer)
      setStyleProgress(100)
    }, 3_800)
    const editorTimer = window.setTimeout(() => setStyleStage('ready'), 4_100)
    return () => {
      window.clearInterval(progressTimer)
      window.clearTimeout(completionTimer)
      window.clearTimeout(editorTimer)
    }
  }, [styleStage])

  useEffect(() => {
    if (!state.workStylePrompt) setPromptDraft(copy.style.prompt)
  }, [copy.style.prompt, state.workStylePrompt])

  useEffect(() => {
    if (memoryStage !== 'building') return
    const timer = window.setTimeout(() => {
      update(confirmMemory(state))
      setMemoryStage(null)
    }, 800)
    return () => window.clearTimeout(timer)
  }, [memoryStage, state])

  useEffect(() => {
    if (activation !== 'celebrating') return
    const timer = window.setTimeout(() => setActivation('contacts'), 650)
    return () => window.clearTimeout(timer)
  }, [activation])

  const update = (next: OnboardingState) => {
    setState(next)
    onStateChange?.(next)
  }

  const completeConnection = () => {
    if (!connecting) return
    update(connectSource(state, connecting))
    setConnecting(null)
  }

  const beginMemoryRead = () => {
    setMemoryProgress(0)
    setMemoryStage('reading')
  }

  const beginStyleExtraction = () => {
    setPromptDraft(state.workStylePrompt ?? copy.style.prompt)
    setStyleProgress(0)
    setStyleStage('extracting')
  }

  const confirmStyle = () => {
    update(confirmWorkStyle(state, promptDraft))
    setStyleStage(null)
  }

  const beginActivation = () => {
    if (!state.workStyleConfirmed) return
    update(completeOnboarding(state))
    setActivation('celebrating')
  }

  const finish = () => onComplete(completeOnboarding(state))

  const submitTrial = () => {
    if (!question.trim()) return
    trialStartedAt.current = new Date()
    update(recordTrial(state, question))
    setQuestion('')
    setViewingTrial(false)
  }

  return <section className={`onboarding-page onboarding-page-step-${state.step}`}>
    <ol aria-label={copy.progressLabel} className="onboarding-steps">
      {copy.steps.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3 | 4
        const className = state.step === step ? 'onboarding-step onboarding-step-active' : state.maxReached > step ? 'onboarding-step onboarding-step-done' : 'onboarding-step'
        return <li className={className} key={label}><button disabled={step > state.maxReached} onClick={() => update(selectOnboardingStep(state, step))} type="button"><span>{step}</span><strong>{label}</strong></button></li>
      })}
    </ol>

    <section className="onboarding-panel">
      {state.step === 1 && <section className="onboarding-section onboarding-connect-layout">
        <div className="onboarding-connect-content">
          <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(1)}</p><h2>{copy.connection.title}</h2><p>{copy.connection.subtitle}</p></header>
          <p className="onboarding-demo-note">{copy.connection.demo}</p>
          <div className="onboarding-source-list">
            {homeSources.map((source) => {
              const connected = state.connectedSources.includes(source)
              return <div className="onboarding-source-row" key={source}>
                <span aria-hidden="true" className="onboarding-source-glyph"><img alt="" src={onboardingConnectorLogos[source]} /></span>
                <span><strong>{homeCopy.sources[source]}</strong><small>{copy.connection.scope[source]}</small></span>
                {connected ? <span className="onboarding-connected">{copy.connection.connected}</span> : <Button className="onboarding-connect-button" onPress={() => setConnecting(source)} type="button">{copy.connection.connect}</Button>}
              </div>
            })}
          </div>
          <footer className="onboarding-section-footer"><Button className="onboarding-continue-action" isDisabled={!state.connectedSources.length} onPress={() => update(continueToMemory(state))} type="button">{copy.actions.continue}</Button><p>{copy.connection.continueHint}</p></footer>
        </div>
        <aside aria-hidden="true" className="onboarding-connect-artwork">
          <img alt="" src={connectIllustration} />
        </aside>
      </section>}

      {state.step === 2 && <section className="onboarding-section onboarding-editorial-layout onboarding-memory-layout">
        <div className="onboarding-editorial-content">
          <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(2)}</p><h2>{copy.memory.title}</h2><p>{copy.memory.subtitle}</p></header>
          <div className="onboarding-memory-sources">
            <p>{copy.memory.connectedTitle}</p>
            <div className="onboarding-memory-source-list">{state.connectedSources.map((source) => <div className="onboarding-memory-source" key={source}>
              <img alt="" src={onboardingConnectorLogos[source]} />
              <span><strong>{homeCopy.sources[source]}</strong><small>{copy.memory.connected}</small></span>
              <span className="onboarding-read-only"><Check aria-hidden="true" />{copy.memory.readOnly}</span>
            </div>)}</div>
            <div className="onboarding-memory-signals"><p>{copy.memory.signalsTitle}</p><ul>{(Object.keys(memorySignalIcons) as Array<keyof typeof memorySignalIcons>).map((signal) => {
              const SignalIcon = memorySignalIcons[signal]
              const [label, description] = copy.memory.signals[signal]
              return <li key={signal}><SignalIcon aria-hidden="true" /><span><strong>{label}</strong><small>{description}</small></span></li>
            })}</ul></div>
          </div>
          <footer className="onboarding-section-footer onboarding-section-footer-actions onboarding-memory-actions">
            {state.memoryConfirmed ? <><Button onPress={onOpenMemory} type="button" variant="secondary">{copy.memory.view}</Button><Button onPress={() => update(advanceFromMemory(state))} type="button">{copy.memory.proceed}</Button></> : <><Button onPress={beginMemoryRead} type="button">{copy.memory.confirm}</Button><Button onPress={() => update(state.memorySkipped ? advanceFromMemory(state) : skipMemory(state))} type="button" variant="secondary">{state.memorySkipped ? copy.memory.proceed : copy.memory.skip}</Button></>}
          </footer>
        </div>
        <aside aria-hidden="true" className="onboarding-editorial-artwork"><img alt="" src={memoryIllustration} /></aside>
      </section>}

      {state.step === 3 && <section className="onboarding-section onboarding-editorial-layout onboarding-work-style-layout">
        <div className="onboarding-editorial-content">
          <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(3)}</p><h2>{copy.style.title}</h2><p>{copy.style.subtitle}</p></header>
          <div className="onboarding-style-summary"><p>{copy.style.summary}</p><ul>{copy.style.points.map((point, index) => {
            const PointIcon = stylePointIcons[index]
            return <li className="onboarding-style-point" key={point}><span className="onboarding-style-point-icon"><PointIcon aria-hidden="true" /></span>{point}</li>
          })}</ul></div>
          <footer className="onboarding-section-footer onboarding-style-actions"><Button onPress={beginStyleExtraction} type="button">{copy.style.extract}</Button><Button onPress={() => update(skipWorkStyle(state))} type="button" variant="secondary">{copy.style.skip}</Button></footer>
        </div>
        <aside aria-hidden="true" className="onboarding-editorial-artwork"><img alt="" src={workStyleIllustration} /></aside>
      </section>}

      {state.step === 4 && <section className="onboarding-section onboarding-editorial-layout onboarding-trial-section onboarding-trial-layout">
        <div className="onboarding-editorial-content">
          <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(4)}</p><h2>{copy.trial.title}</h2><p>{copy.trial.subtitle}</p></header>
          <div className="onboarding-trial-suggestions"><span>{copy.trial.suggestions}</span>{copy.trial.questions.map((suggestion) => <button key={suggestion} onClick={() => setQuestion(suggestion)} type="button">{suggestion}</button>)}</div>
          <label className="onboarding-composer"><span className="sr-only">{copy.trial.inputLabel}</span><textarea onChange={(event) => setQuestion(event.target.value)} placeholder={copy.trial.placeholder} value={question} /></label>
          <Button className="onboarding-trial-submit" isDisabled={!question.trim()} onPress={submitTrial} type="button">{copy.trial.submit}</Button>
          <footer className="onboarding-section-footer onboarding-formal-action"><Button isDisabled={!state.workStyleConfirmed} onPress={() => setActivation('confirm')} type="button" variant="secondary">{copy.activation.start}</Button><p>{copy.activation.hint}</p></footer>
        </div>
        <aside aria-hidden="true" className="onboarding-editorial-artwork"><img alt="" src={trialIllustration} /></aside>
      </section>}
    </section>

    <section aria-labelledby="onboarding-recent-title" className="onboarding-home-events">
      {!viewingTrial && <div className="onboarding-empty-heading"><h2 id="onboarding-recent-title">{homeCopy.recent}</h2>{!trialEvent && <span>{copy.emptyTimeline}</span>}</div>}
      {viewingTrial && trialEvent ? <HomeEventDetail busy={false} copy={homeCopy} event={trialEvent} now={trialStartedAt.current} onBack={() => setViewingTrial(false)} onResolve={() => {}} onSubmitFeedback={(feedback) => {
        update(feedback.kind === 'adjust' ? regenerateTrial(state, feedback.note) : recordTrialFeedback(state, feedback))
        setViewingTrial(false)
      }} sourceName={homeCopy.sources[trialEvent.source]} /> : <><HomeActivityChart activity={activityHours(trialEvents, trialStartedAt.current)} copy={homeCopy} />{trialEvent && <HomeEventList copy={homeCopy} events={trialEvents} now={trialStartedAt.current} onOpen={() => setViewingTrial(true)} sourceNames={homeCopy.sources} />}</>}
    </section>

    {connecting && <section aria-label={copy.connection.confirmTitle(homeCopy.sources[connecting])} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div className="onboarding-modal-dialog"><h2>{copy.connection.confirmTitle(homeCopy.sources[connecting])}</h2><p>{copy.connection.confirmBody}</p><footer><Button onPress={() => setConnecting(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={completeConnection} type="button">{copy.connection.complete}</Button></footer></div></section>}

    {memoryStage && <section aria-label={copy.memory.readingTitle} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div aria-live="polite" className="onboarding-modal-dialog onboarding-memory-dialog">
      <h2>{copy.memory.readingTitle}</h2><progress className="onboarding-progress" max="100" value={memoryProgress}>{memoryProgress}%</progress>
      {memoryStage === 'reading' && <p>{copy.memory.reading[memoryProgress < 70 ? 0 : 1]}</p>}
      {memoryStage === 'ready' && <div className="onboarding-modal-result"><div aria-label={copy.memory.findingsLabel} className="onboarding-memory-findings">{memoryFindingKeys.map((finding) => {
        const FindingIcon = memoryFindingIcons[finding]
        const [count, label] = copy.memory.findings[finding]
        return <div className="onboarding-memory-finding" key={finding}><FindingIcon aria-hidden="true" /><strong>{count}</strong><span>{label}</span></div>
      })}</div><footer><Button onPress={() => setMemoryStage(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={() => setMemoryStage('building')} type="button">{copy.memory.construct}</Button></footer></div>}
      {memoryStage === 'building' && <p>{copy.memory.building}</p>}
      <small>{copy.memory.demo}</small>
    </div></section>}

    {styleStage && <section aria-label={copy.style.extractingTitle} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div aria-live="polite" className="onboarding-modal-dialog onboarding-style-dialog">
      <h2>{copy.style.extractingTitle}</h2><progress className="onboarding-progress" max="100" value={styleProgress}>{styleProgress}%</progress>
      {styleStage === 'extracting' && <p>{copy.style.extracting[Math.min(Math.floor(styleProgress / 25), copy.style.extracting.length - 1)]}</p>}
      {styleStage === 'ready' && <div className="onboarding-modal-result"><p>{copy.style.editHint}</p><label className="onboarding-prompt-editor"><span>{copy.style.promptLabel}</span><textarea onChange={(event) => setPromptDraft(event.target.value)} value={promptDraft} /></label><footer><Button onPress={() => setStyleStage(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button isDisabled={!promptDraft.trim()} onPress={confirmStyle} type="button">{copy.style.usePrompt}</Button></footer></div>}
      <small>{copy.style.demo}</small>
    </div></section>}

    {activation === 'confirm' && <section aria-label={copy.activation.confirmTitle} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div className="onboarding-modal-dialog"><h2>{copy.activation.confirmTitle}</h2><p>{copy.activation.confirmBody}</p><footer><Button onPress={() => setActivation('idle')} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={beginActivation} type="button">{copy.activation.confirm}</Button></footer></div></section>}

    {activation === 'celebrating' && <section aria-live="polite" aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div className="onboarding-modal-dialog onboarding-modal-celebration"><span aria-hidden="true">✦</span><h2>{copy.activation.celebrating}</h2></div></section>}

    {activation === 'contacts' && <section aria-label={copy.contacts.title} aria-modal="true" className="onboarding-contact-backdrop" role="dialog"><div className="onboarding-contact-dialog"><span className="onboarding-trial-label">{copy.contacts.label}</span><h2>{copy.contacts.title}</h2><p>{copy.contacts.body}</p><fieldset>{contacts.map((name) => <label key={name}><input checked={contact === name} name="contact" onChange={() => setContact(name)} type="radio" value={name} /><span>{name}</span></label>)}</fieldset><p className="onboarding-demo-note">{copy.contacts.demo}</p><footer><Button onPress={finish} type="button" variant="secondary">{copy.contacts.close}</Button><Button onPress={finish} type="button">{copy.contacts.notify(contact)}</Button></footer></div></section>}
  </section>
}
