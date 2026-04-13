import { listNotes } from '~/server/repositories/notes'

export default defineEventHandler(async () => {
  return { notes: await listNotes() }
})
