<script setup lang="ts">
import { computed } from 'vue'

const now = useNow()
const schedule = useSchedule()
const { settings, setOffset } = useSettings()

const offsetRef = computed(() => settings.value.alarmOffsetMinutes)

const alarms = useAlarms({
  events: schedule.events,
  offsetMinutes: offsetRef,
})

const masthead = computed(() => {
  const d = now.value
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase()
  const month = d.toLocaleDateString(undefined, { month: 'long' })
  const day = d.getDate()
  return { weekday, month, day, year: d.getFullYear() }
})

async function onOffsetUpdate(minutes: number) {
  await setOffset(minutes)
}

async function logout() {
  await $fetch('/api/session/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Masthead -->
    <header class="mx-auto max-w-[1400px] px-10 pt-10 pb-6">
      <div class="flex items-end justify-between gap-8 flex-wrap">
        <div>
          <div class="kicker">Personal Edition</div>
          <h1 class="font-display text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] tracking-tight">
            The Daily
          </h1>
        </div>
        <div class="flex items-end gap-6">
          <SettingsPopover
            :offset-minutes="settings.alarmOffsetMinutes"
            @update="onOffsetUpdate"
          />
          <button
            class="kicker text-mute hover:text-accent transition"
            @click="logout"
          >
            Sign out
          </button>
          <div class="text-right">
            <div class="kicker">{{ masthead.weekday }}</div>
            <div class="font-display text-3xl leading-none">
              {{ masthead.month }} {{ masthead.day }}
            </div>
            <div class="text-sm text-mute mt-1">Vol. MMXXVI &middot; No. {{ masthead.day }}</div>
          </div>
        </div>
      </div>
      <div class="hairline mt-6" />

      <PermissionBanner
        :permission="alarms.permission.value"
        :sound-unlocked="alarms.soundUnlocked.value"
        @request-permission="alarms.requestPermission"
        @unlock-sound="alarms.unlockSound"
      />
    </header>

    <!-- Schedule (dominant) -->
    <section class="mx-auto max-w-[1400px] px-10 pb-8">
      <ScheduleSection
        :events="schedule.events.value"
        :loading="schedule.loading.value"
        :error="schedule.error.value"
        :now="now"
      />
    </section>

    <div class="mx-auto max-w-[1400px] px-10">
      <div class="hairline" />
    </div>

    <!-- Bottom row: todos + notes -->
    <section class="mx-auto max-w-[1400px] px-10 py-10 grid grid-cols-12 gap-10">
      <div class="col-span-12 lg:col-span-5">
        <TodosSection />
      </div>
      <div class="hidden lg:block lg:col-span-1">
        <div class="h-full w-px bg-rule mx-auto" />
      </div>
      <div class="col-span-12 lg:col-span-6">
        <NotesSection />
      </div>
    </section>

    <footer class="mx-auto max-w-[1400px] px-10 pb-10">
      <div class="hairline mb-4" />
      <div class="flex items-center justify-between text-sm text-mute">
        <span class="kicker">Personal Dashboard</span>
        <span>Est. 2026</span>
      </div>
    </footer>
  </div>
</template>
