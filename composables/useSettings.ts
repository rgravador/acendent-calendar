import { ref, onMounted } from 'vue'

interface ClientSettings {
  alarmOffsetMinutes: number
  calendarConnected: boolean
}

const DEFAULTS: ClientSettings = { alarmOffsetMinutes: 5, calendarConnected: false }

export function useSettings() {
  const settings = ref<ClientSettings>({ ...DEFAULTS })
  const loading = ref(true)

  async function load() {
    try {
      settings.value = await $fetch<ClientSettings>('/api/settings')
    } catch {
      settings.value = { ...DEFAULTS }
    } finally {
      loading.value = false
    }
  }

  async function setOffset(minutes: number) {
    const updated = await $fetch<ClientSettings>('/api/settings', {
      method: 'PATCH',
      body: { alarmOffsetMinutes: minutes },
    })
    settings.value = updated
  }

  onMounted(load)

  return { settings, loading, setOffset, reload: load }
}
