import { readBody, createError } from 'h3'
import { updateSettings } from '~/server/repositories/settings'

const MIN_OFFSET = 0
const MAX_OFFSET = 120

export default defineEventHandler(async (event) => {
  const body = await readBody<{ alarmOffsetMinutes?: number }>(event).catch(() => ({}))
  const offset = body.alarmOffsetMinutes
  if (typeof offset !== 'number' || !Number.isFinite(offset)) {
    throw createError({ statusCode: 400, statusMessage: 'alarmOffsetMinutes must be a number' })
  }
  if (offset < MIN_OFFSET || offset > MAX_OFFSET) {
    throw createError({ statusCode: 400, statusMessage: `alarmOffsetMinutes must be between ${MIN_OFFSET} and ${MAX_OFFSET}` })
  }
  const updated = await updateSettings({ alarmOffsetMinutes: Math.floor(offset) })
  return {
    alarmOffsetMinutes: updated.alarmOffsetMinutes,
    calendarConnected: Boolean(updated.googleRefreshToken),
  }
})
