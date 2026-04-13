import { getQuery, sendRedirect, createError } from 'h3'
import { constantTimeEqual } from '~/server/utils/cookies'
import { buildAuthUrl } from '~/server/utils/google-oauth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const secret = typeof query.secret === 'string' ? query.secret : ''
  if (!config.setupSecret || !constantTimeEqual(secret, config.setupSecret)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  // Carry the secret forward via `state` so the callback can re-verify.
  const url = buildAuthUrl(config.setupSecret)
  await sendRedirect(event, url, 302)
})
