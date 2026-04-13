import { getQuery } from 'h3'
import { constantTimeEqual } from '~/server/utils/cookies'
import { getSettings } from '~/server/repositories/settings'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const secret = typeof query.secret === 'string' ? query.secret : ''
  if (!config.setupSecret || !constantTimeEqual(secret, config.setupSecret)) {
    return { ok: false, hasToken: false }
  }
  const settings = await getSettings()
  return {
    ok: true,
    hasToken: Boolean(settings.googleRefreshToken),
    updatedAt: settings.googleTokenUpdatedAt,
  }
})
