import assert from 'node:assert/strict'
import test from 'node:test'
import { createContactsService } from './contactsService.ts'

test('loads five automatically maintained contacts with reusable tag definitions', async () => {
  const service = createContactsService()
  const { contacts, tags } = await service.load()

  assert.equal(contacts.length, 5)
  assert.deepEqual(contacts.map((contact) => contact.category), ['colleague', 'leader', 'report', 'client', 'other'])
  assert.equal(new Set(contacts.map((contact) => contact.lastInteractionAt)).size, 5)
  assert.deepEqual([...new Set(contacts.flatMap((contact) => contact.sources.map((source) => source.connector)))].sort(), ['dingtalk', 'feishu', 'teams'])
  assert.deepEqual(contacts.map((contact) => contact.recentStatus.tone), ['on-track', 'waiting', 'on-track', 'needs-follow-up', 'no-update'])
  assert.deepEqual(tags.map((tag) => tag.name), ['Product launch', 'Decision maker', 'Design review', 'Needs follow-up'])
  assert.deepEqual(contacts.map((contact) => contact.tagIds), [['product-launch'], ['decision-maker'], ['design-review'], ['needs-follow-up'], []])
})

test('rejects an unknown tag assignment without overwriting the saved contact', async () => {
  const { contacts: [mia] } = await createContactsService().load()
  const service = createContactsService([mia])

  await assert.rejects(service.update('mia-lin', { tagIds: ['unknown'] }), /invalid-tag/)
  assert.deepEqual((await service.load()).contacts[0].tagIds, ['product-launch'])
})

test('creates a tag with its rule and deletes it from every contact', async () => {
  const service = createContactsService()
  const created = await service.createTag({ name: 'Executive review', rule: 'People who review the executive update.' })
  const tag = created.tags.find((item) => item.name === 'Executive review')

  assert.ok(tag)
  const assigned = await service.update('mia-lin', { tagIds: ['product-launch', tag.id] })
  assert.ok(assigned.contacts.find((item) => item.id === 'mia-lin')?.tagIds.includes(tag.id))

  const removed = await service.removeTag(tag.id)
  assert.equal(removed.tags.some((item) => item.id === tag.id), false)
  assert.equal(removed.contacts.some((item) => item.tagIds.includes(tag.id)), false)
})
