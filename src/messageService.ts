import { confirmMessage, createDemoMessageSnapshot, recordMessageFeedback, skipMessage } from './messageState.ts'
import type { MessageFeedback, MessageSnapshot } from './messageState.ts'

export type MessageService = {
  load: () => Promise<MessageSnapshot>
  confirm: (id: string) => Promise<MessageSnapshot>
  skip: (id: string) => Promise<MessageSnapshot>
  submitFeedback: (id: string, feedback: MessageFeedback) => Promise<MessageSnapshot>
}

export const createMessageService = (initial: MessageSnapshot = createDemoMessageSnapshot()): MessageService => {
  let snapshot = structuredClone(initial)
  const current = () => structuredClone(snapshot)

  return {
    load: async () => current(),
    confirm: async (id) => { snapshot = confirmMessage(snapshot, id); return current() },
    skip: async (id) => { snapshot = skipMessage(snapshot, id); return current() },
    submitFeedback: async (id, feedback) => { snapshot = recordMessageFeedback(snapshot, id, feedback); return current() },
  }
}

export const messageService = createMessageService()
