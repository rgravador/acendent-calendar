import { deleteCookie } from 'h3'
import { SESSION_COOKIE } from '~/server/utils/cookies'

export default defineEventHandler((event) => {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
  return { ok: true }
})
