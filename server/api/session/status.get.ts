import { getCookie } from 'h3'
import { SESSION_COOKIE, verifySessionToken } from '~/server/utils/cookies'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, SESSION_COOKIE)
  const authenticated = verifySessionToken(token, config.sessionSecret)
  return { authenticated }
})
