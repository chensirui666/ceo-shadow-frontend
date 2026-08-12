import { useEffect, useRef, useState } from 'react'
import { Button } from '@heroui/react'
import { ArrowRight, CalendarCheck, Check, FileText, MessageCircle, Repeat2, Scale, ShieldCheck, X } from 'lucide-react'
import connectIllustration from '../assets/onboarding-connect-editorial.png'
import memoryIllustration from '../assets/onboarding-memory-editorial.png'
import trialIllustration from '../assets/onboarding-trial-editorial.png'
import welcomeMemoryIllustration from '../assets/onboarding-welcome-memory.png'
import workStyleIllustration from '../assets/onboarding-work-style-editorial.png'
import type { Locale } from '../appState.ts'
import { onboardingConnectorLogos } from '../content/connectorLogos.ts'
import { translations } from '../content/translations.ts'
import { homeSources } from '../homeState.ts'
import type { HomeSource } from '../homeState.ts'
import { advanceFromMemory, completeOnboarding, confirmMemory, confirmWorkStyle, connectSource, continueToMemory, createOnboardingState, recordTrial, recordTrialFeedback, regenerateTrial, selectOnboardingStep } from '../onboardingState.ts'
import type { OnboardingState } from '../onboardingState.ts'

type OnboardingHomeProps = {
  initialState?: OnboardingState
  locale: Locale
  onComplete: (state: OnboardingState) => void
  onOpenMemory: () => void
  onStateChange?: (state: OnboardingState) => void
  onWelcomeDismiss?: () => void
  welcomeOpen?: boolean
}

export type ActivationStage = 'idle' | 'confirm' | 'celebrating' | 'ready'
type MemoryStage = 'reading' | 'ready' | null
type StyleStage = 'extracting' | 'ready' | null

const memorySignalIcons = { messages: MessageCircle, documents: FileText, calendar: CalendarCheck }
const memoryFindingIcons = { messages: MessageCircle, documents: FileText, topics: Repeat2 }
const memoryFindingKeys = ['messages', 'documents', 'topics'] as const
const stylePointIcons = [MessageCircle, Scale, ArrowRight, ShieldCheck]
export const ACTIVATION_CELEBRATION_DURATION = 5_000
export const getActivationStartStage = (prefersReducedMotion: boolean): Extract<ActivationStage, 'celebrating' | 'ready'> => prefersReducedMotion ? 'ready' : 'celebrating'

type ActivationCelebrationProps = {
  copy: typeof translations.zh.workspace.onboarding.activation
  onFinish: () => void
  stage: Extract<ActivationStage, 'celebrating' | 'ready'>
}

