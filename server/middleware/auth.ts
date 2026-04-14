import { getCookie, sendRedirect, createError } from 'h3'
import { SESSION_COOKIE, verifySessionToken } from '~/server/utils/cookies'
import { isMockMode } from '~/server/utils/mock-mode'

const MOCK_USER_ID = 'mock-user'

const PUBLIC_ROUTES: readonly (string | RegExp)[] = [
  '/',
  '/api/auth/google',
  '/api/auth/callback',
  '/api/session/status',
  '/api/health',
  // Nuxt/Vite internals
  /^\/_nuxt(\/.*)?$/,
  /^\/__nuxt(\/.*)?$/,
  /^\/_ipx(\/.*)?$/,
  /^\/_fonts(\/.*)?$/,
  '/favicon.ico',
]

function isPublic(path: string): boolean {
  return PUBLIC_ROUTES.some((route) =>
    typeof route === 'string' ? path === route : route.test(path),
  )
}

export default defineEventHandler(async (event) => {
  const rawPath = event.path || event.node.req.url || '/'
  const path = rawPath.split('?')[0]
  if (isPublic(path)) return

  if (isMockMode()) {
    event.context.userId = MOCK_USER_ID
    return
  }

  const config = useRuntimeConfig()
  const secret = config.sessionSecret
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'SESSION_SECRET not configured' })
  }

  const token = getCookie(event, SESSION_COOKIE)
  const userId = verifySessionToken(token, secret)
  if (userId) {
    event.context.userId = userId
    return
  }

  if (path.startsWith('/api/')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  await sendRedirect(event, '/', 302)
})
