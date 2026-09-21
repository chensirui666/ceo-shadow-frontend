import { confirmCandidates, deleteContact, inviteContact, refreshContact, removeContactSource, updateContact } from './contactsState.ts'
import type { Contact, ContactCandidate, ContactPatch } from './contactsState.ts'
import type { ConnectorId } from './settingsState.ts'

type ContactCandidateFixture = ContactCandidate & { recentContactsBySource: Partial<Record<ConnectorId, string>> }

const createContactCandidateFixtures = (): ContactCandidateFixture[] => [
  {
    id: 'mia-lin', name: 'Mia Lin', relationship: 'Stardust AI colleague', lastInteractionAt: '2026-09-20T11:00:00.000Z', contextPrompt: '',
    sources: [{ connector: 'dingtalk', name: 'Mia Lin' }, { connector: 'feishu', name: '林米娅' }],
    profile: {
      summary: 'Mia works with Stardust AI on product launches.',
      recentContacts: 'Sep 20 · DingTalk · Confirmed the release checklist. Sep 19 · DingTalk · Aligned the rollout owner. Sep 18 · Feishu · Aligned the final review.',
      relationship: 'You work together on product launches.',
      context: 'Usually concise and action-oriented.',
    },
    recentContactsBySource: { dingtalk: 'Sep 20 · DingTalk · Confirmed the release checklist. Sep 19 · DingTalk · Aligned the rollout owner.', feishu: 'Sep 18 · Feishu · Aligned the final review.' },
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
    recentContactsBySource: { feishu: 'Sep 16 · Feishu · Shared annotated onboarding feedback.' },
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
    recentContactsBySource: { teams: 'Aug 28 · Teams · Asked for the rollout owner in the release channel.' },
  },
]

export const createContactCandidates = (): ContactCandidate[] => createContactCandidateFixtures().map(({ recentContactsBySource: _, ...candidate }) => candidate)

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
  const candidates = createContactCandidateFixtures()
  let preview: ContactCandidate[] = []
  const current = () => structuredClone(contacts)

  return {
    load: async () => current(),
    discover: async (connected) => {
      preview = candidates.map((candidate) => {
        const sources = candidate.sources.filter((source) => connected.includes(source.connector))
        const { recentContactsBySource, ...contact } = candidate
        return { ...contact, sources, profile: { ...candidate.profile, recentContacts: sources.map((source) => recentContactsBySource[source.connector]).filter(Boolean).join(' ') } }
      }).filter((candidate) => candidate.sources.length)
      return structuredClone(preview)
    },
    confirm: async (candidateIds) => { contacts = confirmCandidates(contacts, preview, candidateIds); return current() },
    update: async (id, patch) => { contacts = updateContact(contacts, id, patch); return current() },
    removeSource: async (id, connector) => { contacts = removeContactSource(contacts, id, connector); return current() },
    refresh: async (id) => { contacts = refreshContact(contacts, id, new Date().toISOString()); return current() },
    invite: async (id) => { contacts = inviteContact(contacts, id, new Date().toISOString()); return current() },
    remove: async (id) => { contacts = deleteContact(contacts, id); return current() },
  }
}
