<script setup lang="ts">
import type { PermissionState } from '~/composables/useAlarms'

const props = defineProps<{
  permission: PermissionState
  soundUnlocked: boolean
}>()

const emit = defineEmits<{
  (e: 'request-permission'): void
  (e: 'unlock-sound'): void
}>()

const visible = computed(() => props.permission !== 'granted' || !props.soundUnlocked)
</script>

<template>
  <div
    v-if="visible"
    class="border border-rule bg-paper px-5 py-3 my-4 flex flex-wrap items-center justify-between gap-4"
  >
    <div class="text-sm italic text-mute">
      <span v-if="permission === 'unsupported'">
        This browser does not support desktop notifications.
      </span>
      <span v-else-if="permission === 'denied'">
        Desktop notifications are blocked in browser settings. The chime will still play if sound is enabled.
      </span>
      <span v-else-if="permission !== 'granted'">
        Enable notifications so alarms can reach you before each event.
      </span>
      <span v-else-if="!soundUnlocked">
        Enable sound to hear the alarm chime.
      </span>
    </div>
    <div class="flex gap-3">
      <button
        v-if="permission === 'default'"
        class="kicker border border-ink px-3 py-2 hover:bg-ink hover:text-paper transition"
        @click="emit('request-permission')"
      >
        Enable notifications
      </button>
      <button
        v-if="!soundUnlocked"
        class="kicker border border-ink px-3 py-2 hover:bg-ink hover:text-paper transition"
        @click="emit('unlock-sound')"
      >
        Enable sound
      </button>
    </div>
  </div>
</template>