export function ActivationCelebration({ copy, onFinish, stage }: ActivationCelebrationProps) {
  if (stage === 'ready') return <section aria-label={copy.completeTitle} aria-modal="true" className="onboarding-activation-backdrop onboarding-activation-complete" role="dialog"><div className="onboarding-activation-complete-dialog">
    <span aria-hidden="true" className="onboarding-activation-complete-mark"><Check /></span><h2>{copy.completeTitle}</h2><p>{copy.completeBody}</p><Button onPress={onFinish} type="button">{copy.completeAction}</Button>
  </div></section>

  return <section aria-live="polite" className="onboarding-activation-backdrop onboarding-activation-celebration" role="status"><span className="sr-only">{copy.celebrating}</span><svg aria-hidden="true" className="onboarding-celebration-scene" fill="none" viewBox="0 0 800 500">
    <defs>
      <radialGradient id="onboarding-celebration-glow"><stop stopColor="#f1c57b" stopOpacity=".42" /><stop offset="1" stopColor="#f1c57b" stopOpacity="0" /></radialGradient>
      <filter id="onboarding-celebration-soft-glow"><feGaussianBlur stdDeviation="8" /></filter>
    </defs>
    <path className="onboarding-celebration-ground" d="M82 413H720" />
    <g className="onboarding-celebration-crew">
      <g className="onboarding-celebration-person">
        <path className="onboarding-celebration-person-hat" d="M270 309C272 297 282 291 293 293C300 294 304 298 306 303L273 307Z" fill="#2d2a25" />
        <path d="M268 307H309" stroke="#2d2a25" strokeLinecap="round" strokeWidth="5" />
        <circle cx="287" cy="314" fill="#e9c6a2" r="11" />
        <path className="onboarding-celebration-person-coat" d="M278 326C283 322 292 322 298 328L305 366L275 366L278 326Z" fill="#176869" />
        <path d="M286 329V361" stroke="#f8f4ea" strokeLinecap="round" strokeWidth="3" />
        <path d="M279 334L264 359M297 334L316 361" stroke="#e9c6a2" strokeLinecap="round" strokeWidth="7" />
        <path d="M280 366L275 395M298 366L306 395" stroke="#4a443c" strokeLinecap="round" strokeWidth="9" />
        <path d="M270 399H281M301 399H313" stroke="#2d2a25" strokeLinecap="round" strokeWidth="7" />
      </g>
      <g className="onboarding-celebration-cart">
        <path d="M313 365H337" stroke="#2d2a25" strokeLinecap="round" strokeWidth="5" />
        <path d="M332 356H441L429 392H343L332 356Z" fill="#e9d6bb" stroke="#2d2a25" strokeWidth="4" />
        <path d="M345 356H429M349 369H425" stroke="#c18c53" strokeWidth="3" />
        <path d="M350 356V341H423V356" stroke="#2d2a25" strokeWidth="4" />
        <circle cx="355" cy="403" fill="#2d2a25" r="12" /><circle cx="420" cy="403" fill="#2d2a25" r="12" />
        <circle cx="355" cy="403" fill="#f8f4ea" r="4" /><circle cx="420" cy="403" fill="#f8f4ea" r="4" />
      </g>
      <g className="onboarding-celebration-rocket">
        <path d="M383 341V311C383 293 396 280 408 274C421 280 434 293 434 311V341H383Z" fill="#176869" />
        <path d="M383 328L367 343H383M434 328L450 343H434" fill="#d7724f" />
        <path d="M408 280V337" stroke="#e9d6bb" strokeWidth="3" />
        <circle cx="408" cy="306" fill="#f8f4ea" r="8" /><circle cx="408" cy="306" fill="#d7a64e" r="4" />
        <path d="M396 341L408 358L421 341" fill="#d7a64e" />
      </g>
      <path className="onboarding-celebration-fuse" d="M376 350C358 349 356 336 365 328" stroke="#d7724f" strokeLinecap="round" strokeWidth="4" />
      <g className="onboarding-celebration-burst" strokeLinecap="round">
        <circle className="onboarding-celebration-firework-halo" cx="408" cy="106" fill="url(#onboarding-celebration-glow)" filter="url(#onboarding-celebration-soft-glow)" r="91" />
        <g className="onboarding-celebration-firework-rays onboarding-celebration-firework-rays-outer" strokeWidth="5">
          <path d="M408 97V20M414 98L455 29M418 101L485 64M419 106L501 112M416 111L475 158M411 114L433 190M404 114L372 182M399 111L329 155M397 106L309 111M399 101L338 61M404 98L380 29" stroke="#176869" />
          <path d="M411 97L431 24M417 99L470 46M419 103L493 87M418 109L493 133M414 113L457 178M406 114L398 194M401 113L349 178M397 109L319 133M397 103L324 85M400 99L346 46" stroke="#d7724f" />
        </g>
        <g className="onboarding-celebration-firework-rays onboarding-celebration-firework-rays-inner" stroke="#d7a64e" strokeWidth="4">
          <path d="M408 96V51M413 98L440 55M417 102L460 84M418 107L464 118M414 112L442 153M408 114L408 169M402 112L372 153M398 107L351 118M399 102L356 84M403 98L376 55" />
        </g>
        <g className="onboarding-celebration-firework-sparks" fill="#d7a64e"><circle cx="408" cy="22" r="3" /><circle cx="490" cy="65" r="3" /><circle cx="503" cy="138" r="3" /><circle cx="443" cy="188" r="3" /><circle cx="347" cy="180" r="3" /><circle cx="311" cy="120" r="3" /><circle cx="341" cy="55" r="3" /></g>
        <circle cx="408" cy="106" fill="#f8f4ea" r="13" stroke="#d7724f" strokeWidth="4" /><circle cx="408" cy="106" fill="#d7a64e" r="5" />
      </g>
    </g>
  </svg></section>
}

