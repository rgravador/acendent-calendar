import { listTodos } from '~/server/repositories/todos'

export default defineEventHandler(async () => {
  return { todos: await listTodos() }
})
