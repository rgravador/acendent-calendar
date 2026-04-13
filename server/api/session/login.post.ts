import { readBody, setCookie, createError } from 'h3'
import { constantTimeEqual, issueSessionToken, sessionCookieOptions, SESSION_COOKIE } from '~/server/utils/cookies'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.dashboardPassword || !config.sessionSecret) {
    throw createError({ statusCode: 500, statusMessage: 'Server auth not configured' })
  }

  const body = await readBody<{ password?: string }>(event).catch(() => ({}))
  const submitted = typeof body.password === 'string' ? body.password : ''
  if (!constantTimeEqual(submitted, config.dashboardPassword)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  const token = issueSessionToken(config.sessionSecret)
  setCookie(event, SESSION_COOKIE, token, sessionCookieOptions())
  return { ok: true }
})
