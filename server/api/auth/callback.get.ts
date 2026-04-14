import { getQuery, createError, setCookie, setResponseStatus, setResponseHeader } from 'h3'
import { exchangeCodeForTokens, verifyIdToken } from '~/server/utils/google-oauth'
import { upsertUser } from '~/server/repositories/users'
import { issueSessionToken, sessionCookieOptions, SESSION_COOKIE } from '~/server/utils/cookies'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (typeof query.error === 'string') {
    throw createError({ statusCode: 400, statusMessage: `Google returned an error: ${query.error}` })
  }

  const code = typeof query.code === 'string' ? query.code : ''
  if (!code) throw createError({ statusCode: 400, statusMessage: 'Missing authorization code' })

  const config = useRuntimeConfig()
  if (!config.sessionSecret) {
    throw createError({ statusCode: 500, statusMessage: 'SESSION_SECRET not configured' })
  }

  const { refreshToken, idToken } = await exchangeCodeForTokens(code)
  const googleUser = await verifyIdToken(idToken)

  await upsertUser({
    googleId: googleUser.sub,
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
    googleRefreshToken: refreshToken,
  })

  const sessionToken = issueSessionToken(googleUser.sub, config.sessionSecret)
  setCookie(event, SESSION_COOKIE, sessionToken, sessionCookieOptions())

  setResponseStatus(event, 302)
  setResponseHeader(event, 'Location', '/dashboard')
  return ''
})
