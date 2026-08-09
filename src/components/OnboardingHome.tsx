import { useEffect, useRef, useState } from 'react'
import { Button } from '@heroui/react'
import type { Locale } from '../appState.ts'
import { onboardingConnectorLogos } from '../content/connectorLogos.ts'
import { translations } from '../content/translations.ts'
import { activityHours, homeSources } from '../homeState.ts'
import type { HomeSource } from '../homeState.ts'
import { advanceFromMemory, completeOnboarding, confirmMemory, confirmWorkStyle, connectSource, continueToMemory, createOnboardingState, createTrialEvent, recordTrial, recordTrialFeedback, regenerateTrial, selectOnboardingStep, skipMemory } from '../onboardingState.ts'
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
type MemoryStage = 'reading' | 'summary' | 'building' | null

const contacts = ['刘晨', '周航', '赵明']

export default function OnboardingHome({ initialState, locale, onComplete, onOpenMemory, onStateChange }: OnboardingHomeProps) {
  const copy = translations[locale].workspace.onboarding
  const homeCopy = translations[locale].workspace.home
  const fallbackInitialState = useRef(createOnboardingState())
  const trialStartedAt = useRef(new Date())
  const [state, setState] = useState(() => initialState ?? fallbackInitialState.current)
  const [connecting, setConnecting] = useState<HomeSource | null>(null)
  const [memoryStage, setMemoryStage] = useState<MemoryStage>(null)
  const [memoryProgress, setMemoryProgress] = useState(0)
  const [promptOpen, setPromptOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [activation, setActivation] = useState<ActivationStage>('idle')
  const [contact, setContact] = useState(contacts[0])
  const [viewingTrial, setViewingTrial] = useState(false)
  const trialEvent = createTrialEvent(state, trialStartedAt.current)
  const trialEvents = trialEvent ? [trialEvent] : []

  useEffect(() => {
    if (memoryStage !== 'reading') return
    const progressTimer = window.setTimeout(() => setMemoryProgress(72), 700)
    const summaryTimer = window.setTimeout(() => {
      setMemoryProgress(100)
      setMemoryStage('summary')
    }, 1_900)
    return () => {
      window.clearTimeout(progressTimer)
      window.clearTimeout(summaryTimer)
    }
  }, [memoryStage])

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
    setMemoryProgress(32)
    setMemoryStage('reading')
  }

  const beginActivation = () => {
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

  return <section className="onboarding-page">
    <ol aria-label={copy.progressLabel} className="onboarding-steps">
      {copy.steps.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3 | 4
        const className = state.step === step ? 'onboarding-step onboarding-step-active' : state.maxReached > step ? 'onboarding-step onboarding-step-done' : 'onboarding-step'
        return <li className={className} key={label}><button disabled={step > state.maxReached} onClick={() => update(selectOnboardingStep(state, step))} type="button"><span>{step}</span><strong>{label}</strong></button></li>
      })}
    </ol>

    <section className="onboarding-panel">
      {state.step === 1 && <section className="onboarding-section">
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
        <footer className="onboarding-section-footer"><Button isDisabled={!state.connectedSources.length} onPress={() => update(continueToMemory(state))} type="button">{copy.actions.continue}</Button><p>{copy.connection.continueHint}</p></footer>
      </section>}

      {state.step === 2 && <section className="onboarding-section">
        <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(2)}</p><h2>{copy.memory.title}</h2><p>{copy.memory.subtitle}</p></header>
        <div className="onboarding-scope-list">
          {state.connectedSources.map((source) => <div key={source}><strong>{homeCopy.sources[source]}</strong><span>{copy.memory.scope[source]}</span></div>)}
        </div>
        <p className="onboarding-demo-note">{copy.memory.demo}</p>
        <footer className="onboarding-section-footer onboarding-section-footer-actions">
          {state.memoryConfirmed ? <><Button onPress={onOpenMemory} type="button" variant="secondary">{copy.memory.view}</Button><Button onPress={() => update(advanceFromMemory(state))} type="button">{copy.memory.proceed}</Button></> : <><Button onPress={beginMemoryRead} type="button">{copy.memory.confirm}</Button><Button onPress={() => update(state.memorySkipped ? advanceFromMemory(state) : skipMemory(state))} type="button" variant="secondary">{state.memorySkipped ? copy.memory.proceed : copy.memory.skip}</Button></>}
        </footer>
      </section>}

      {state.step === 3 && <section className="onboarding-section">
        <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(3)}</p><h2>{copy.style.title}</h2><p>{copy.style.subtitle}</p></header>
        <div className="onboarding-style-summary"><p>{copy.style.summary}</p><ul>{copy.style.points.map((point) => <li key={point}>{point}</li>)}</ul></div>
        <button className="onboarding-prompt-toggle" onClick={() => setPromptOpen(true)} type="button">{copy.style.showPrompt}</button>
        <footer className="onboarding-section-footer"><Button onPress={() => update(confirmWorkStyle(state))} type="button">{copy.style.confirm}</Button></footer>
      </section>}

      {state.step === 4 && <section className="onboarding-section onboarding-trial-section">
        <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(4)}</p><h2>{copy.trial.title}</h2><p>{copy.trial.subtitle}</p></header>
        <div className="onboarding-trial-suggestions"><span>{copy.trial.suggestions}</span>{copy.trial.questions.map((suggestion) => <button key={suggestion} onClick={() => setQuestion(suggestion)} type="button">{suggestion}</button>)}</div>
        <label className="onboarding-composer"><span className="sr-only">{copy.trial.inputLabel}</span><textarea onChange={(event) => setQuestion(event.target.value)} placeholder={copy.trial.placeholder} value={question} /></label>
        <Button className="onboarding-trial-submit" isDisabled={!question.trim()} onPress={submitTrial} type="button">{copy.trial.submit}</Button>
        <footer className="onboarding-section-footer onboarding-formal-action"><Button onPress={() => setActivation('confirm')} type="button" variant="secondary">{copy.activation.start}</Button><p>{copy.activation.hint}</p></footer>
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
      {memoryStage === 'reading' && <><h2>{copy.memory.readingTitle}</h2><progress max="100" value={memoryProgress}>{memoryProgress}%</progress><p>{copy.memory.reading[memoryProgress < 70 ? 0 : 1]}</p><small>{copy.memory.demo}</small></>}
      {memoryStage === 'summary' && <><h2>{copy.memory.summaryTitle}</h2><p>{copy.memory.summary}</p><small>{copy.memory.demo}</small><footer><Button onPress={() => setMemoryStage(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={() => setMemoryStage('building')} type="button">{copy.memory.construct}</Button></footer></>}
      {memoryStage === 'building' && <><h2>{copy.memory.confirm}</h2><progress max="100" value="100">100%</progress><p>{copy.memory.building}</p><small>{copy.memory.demo}</small></>}
    </div></section>}

    {promptOpen && <section aria-label={copy.style.showPrompt} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div className="onboarding-modal-dialog onboarding-prompt-dialog"><h2>{copy.style.showPrompt}</h2><pre className="onboarding-prompt-preview">{copy.style.prompt}</pre><footer><Button onPress={() => setPromptOpen(false)} type="button">{copy.actions.continue}</Button></footer></div></section>}

    {activation === 'confirm' && <section aria-label={copy.activation.confirmTitle} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div className="onboarding-modal-dialog"><h2>{copy.activation.confirmTitle}</h2><p>{copy.activation.confirmBody}</p><footer><Button onPress={() => setActivation('idle')} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={beginActivation} type="button">{copy.activation.confirm}</Button></footer></div></section>}

    {activation === 'celebrating' && <section aria-live="polite" aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div className="onboarding-modal-dialog onboarding-modal-celebration"><span aria-hidden="true">✦</span><h2>{copy.activation.celebrating}</h2></div></section>}

    {activation === 'contacts' && <section aria-label={copy.contacts.title} aria-modal="true" className="onboarding-contact-backdrop" role="dialog"><div className="onboarding-contact-dialog"><span className="onboarding-trial-label">{copy.contacts.label}</span><h2>{copy.contacts.title}</h2><p>{copy.contacts.body}</p><fieldset>{contacts.map((name) => <label key={name}><input checked={contact === name} name="contact" onChange={() => setContact(name)} type="radio" value={name} /><span>{name}</span></label>)}</fieldset><p className="onboarding-demo-note">{copy.contacts.demo}</p><footer><Button onPress={finish} type="button" variant="secondary">{copy.contacts.close}</Button><Button onPress={finish} type="button">{copy.contacts.notify(contact)}</Button></footer></div></section>}
  </section>
}
