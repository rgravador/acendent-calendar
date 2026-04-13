import { getCookie, sendRedirect, createError } from 'h3'
import { SESSION_COOKIE, verifySessionToken } from '~/server/utils/cookies'

/**
 * Routes that bypass the session check. `/setup*` is gated by SETUP_SECRET.
 */
const PUBLIC_ROUTES: readonly (string | RegExp)[] = [
  '/login',
  '/api/session/login',
  '/api/session/status',
  '/api/health',
  /^\/setup(\/.*)?$/,
  /^\/api\/setup(\/.*)?$/,
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
  const path = event.path || event.node.req.url || '/'
  if (isPublic(path)) return

  const config = useRuntimeConfig()
  const secret = config.sessionSecret
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'SESSION_SECRET not configured' })
  }

  const token = getCookie(event, SESSION_COOKIE)
  if (verifySessionToken(token, secret)) return

  // API paths get 401, page paths get a redirect to /login
  if (path.startsWith('/api/')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  await sendRedirect(event, '/login', 302)
})
