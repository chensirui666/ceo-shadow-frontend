import { createDemoHomeSnapshot, recordOwnerFeedback, resolveConfirmation, setOperatingMode } from './homeState.ts'
import type { HomeSnapshot, OperatingMode, OwnerFeedback } from './homeState.ts'

export type HomeService = {
  load: () => Promise<HomeSnapshot>
  updateMode: (mode: OperatingMode) => Promise<HomeSnapshot>
  resolveEvent: (eventId: string, decision: 'send' | 'cancel', reply: string) => Promise<HomeSnapshot>
  submitOwnerFeedback: (eventId: string, feedback: OwnerFeedback) => Promise<HomeSnapshot>
}

export const createHomeService = (initial: HomeSnapshot = createDemoHomeSnapshot()): HomeService => {
  let snapshot = structuredClone(initial)
  const current = () => structuredClone(snapshot)

  return {
    load: async () => current(),
    updateMode: async (mode) => { snapshot = setOperatingMode(snapshot, mode); return current() },
    resolveEvent: async (eventId, decision, reply) => { snapshot = resolveConfirmation(snapshot, eventId, decision, reply); return current() },
    submitOwnerFeedback: async (eventId, feedback) => { snapshot = recordOwnerFeedback(snapshot, eventId, feedback); return current() },
  }
}

export const homeService = createHomeService()
