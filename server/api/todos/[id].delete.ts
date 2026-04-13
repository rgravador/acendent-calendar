import { getRouterParam, createError } from 'h3'
import { deleteTodo } from '~/server/repositories/todos'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })
  const ok = await deleteTodo(id)
  if (!ok) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return { ok: true }
})
