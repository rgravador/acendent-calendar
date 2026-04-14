import { getCookie } from 'h3'
import { SESSION_COOKIE, verifySessionToken } from '~/server/utils/cookies'
import { getUserById } from '~/server/repositories/users'
import { isMockMode } from '~/server/utils/mock-mode'

export default defineEventHandler(async (event) => {
  if (isMockMode()) {
    return { authenticated: true, user: { name: 'Mock User', email: 'mock@example.com' } }
  }

  const config = useRuntimeConfig()
  const token = getCookie(event, SESSION_COOKIE)
  const userId = verifySessionToken(token, config.sessionSecret)
  if (!userId) return { authenticated: false, user: null }

  const user = await getUserById(userId)
  if (!user) return { authenticated: false, user: null }

  return {
    authenticated: true,
    user: { name: user.name, email: user.email, picture: user.picture },
  }
})