export default function OnboardingHome({ initialState, locale, onComplete, onOpenMemory, onStateChange, onWelcomeDismiss, welcomeOpen = true }: OnboardingHomeProps) {
  const copy = translations[locale].workspace.onboarding
  const homeCopy = translations[locale].workspace.home
  const fallbackInitialState = useRef(createOnboardingState())
  const [state, setState] = useState(() => initialState ?? fallbackInitialState.current)
  const [connecting, setConnecting] = useState<HomeSource | null>(null)
  const [memoryStage, setMemoryStage] = useState<MemoryStage>(null)
  const [memoryProgress, setMemoryProgress] = useState(0)
  const [styleStage, setStyleStage] = useState<StyleStage>(null)
  const [styleProgress, setStyleProgress] = useState(0)
  const [promptDraft, setPromptDraft] = useState(() => state.workStylePrompt ?? copy.style.prompt)
  const [question, setQuestion] = useState('')
  const [activation, setActivation] = useState<ActivationStage>('idle')
  const [welcomeDismissed, setWelcomeDismissed] = useState(false)

  useEffect(() => {
    if (memoryStage !== 'reading') return
    const progressTimer = window.setInterval(() => setMemoryProgress((value) => Math.min(value + 2.5, 95)), 100)
    const completionTimer = window.setTimeout(() => {
      window.clearInterval(progressTimer)
      setMemoryProgress(100)
    }, 3_800)
    const summaryTimer = window.setTimeout(() => setMemoryStage('ready'), 4_100)
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
    if (activation !== 'celebrating') return
    const timer = window.setTimeout(() => setActivation('ready'), ACTIVATION_CELEBRATION_DURATION)
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
    setActivation(getActivationStartStage(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false))
  }

  const finish = () => onComplete(completeOnboarding(state))

  const submitTrial = () => {
    if (!question.trim()) return
    update(recordTrial(state, question, locale))
    setQuestion('')
  }

  const dismissWelcome = () => {
    setWelcomeDismissed(true)
    onWelcomeDismiss?.()
  }

  return <section className={`onboarding-page onboarding-page-step-${state.step}`}>
    <ol aria-label={copy.progressLabel} className="onboarding-steps">
      {copy.steps.map((stepCopy, index) => {
        const step = (index + 1) as 1 | 2 | 3 | 4
        const className = state.step === step ? 'onboarding-step onboarding-step-active' : state.maxReached > step ? 'onboarding-step onboarding-step-done' : 'onboarding-step'
        return <li className={className} key={stepCopy.label}><button disabled={step > state.maxReached} onClick={() => update(selectOnboardingStep(state, step))} type="button"><span>{step}</span><strong>{stepCopy.label}</strong></button></li>
      })}
    </ol>

    <section className="onboarding-panel">
      {state.step === 1 && <section className="onboarding-section onboarding-connect-layout">
        <div className="onboarding-connect-content">
          <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(1)}</p><h2>{copy.connection.title}</h2><p>{copy.connection.subtitle}</p></header>
          <div className="onboarding-source-list">
            {homeSources.map((source) => {
              const connected = state.connectedSources.includes(source)
              return <div className="onboarding-source-row" key={source}>
                <span aria-hidden="true" className="onboarding-source-glyph"><img alt="" src={onboardingConnectorLogos[source]} /></span>
                <span><strong>{homeCopy.sources[source]}</strong><small>{copy.connection.scope[source]}</small></span>
                {connected ? <span aria-label={copy.connection.connected} className="onboarding-connected"><Check aria-hidden="true" /></span> : <Button className="onboarding-connect-button" onPress={() => setConnecting(source)} type="button">{copy.connection.connect}</Button>}
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
            <section className="onboarding-memory-migration"><strong>{copy.memory.migration.title}</strong><p>{copy.memory.migration.body}</p></section>
          </div>
          <footer className="onboarding-section-footer onboarding-section-footer-actions onboarding-memory-actions">
            {state.memoryConfirmed ? <><Button onPress={onOpenMemory} type="button" variant="secondary">{copy.memory.view}</Button><Button onPress={() => update(advanceFromMemory(state))} type="button">{copy.memory.proceed}</Button></> : <Button onPress={beginMemoryRead} type="button">{copy.memory.confirm}</Button>}
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
          <aside className="onboarding-style-benefits"><strong>{copy.style.benefitTitle}</strong><p>{copy.style.benefit}</p></aside>
          <footer className="onboarding-section-footer onboarding-style-actions"><Button onPress={beginStyleExtraction} type="button">{copy.style.extract}</Button></footer>
        </div>
        <aside aria-hidden="true" className="onboarding-editorial-artwork"><img alt="" src={workStyleIllustration} /></aside>
      </section>}

      {state.step === 4 && <section className="onboarding-section onboarding-editorial-layout onboarding-trial-section onboarding-trial-layout">
        <div className="onboarding-editorial-content">
          <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(4)}</p><h2>{copy.trial.title}</h2><p>{copy.trial.subtitle}</p></header>
          <div className="onboarding-trial-suggestions"><span>{copy.trial.suggestions}</span>{copy.trial.questions.map((suggestion) => <button key={suggestion} onClick={() => setQuestion(suggestion)} type="button">{suggestion}</button>)}</div>
          <label className="onboarding-composer"><span className="sr-only">{copy.trial.inputLabel}</span><textarea onChange={(event) => setQuestion(event.target.value)} placeholder={copy.trial.placeholder} value={question} /></label>
          <Button className="onboarding-trial-submit" isDisabled={!question.trim()} onPress={submitTrial} type="button">{copy.trial.submit}</Button>
          <footer className="onboarding-section-footer onboarding-formal-action"><Button isDisabled={!state.workStyleConfirmed} onPress={() => setActivation('confirm')} type="button" variant="secondary">{copy.activation.start}</Button></footer>
        </div>
        <aside aria-hidden="true" className="onboarding-editorial-artwork"><img alt="" src={trialIllustration} /></aside>
      </section>}
    </section>

    {connecting && <section aria-label={copy.connection.confirmTitle(homeCopy.sources[connecting])} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div className="onboarding-modal-dialog"><h2>{copy.connection.confirmTitle(homeCopy.sources[connecting])}</h2><p>{copy.connection.confirmBody}</p><footer><Button onPress={() => setConnecting(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={completeConnection} type="button">{copy.connection.complete}</Button></footer></div></section>}

    {memoryStage && <section aria-label={copy.memory.readingTitle} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div aria-live="polite" className="onboarding-modal-dialog onboarding-memory-dialog">
      <h2>{copy.memory.readingTitle}</h2><progress className="onboarding-progress" max="100" value={memoryProgress}>{memoryProgress}%</progress>
      {memoryStage === 'reading' && <p>{copy.memory.reading[memoryProgress < 70 ? 0 : 1]}</p>}
      {memoryStage === 'ready' && <div className="onboarding-modal-result"><div aria-label={copy.memory.findingsLabel} className="onboarding-memory-findings">{memoryFindingKeys.map((finding) => {
        const FindingIcon = memoryFindingIcons[finding]
        const [count, label] = copy.memory.findings[finding]
        return <div className="onboarding-memory-finding" key={finding}><FindingIcon aria-hidden="true" /><strong>{count}</strong><span>{label}</span></div>
      })}</div><footer><Button onPress={() => setMemoryStage(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={() => { update(confirmMemory(state)); setMemoryStage(null) }} type="button">{copy.memory.proceed}</Button></footer></div>}
    </div></section>}

    {styleStage && <section aria-label={copy.style.extractingTitle} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div aria-live="polite" className="onboarding-modal-dialog onboarding-style-dialog">
      <h2>{copy.style.extractingTitle}</h2><progress className="onboarding-progress" max="100" value={styleProgress}>{styleProgress}%</progress>
      {styleStage === 'extracting' && <p>{copy.style.extracting[Math.min(Math.floor(styleProgress / 25), copy.style.extracting.length - 1)]}</p>}
      {styleStage === 'ready' && <div className="onboarding-modal-result"><p>{copy.style.editHint}</p><label className="onboarding-prompt-editor"><span>{copy.style.promptLabel}</span><textarea onChange={(event) => setPromptDraft(event.target.value)} value={promptDraft} /></label><footer><Button onPress={() => setStyleStage(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button isDisabled={!promptDraft.trim()} onPress={confirmStyle} type="button">{copy.style.usePrompt}</Button></footer></div>}
    </div></section>}

    {activation === 'confirm' && <section aria-label={copy.activation.confirmTitle} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div className="onboarding-modal-dialog"><h2>{copy.activation.confirmTitle}</h2><p>{copy.activation.confirmBody}</p><footer><Button onPress={() => setActivation('idle')} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={beginActivation} type="button">{copy.activation.confirm}</Button></footer></div></section>}

    {(activation === 'celebrating' || activation === 'ready') && <ActivationCelebration copy={copy.activation} onFinish={finish} stage={activation} />}

    {welcomeOpen && !welcomeDismissed && <section aria-label={copy.welcome.title} aria-modal="true" className="onboarding-welcome-backdrop" role="dialog"><div className="onboarding-welcome-dialog">
      <section className="onboarding-welcome-story">
        <header className="onboarding-welcome-story-header"><p>{copy.welcome.eyebrow}</p><h2>{copy.welcome.storyTitle}</h2></header>
        <img alt={copy.welcome.memoryAlt} className="onboarding-welcome-illustration" src={welcomeMemoryIllustration} />
      </section>
      <section className="onboarding-welcome-setup">
        <Button aria-label={copy.welcome.dismiss} className="onboarding-welcome-close" isIconOnly onPress={dismissWelcome} type="button" variant="ghost"><X aria-hidden="true" /></Button>
        <header className="onboarding-welcome-header"><h2>{copy.welcome.title}</h2><p>{copy.welcome.duration}</p></header>
        <ol>{copy.steps.map((stepCopy, index) => <li className={index === 0 ? 'onboarding-welcome-step-active' : ''} key={stepCopy.label}><span>{index + 1}</span><div><strong>{stepCopy.label}</strong><small>{stepCopy.description}</small></div></li>)}</ol>
        <Button className="onboarding-welcome-start" onPress={dismissWelcome} type="button">{copy.welcome.start}</Button>
      </section>
    </div></section>}
  </section>
}
