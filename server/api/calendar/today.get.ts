import { createError, setHeader } from 'h3'
import { fetchTodaysEvents, CalendarNotConfiguredError, CalendarAuthError } from '~/server/services/calendar'
import { getUserById } from '~/server/repositories/users'
import { isMockMode } from '~/server/utils/mock-mode'

export default defineEventHandler(async (event) => {
  try {
    if (isMockMode()) {
      const events = await fetchTodaysEvents('')
      setHeader(event, 'Cache-Control', 'no-store')
      return { events }
    }

    const userId = event.context.userId as string
    const user = await getUserById(userId)
    if (!user?.googleRefreshToken) throw new CalendarNotConfiguredError()

    const events = await fetchTodaysEvents(user.googleRefreshToken)
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
