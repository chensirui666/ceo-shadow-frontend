import assert from 'node:assert/strict'
import test from 'node:test'
import { createContactCandidates, createContactsService } from './contactsService.ts'

test('confirms the exact source identities shown in the discovery preview', async () => {
  const service = createContactsService()
  const feishuPreview = await service.discover(['feishu'])
  const preview = await service.discover(['dingtalk'])
  const contacts = await service.confirm(preview.map((candidate) => candidate.id))

  assert.equal(feishuPreview[0].lastInteractionAt, '2026-09-18T10:00:00.000Z')
  assert.match(feishuPreview[0].profile.recentContacts, /Feishu/)
  assert.deepEqual(contacts[0].sources, [{ connector: 'dingtalk', name: 'Mia Lin' }])
  assert.doesNotMatch(contacts[0].profile.recentContacts, /Feishu/)
})

test('rejects an invalid edit without overwriting the saved contact', async () => {
  const service = createContactsService([createContactCandidates()[0]])

  await assert.rejects(service.update('mia-lin', { name: ' ' }), /invalid-name/)
  assert.equal((await service.load())[0].name, 'Mia Lin')
})
