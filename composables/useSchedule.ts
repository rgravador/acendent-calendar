import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { CalendarEventDTO } from '~/server/services/calendar'

const POLL_INTERVAL_MS = 5 * 60 * 1000

export type ScheduleError =
  | { kind: 'not_connected' }
  | { kind: 'auth_failed' }
  | { kind: 'unknown'; message: string }

export function useSchedule() {
  const events = ref<CalendarEventDTO[]>([])
  const loading = ref(true)
  const error = ref<ScheduleError | null>(null)
  let timer: ReturnType<typeof setInterval> | null = null

  async function refresh() {
    try {
      const res = await $fetch<{ events: CalendarEventDTO[] }>('/api/calendar/today')
      events.value = res.events
      error.value = null
    } catch (e: unknown) {
      const err = e as { statusCode?: number; statusMessage?: string }
      if (err.statusCode === 409) error.value = { kind: 'not_connected' }
      else if (err.statusCode === 502) error.value = { kind: 'auth_failed' }
      else error.value = { kind: 'unknown', message: err.statusMessage ?? 'Calendar unavailable' }
    } finally {
      loading.value = false
    }
  }

  function handleVisibility() {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      refresh()
    }
  }

  onMounted(() => {
    refresh()
    timer = setInterval(refresh, POLL_INTERVAL_MS)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility)
    }
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    timer = null
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  })

  return { events, loading, error, refresh }
}
