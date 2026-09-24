import { contactTagColors, inviteContact, refreshContact, updateContact } from './contactsState.ts'
import type { Contact, ContactPatch, ContactTag, ContactTagColor } from './contactsState.ts'

const createContactTagFixtures = (): ContactTag[] => [
  { id: 'product-launch', name: 'Product launch', rule: 'People currently contributing to the product launch.', color: 'blue' },
  { id: 'decision-maker', name: 'Decision maker', rule: 'People who make or unblock material decisions.', color: 'violet' },
  { id: 'design-review', name: 'Design review', rule: 'People who review product design work.', color: 'green' },
  { id: 'needs-follow-up', name: 'Needs follow-up', rule: 'People who need a response or next step from me.', color: 'amber' },
]

const createContactFixtures = (): Contact[] => [
  {
    id: 'mia-lin', name: 'Mia Lin', relationship: 'Stardust AI colleague', category: 'colleague', company: 'Stardust AI', tagIds: ['product-launch'], lastInteractionAt: '2026-09-20T11:00:00.000Z', recentStatus: { tone: 'on-track', detail: 'Product launch · release checklist confirmed' }, contextPrompt: '',
    sources: [{ connector: 'dingtalk', name: 'Mia Lin' }, { connector: 'feishu', name: '林米娅' }],
    profile: { summary: 'Mia works with Stardust AI on product launches.', recentContacts: 'Sep 20 · DingTalk · Confirmed the release checklist. Sep 19 · DingTalk · Aligned the rollout owner.', relationship: 'You work together on product launches.', context: 'Usually concise and action-oriented.' },
  },
  {
    id: 'aaron-zhou', name: 'Aaron Zhou', relationship: 'Product lead', category: 'leader', company: 'Stardust AI', tagIds: ['decision-maker'], lastInteractionAt: '2026-09-18T09:30:00.000Z', recentStatus: { tone: 'waiting', detail: 'Quarterly planning · decision pending' }, contextPrompt: '',
    sources: [{ connector: 'dingtalk', name: 'Aaron Zhou' }],
    profile: { summary: 'Aaron leads the product group that sets quarterly priorities.', recentContacts: 'Sep 18 · DingTalk · Reviewed the release risks for the next milestone.', relationship: 'He gives direction on product priorities and trade-offs.', context: 'Prefers concise options with a clear recommendation.' },
  },
  {
    id: 'nia-chen', name: 'Nia Chen', relationship: 'Product designer', category: 'report', company: 'Stardust AI', tagIds: ['design-review'], lastInteractionAt: '2026-09-17T16:15:00.000Z', recentStatus: { tone: 'on-track', detail: 'Onboarding · revised prototype shared' }, contextPrompt: '',
    sources: [{ connector: 'teams', name: 'Nia Chen' }],
    profile: { summary: 'Nia owns interaction design for the onboarding flow.', recentContacts: 'Sep 17 · Teams · Shared the revised onboarding prototype for feedback.', relationship: 'You help prioritize and unblock her work.', context: 'Brings a clear visual proposal to reviews.' },
  },
  {
    id: 'sam-wu', name: 'Sam Wu', relationship: 'Design partner', category: 'client', company: 'Northstar Studio', tagIds: ['needs-follow-up'], lastInteractionAt: '2026-09-16T08:30:00.000Z', recentStatus: { tone: 'needs-follow-up', detail: 'Onboarding · feedback needs a response' }, contextPrompt: '',
    sources: [{ connector: 'feishu', name: '吴森' }],
    profile: { summary: 'Sam is a design partner for the onboarding experience.', recentContacts: 'Sep 16 · Feishu · Shared annotated onboarding feedback.', relationship: 'You collaborate on the onboarding experience.', context: 'Often includes clear review points and next actions.' },
  },
  {
    id: 'olivia-zhao', name: 'Olivia Zhao', relationship: 'Team operations partner', category: 'other', company: 'Stardust AI', tagIds: [], lastInteractionAt: '2026-09-12T09:15:00.000Z', recentStatus: { tone: 'no-update', detail: 'Release operations · no recent update' }, contextPrompt: '',
    sources: [{ connector: 'teams', name: 'Olivia Zhao' }],
    profile: { summary: 'Olivia coordinates the team operations that support releases.', recentContacts: 'Sep 12 · Teams · Asked for the rollout owner in the release channel.', relationship: 'You coordinate release operations together.', context: 'There is not enough interaction to describe a communication pattern yet.' },
  },
]

export type ContactsSnapshot = { contacts: Contact[]; tags: ContactTag[] }
export type ContactsService = {
  load: () => Promise<ContactsSnapshot>
  update: (id: string, patch: ContactPatch) => Promise<ContactsSnapshot>
  refresh: (id: string) => Promise<ContactsSnapshot>
  invite: (id: string) => Promise<ContactsSnapshot>
  createTag: (tag: Pick<ContactTag, 'name' | 'rule'>) => Promise<ContactsSnapshot>
  removeTag: (id: string) => Promise<ContactsSnapshot>
}

const tagId = (name: string, tags: ContactTag[]): string => {
  const base = name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'tag'
  let candidate = base
  let suffix = 2
  while (tags.some((tag) => tag.id === candidate)) candidate = `${base}-${suffix++}`
  return candidate
}

export const createContactsService = (initial: Contact[] = createContactFixtures(), initialTags: ContactTag[] = createContactTagFixtures()): ContactsService => {
  let contacts = structuredClone(initial)
  let tags = structuredClone(initialTags)
  const current = (): ContactsSnapshot => ({ contacts: structuredClone(contacts), tags: structuredClone(tags) })
  const assertKnownTags = (tagIds: string[]) => {
    if (tagIds.some((id) => !tags.some((tag) => tag.id === id))) throw new Error('invalid-tag')
  }

  return {
    load: async () => current(),
    update: async (id, patch) => {
      const next = updateContact(contacts, id, patch)
      assertKnownTags(next.find((contact) => contact.id === id)?.tagIds ?? [])
      contacts = next
      return current()
    },
    refresh: async (id) => { contacts = refreshContact(contacts, id, new Date().toISOString()); return current() },
    invite: async (id) => { contacts = inviteContact(contacts, id, new Date().toISOString()); return current() },
    createTag: async ({ name, rule }) => {
      const nextName = name.trim()
      const nextRule = rule.trim()
      if (!nextName || !nextRule || tags.some((tag) => tag.name.toLocaleLowerCase() === nextName.toLocaleLowerCase())) throw new Error('invalid-tag')
      tags = [...tags, { id: tagId(nextName, tags), name: nextName, rule: nextRule, color: contactTagColors[tags.length % contactTagColors.length] as ContactTagColor }]
      return current()
    },
    removeTag: async (id) => {
      if (!tags.some((tag) => tag.id === id)) throw new Error('not-found')
      tags = tags.filter((tag) => tag.id !== id)
      contacts = contacts.map((contact) => ({ ...contact, tagIds: contact.tagIds.filter((tagId) => tagId !== id) }))
      return current()
    },
  }
}
