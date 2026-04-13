import { createError, setHeader } from 'h3'
import { fetchTodaysEvents, CalendarNotConfiguredError, CalendarAuthError } from '~/server/services/calendar'

export default defineEventHandler(async (event) => {
  try {
    const events = await fetchTodaysEvents()
    setHeader(event, 'Cache-Control', 'no-store')
    return { events }
  } catch (err: unknown) {
    if (err instanceof CalendarNotConfiguredError) {
      throw createError({ statusCode: 409, statusMessage: err.message })
    }
    if (err instanceof CalendarAuthError) {
      throw createError({ statusCode: 502, statusMessage: err.message })
    }
    throw createError({ statusCode: 502, statusMessage: 'Failed to load calendar events' })
  }
})
