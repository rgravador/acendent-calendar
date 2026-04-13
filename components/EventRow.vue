<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarEventDTO } from '~/server/services/calendar'
import { formatClock, formatRelative, formatDuration, isCurrent, diffMinutes } from '~/utils/time'

const props = defineProps<{
  event: CalendarEventDTO
  now: Date
}>()

const clock = computed(() => formatClock(props.event.start))
const duration = computed(() => formatDuration(props.event.start, props.event.end))
const current = computed(() => isCurrent(props.event.start, props.event.end, props.now))
const minsToStart = computed(() => diffMinutes(props.event.start, props.now))
const past = computed(() => !current.value && minsToStart.value < 0 && new Date(props.event.end).getTime() < props.now.getTime())
const relative = computed(() => {
  if (current.value) return 'now'
  if (past.value) return 'concluded'
  return formatRelative(props.event.start, props.now)
})
</script>

<template>
  <li
    class="grid grid-cols-[7rem_1fr_auto] gap-6 py-5 items-baseline transition"
    :class="{
      'opacity-40': past,
    }"
  >
    <span class="font-display text-2xl tabular-nums" :class="{ 'accent-underline text-ink': current }">
      {{ clock }}
    </span>
    <div>
      <a
        v-if="event.htmlLink"
        :href="event.htmlLink"
        target="_blank"
        rel="noopener"
        class="font-display text-2xl leading-snug hover:text-accent transition"
      >{{ event.title }}</a>
      <span v-else class="font-display text-2xl leading-snug">{{ event.title }}</span>
      <div class="text-sm text-mute mt-1">
        {{ duration }}<template v-if="event.location"> &middot; {{ event.location }}</template>
      </div>
    </div>
    <span
      class="kicker tabular-nums text-right"
      :class="{ 'text-accent': current, 'text-mute': !current }"
    >{{ relative }}</span>
  </li>
</template>
