import { updateAiProduct, updateProjectDocument, updateTodoStatus } from './tasksState.ts'
import type { TaskAiProduct, TaskDocument, TasksSnapshot, TodoStatus } from './tasksState.ts'

export type TasksService = {
  load: () => Promise<TasksSnapshot>
  updateTodoStatus: (todoId: string, status: Extract<TodoStatus, 'completed' | 'cancelled'>) => Promise<TasksSnapshot>
  updateAiProduct: (todoId: string, update: Pick<TaskAiProduct, 'title' | 'content' | 'feedback'>) => Promise<TasksSnapshot>
  updateProjectDocument: (projectId: string, update: Pick<TaskDocument, 'title' | 'content'>) => Promise<TasksSnapshot>
}

export const createTasksService = (initial: TasksSnapshot): TasksService => {
  let snapshot = structuredClone(initial)
  const current = () => structuredClone(snapshot)

  return {
    load: async () => current(),
    updateTodoStatus: async (todoId, status) => { snapshot = updateTodoStatus(snapshot, todoId, status); return current() },
    updateAiProduct: async (todoId, update) => { snapshot = updateAiProduct(snapshot, todoId, update); return current() },
    updateProjectDocument: async (projectId, update) => { snapshot = updateProjectDocument(snapshot, projectId, update); return current() },
  }
}
