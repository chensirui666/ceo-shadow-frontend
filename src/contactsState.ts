import type { ConnectorId } from './settingsState.ts'

export const contactTimes = ['all', 'day', 'week', 'month', 'quarter'] as const
export type ContactTime = typeof contactTimes[number]
export const contactCategories = ['all', 'leader', 'colleague', 'report', 'client', 'other'] as const
export type ContactCategory = Exclude<typeof contactCategories[number], 'all'>
export const contactStatuses = ['on-track', 'waiting', 'needs-follow-up', 'no-update'] as const
export type ContactStatus = typeof contactStatuses[number]
export const contactTagColors = ['blue', 'violet', 'green', 'amber', 'rose'] as const
export type ContactTagColor = typeof contactTagColors[number]

export type ContactSource = { connector: ConnectorId; name: string }
export type ContactTag = { id: string; name: string; rule: string; color: ContactTagColor }
export type ContactRecentStatus = { tone: ContactStatus; detail: string }
export type ContactProfile = { summary: string; recentContacts: string; relationship: string; context: string }
export type Contact = {
  id: string
  name: string
  relationship: string
  category: ContactCategory
  company: string
  tagIds: string[]
  sources: ContactSource[]
  lastInteractionAt: string
  recentStatus: ContactRecentStatus
  profile: ContactProfile
  contextPrompt: string
  refreshedAt?: string
  invitedAt?: string
}
export type ContactFilters = { query: string; sourceIds: ConnectorId[]; time: ContactTime; category: typeof contactCategories[number] }
export type ContactPatch = Partial<Pick<Contact, 'relationship' | 'category' | 'sources' | 'contextPrompt' | 'tagIds'>>

const timeWindows: Record<Exclude<ContactTime, 'all' | 'day'>, number> = {
  week: 7 * 24 * 60 * 60 * 1_000,
  month: 30 * 24 * 60 * 60 * 1_000,
  quarter: 90 * 24 * 60 * 60 * 1_000,
}

const connectorSearchTerms: Record<ConnectorId, string[]> = {
  dingtalk: ['dingtalk', '钉钉'], feishu: ['feishu', '飞书'], teams: ['teams', '微软 teams'],
}

const requireContact = (contacts: Contact[], id: string): Contact => {
  const contact = contacts.find((item) => item.id === id)
  if (!contact) throw new Error('not-found')
  return contact
}

const validTimestamp = (value: string): string => {
  if (!Number.isFinite(Date.parse(value))) throw new Error('invalid-time')
  return value
}

const normalizeSources = (sources: ContactSource[]): ContactSource[] => {
  const seen = new Set<ConnectorId>()
  return sources.map((source) => {
    const name = source.name.trim()
    if (!name || seen.has(source.connector)) throw new Error('invalid-source')
    seen.add(source.connector)
    return { ...source, name }
  })
}

const normalizeTagIds = (tagIds: string[]): string[] => [...new Set(tagIds.filter(Boolean))]

const replaceContact = (contacts: Contact[], id: string, update: (contact: Contact) => Contact): Contact[] => {
  requireContact(contacts, id)
  return contacts.map((contact) => contact.id === id ? update(contact) : contact)
}

export const selectContacts = (contacts: Contact[], filters: ContactFilters, now: Date, tags: ContactTag[] = []): Contact[] => {
  const term = filters.query.trim().toLocaleLowerCase()
  const threshold = filters.time === 'all' ? Number.NEGATIVE_INFINITY : filters.time === 'day' ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() : now.getTime() - timeWindows[filters.time]
  const tagsById = new Map(tags.map((tag) => [tag.id, tag.name]))

  return contacts.filter((contact) => {
    const search = [contact.name, contact.relationship, contact.company, ...contact.tagIds.map((id) => tagsById.get(id) ?? ''), ...contact.sources.flatMap((source) => [source.name, ...connectorSearchTerms[source.connector]])].join(' ').toLocaleLowerCase()
    const sourceMatches = !filters.sourceIds.length || contact.sources.some((source) => filters.sourceIds.includes(source.connector))
    const categoryMatches = filters.category === 'all' || contact.category === filters.category
    return search.includes(term) && sourceMatches && categoryMatches && Date.parse(contact.lastInteractionAt) >= threshold
  }).slice().sort((a, b) => Date.parse(b.lastInteractionAt) - Date.parse(a.lastInteractionAt))
}

export const updateContact = (contacts: Contact[], id: string, patch: ContactPatch): Contact[] => replaceContact(contacts, id, (contact) => ({
  ...contact,
  relationship: patch.relationship === undefined ? contact.relationship : patch.relationship.trim(),
  category: patch.category ?? contact.category,
  sources: patch.sources === undefined ? contact.sources : normalizeSources(patch.sources),
  contextPrompt: patch.contextPrompt === undefined ? contact.contextPrompt : patch.contextPrompt.trim(),
  tagIds: patch.tagIds === undefined ? contact.tagIds : normalizeTagIds(patch.tagIds),
}))

export const removeContactSource = (contacts: Contact[], id: string, connector: ConnectorId): Contact[] => replaceContact(contacts, id, (contact) => ({
  ...contact,
  sources: contact.sources.filter((source) => source.connector !== connector),
}))

export const refreshContact = (contacts: Contact[], id: string, refreshedAt: string): Contact[] => replaceContact(contacts, id, (contact) => {
  if (!contact.sources.length) throw new Error('no-source')
  return { ...contact, refreshedAt: validTimestamp(refreshedAt) }
})

export const inviteContact = (contacts: Contact[], id: string, invitedAt: string): Contact[] => replaceContact(contacts, id, (contact) => ({ ...contact, invitedAt: validTimestamp(invitedAt) }))
