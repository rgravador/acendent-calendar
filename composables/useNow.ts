import { ref, onMounted, onBeforeUnmount } from 'vue'

const TICK_INTERVAL_MS = 60_000

/**
 * A shared reactive clock that updates once per minute.
 * Used for "time-until" indicators and masthead date so we don't
 * spawn a timer per component.
 */
export function useNow() {
  const now = ref<Date>(new Date())
  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    now.value = new Date()
    timer = setInterval(() => {
      now.value = new Date()
    }, TICK_INTERVAL_MS)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    timer = null
  })

  return now
}
