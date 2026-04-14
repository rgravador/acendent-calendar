import { sendRedirect } from 'h3'
import { randomBytes } from 'node:crypto'
import { buildLoginUrl } from '~/server/utils/google-oauth'

export default defineEventHandler(async (event) => {
  const state = randomBytes(16).toString('hex')
  // State could be stored server-side for CSRF protection; for now we use a nonce
  const url = buildLoginUrl(state)
  await sendRedirect(event, url, 302)
})
