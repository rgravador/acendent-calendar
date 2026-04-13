import { getSettings } from '~/server/repositories/settings'

export default defineEventHandler(async () => {
  const s = await getSettings()
  // Never expose the refresh token to the client.
  return {
    alarmOffsetMinutes: s.alarmOffsetMinutes,
    calendarConnected: Boolean(s.googleRefreshToken),
  }
})
