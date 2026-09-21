import assert from 'node:assert/strict'
import test from 'node:test'
import { createContactsService } from './contactsService.ts'

test('confirms the exact source identities shown in the discovery preview', async () => {
  const service = createContactsService()
  const preview = await service.discover(['dingtalk'])
  const contacts = await service.confirm(preview.map((candidate) => candidate.id))

  assert.deepEqual(contacts[0].sources, [{ connector: 'dingtalk', name: 'Mia Lin' }])
  assert.doesNotMatch(contacts[0].profile.recentContacts, /Feishu/)
})
