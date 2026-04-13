<script setup lang="ts">
import { computed, type Ref } from 'vue'
import type { CalendarEventDTO } from '~/server/services/calendar'
import type { ScheduleError } from '~/composables/useSchedule'

const props = defineProps<{
  events: CalendarEventDTO[]
  loading: boolean
  error: ScheduleError | null
  now: Date
}>()

const hasEvents = computed(() => props.events.length > 0)
</script>

<template>
  <div>
    <div class="flex items-end justify-between mb-4 gap-8">
      <div>
        <div class="kicker">Section I</div>
        <h2 class="font-display text-4xl leading-none">Today&rsquo;s Schedule</h2>
      </div>
      <div class="text-sm text-mute italic self-end">
        Primary calendar &middot; refreshes silently
      </div>
    </div>

    <div v-if="error?.kind === 'not_connected'" class="border-y border-rule py-8">
      <p class="font-display text-2xl italic">No calendar connected.</p>
      <p class="text-mute mt-2">Visit <code>/setup</code> to connect your Google Calendar.</p>
    </div>

    <div v-else-if="error?.kind === 'auth_failed'" class="border-y border-rule py-8">
      <p class="font-display text-2xl italic">Calendar authorisation expired.</p>
      <p class="text-mute mt-2">Re-run <code>/setup</code> to refresh the token.</p>
    </div>

    <div v-else-if="error?.kind === 'unknown'" class="border-y border-rule py-8">
      <p class="font-display text-2xl italic">Calendar temporarily unavailable.</p>
      <p class="text-mute mt-2">{{ error.message }} &mdash; will retry automatically.</p>
    </div>

    <div v-else-if="loading" class="border-y border-rule py-8 text-mute italic">
      Reading today&rsquo;s pages&hellip;
    </div>

    <div v-else-if="!hasEvents" class="border-y border-rule py-12 text-center">
      <p class="font-display text-3xl italic">Nothing on the agenda.</p>
      <p class="text-mute mt-2">A rare and welcome thing.</p>
    </div>

    <ol v-else class="divide-y divide-rule border-y border-rule">
      <EventRow
        v-for="e in events"
        :key="e.id"
        :event="e"
        :now="now"
      />
    </ol>
  </div>
</template>
