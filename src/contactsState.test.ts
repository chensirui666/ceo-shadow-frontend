import assert from 'node:assert/strict'
import test from 'node:test'
import { inviteContact, refreshContact, removeContactSource, selectContacts, updateContact } from './contactsState.ts'
import type { Contact } from './contactsState.ts'

const fixture = (id = 'mia-lin'): Contact => ({
  id,
  name: 'Mia Lin',
  relationship: 'Stardust AI colleague',
  category: 'colleague',
  company: 'Stardust AI',
  tagIds: ['product-launch'],
  sources: [{ connector: 'dingtalk', name: 'Mia Lin' }],
  lastInteractionAt: '2026-09-20T11:00:00.000Z',
  recentStatus: { tone: 'on-track', detail: 'Product launch · release checklist confirmed' },
  profile: {
    summary: 'Mia works with Stardust AI on product launches.',
    recentContacts: 'Sep 20 · DingTalk · Confirmed the release checklist.',
    relationship: 'You work together on product launches.',
    context: 'Usually concise and action-oriented.',
  },
  contextPrompt: '',
})

const contact = (): Contact => fixture()

test('filters by visible name, relationship, tag, source identity, time, and source together', () => {
  const contacts: Contact[] = [
    contact(),
    { ...fixture('sam-wu'), name: 'Sam Wu', relationship: 'Design partner', tagIds: ['design-review'], sources: [{ connector: 'feishu', name: '吴森' }], lastInteractionAt: '2026-07-01T11:00:00.000Z' },
  ]
  const tags = [
    { id: 'product-launch', name: 'Product launch', rule: 'Works on the product launch.', color: 'blue' as const },
    { id: 'design-review', name: 'Design review', rule: 'Reviews product design.', color: 'violet' as const },
  ]

  assert.deepEqual(selectContacts(contacts, { query: ' Lin ', sourceIds: ['dingtalk'], time: 'week', category: 'all' }, new Date('2026-09-21T12:00:00.000Z')).map((item) => item.id), ['mia-lin'])
  assert.deepEqual(selectContacts(contacts, { query: '吴森', sourceIds: ['feishu'], time: 'all', category: 'all' }, new Date('2026-09-21T12:00:00.000Z')).map((item) => item.id), ['sam-wu'])
  assert.deepEqual(selectContacts(contacts, { query: 'Feishu', sourceIds: [], time: 'all', category: 'all' }, new Date('2026-09-21T12:00:00.000Z')).map((item) => item.id), ['sam-wu'])
  assert.deepEqual(selectContacts(contacts, { query: '飞书', sourceIds: [], time: 'all', category: 'all' }, new Date('2026-09-21T12:00:00.000Z')).map((item) => item.id), ['sam-wu'])
  assert.deepEqual(selectContacts(contacts, { query: 'Product launch', sourceIds: [], time: 'all', category: 'all' }, new Date('2026-09-21T12:00:00.000Z'), tags).map((item) => item.id), ['mia-lin'])
  assert.equal(selectContacts(contacts, { query: 'partner', sourceIds: ['dingtalk'], time: 'all', category: 'all' }, new Date('2026-09-21T12:00:00.000Z')).length, 0)
})

test('treats today as the current calendar day instead of the past 24 hours', () => {
  const now = new Date(2026, 8, 21, 1)
  const contacts = [
    { ...contact(), id: 'last-night', lastInteractionAt: new Date(2026, 8, 20, 23).toISOString() },
    { ...fixture('this-morning'), lastInteractionAt: new Date(2026, 8, 21, 0, 10).toISOString() },
  ]

  assert.deepEqual(selectContacts(contacts, { query: '', sourceIds: [], time: 'day', category: 'all' }, now).map((item) => item.id), ['this-morning'])
})

test('filters contacts by category together with the existing filters', () => {
  const contacts: Contact[] = [
    contact(),
    { ...fixture('sam-wu'), category: 'client', sources: [{ connector: 'feishu', name: 'Sam Wu' }] },
  ]

  assert.deepEqual(selectContacts(contacts, { query: '', sourceIds: [], time: 'all', category: 'client' }, new Date('2026-09-21T12:00:00.000Z')).map((item) => item.id), ['sam-wu'])
})

test('edits user-controlled fields without changing the contact name or observed profile facts', () => {
  const original = contact()
  const updated = updateContact([original], original.id, {
    relationship: 'Product launch partner',
    category: 'client',
    sources: [{ connector: 'dingtalk', name: '林米娅' }],
    contextPrompt: 'Keep references to the release checklist short.',
  })

  assert.deepEqual(updated[0].sources, [{ connector: 'dingtalk', name: '林米娅' }])
  assert.equal(updated[0].category, 'client')
  assert.equal(updated[0].contextPrompt, 'Keep references to the release checklist short.')
  assert.equal(updated[0].profile.context, original.profile.context)
  assert.equal(updated[0].name, 'Mia Lin')
  assert.equal(original.name, 'Mia Lin')
})

test('keeps each contact tag assignment unique when it is edited', () => {
  const original = contact()
  const updated = updateContact([original], original.id, { tagIds: ['design-review', 'design-review', 'product-launch'] })

  assert.deepEqual(updated[0].tagIds, ['design-review', 'product-launch'])
})

test('preserves profile history when its final source identity is removed', () => {
  const original = contact()
  const updated = removeContactSource([original], original.id, 'dingtalk')

  assert.equal(updated[0].sources.length, 0)
  assert.equal(updated[0].profile.relationship, 'You work together on product launches.')
  assert.equal(original.sources.length, 1)
})

test('does not refresh a profile after every source identity is removed', () => {
  const sourceFree = removeContactSource([contact()], 'mia-lin', 'dingtalk')

  assert.throws(() => refreshContact(sourceFree, 'mia-lin', '2026-09-21T12:00:00.000Z'), /no-source/)
})

test('refreshing and inviting mutate only the selected profile without adding contacts', () => {
  const contacts = [contact(), fixture('sam-wu')]
  const refreshed = refreshContact(contacts, 'mia-lin', '2026-09-21T12:00:00.000Z')
  const invited = inviteContact(refreshed, 'mia-lin', '2026-09-21T12:05:00.000Z')

  assert.equal(invited.length, 2)
  assert.equal(invited[0].refreshedAt, '2026-09-21T12:00:00.000Z')
  assert.equal(invited[0].invitedAt, '2026-09-21T12:05:00.000Z')
  assert.equal(invited[1].refreshedAt, undefined)
  assert.equal(invited[1].invitedAt, undefined)
})
