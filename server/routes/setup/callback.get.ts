import { getQuery, sendRedirect, createError } from 'h3'
import { constantTimeEqual } from '~/server/utils/cookies'
import { exchangeCodeForRefreshToken } from '~/server/utils/google-oauth'
import { updateSettings } from '~/server/repositories/settings'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  if (typeof query.error === 'string') {
    throw createError({ statusCode: 400, statusMessage: `Google returned an error: ${query.error}` })
  }

  const state = typeof query.state === 'string' ? query.state : ''
  if (!config.setupSecret || !constantTimeEqual(state, config.setupSecret)) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid state' })
  }

  const code = typeof query.code === 'string' ? query.code : ''
  if (!code) throw createError({ statusCode: 400, statusMessage: 'Missing code' })

  const refreshToken = await exchangeCodeForRefreshToken(code)
  await updateSettings({ googleRefreshToken: refreshToken })

  await sendRedirect(event, `/setup?secret=${encodeURIComponent(config.setupSecret)}&connected=1`, 302)
})
