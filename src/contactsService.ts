import { confirmCandidates, deleteContact, inviteContact, refreshContact, removeContactSource, updateContact } from './contactsState.ts'
import type { Contact, ContactCandidate, ContactPatch } from './contactsState.ts'
import type { ConnectorId } from './settingsState.ts'

export const createContactCandidates = (): ContactCandidate[] => [
  {
    id: 'mia-lin', name: 'Mia Lin', relationship: 'Stardust AI colleague', lastInteractionAt: '2026-09-20T11:00:00.000Z', contextPrompt: '',
    sources: [{ connector: 'dingtalk', name: 'Mia Lin' }, { connector: 'feishu', name: '林米娅' }],
    profile: {
      summary: 'Mia works with Stardust AI on product launches.',
      recentContacts: 'Sep 20 · DingTalk · Confirmed the release checklist. Sep 18 · Feishu · Aligned the final review.',
      relationship: 'You work together on product launches.',
      context: 'Usually concise and action-oriented.',
    },
  },
  {
    id: 'sam-wu', name: 'Sam Wu', relationship: 'Design partner', lastInteractionAt: '2026-09-16T08:30:00.000Z', contextPrompt: '',
    sources: [{ connector: 'feishu', name: '吴森' }],
    profile: {
      summary: 'Sam is a design partner for the onboarding experience.',
      recentContacts: 'Sep 16 · Feishu · Shared annotated onboarding feedback.',
      relationship: 'You collaborate on the onboarding experience.',
      context: 'Often includes clear review points and next actions.',
    },
  },
  {
    id: 'olivia-zhao', name: 'Olivia Zhao', relationship: 'Team operations partner', lastInteractionAt: '2026-08-28T09:15:00.000Z', contextPrompt: '',
    sources: [{ connector: 'teams', name: 'Olivia Zhao' }],
    profile: {
      summary: 'Olivia coordinates the team operations that support releases.',
      recentContacts: 'Aug 28 · Teams · Asked for the rollout owner in the release channel.',
      relationship: 'You coordinate release operations together.',
      context: 'There is not enough interaction to describe a communication pattern yet.',
    },
  },
]

export type ContactsService = {
  load: () => Promise<Contact[]>
  discover: (connected: ConnectorId[]) => Promise<ContactCandidate[]>
  confirm: (candidateIds: string[]) => Promise<Contact[]>
  update: (id: string, patch: ContactPatch) => Promise<Contact[]>
  removeSource: (id: string, connector: ConnectorId) => Promise<Contact[]>
  refresh: (id: string) => Promise<Contact[]>
  invite: (id: string) => Promise<Contact[]>
  remove: (id: string) => Promise<Contact[]>
}

export const createContactsService = (initial: Contact[] = []): ContactsService => {
  let contacts = structuredClone(initial)
  const candidates = createContactCandidates()
  const current = () => structuredClone(contacts)

  return {
    load: async () => current(),
    discover: async (connected) => candidates
      .map((candidate) => ({ ...candidate, sources: candidate.sources.filter((source) => connected.includes(source.connector)) }))
      .filter((candidate) => candidate.sources.length),
    confirm: async (candidateIds) => { contacts = confirmCandidates(contacts, candidates, candidateIds); return current() },
    update: async (id, patch) => { contacts = updateContact(contacts, id, patch); return current() },
    removeSource: async (id, connector) => { contacts = removeContactSource(contacts, id, connector); return current() },
    refresh: async (id) => { contacts = refreshContact(contacts, id, new Date().toISOString()); return current() },
    invite: async (id) => { contacts = inviteContact(contacts, id, new Date().toISOString()); return current() },
    remove: async (id) => { contacts = deleteContact(contacts, id); return current() },
  }
}
