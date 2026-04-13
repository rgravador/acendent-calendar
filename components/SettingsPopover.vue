<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  offsetMinutes: number
}>()

const emit = defineEmits<{
  (e: 'update', minutes: number): void
}>()

const open = ref(false)
const draft = ref<number>(props.offsetMinutes)
const saving = ref(false)

watch(() => props.offsetMinutes, (v) => { draft.value = v })

async function save() {
  saving.value = true
  try {
    emit('update', Math.max(0, Math.min(120, Math.floor(Number(draft.value) || 0))))
  } finally {
    saving.value = false
    open.value = false
  }
}
</script>

<template>
  <div class="relative inline-block">
    <button
      class="kicker border border-ink px-3 py-2 hover:bg-ink hover:text-paper transition"
      @click="open = !open"
    >
      Alarm &middot; {{ offsetMinutes }} min before
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-2 w-72 bg-paper border border-ink p-5 z-10 shadow-[6px_6px_0_0_var(--ink)]"
    >
      <div class="kicker">Lead time</div>
      <label class="block mt-3">
        <span class="text-sm text-mute">Minutes before each event</span>
        <input
          v-model.number="draft"
          type="number"
          min="0"
          max="120"
          class="mt-2 w-full bg-transparent border-b border-ink py-1 font-display text-2xl focus:outline-none focus:border-accent tabular-nums"
        >
      </label>
      <div class="flex justify-end gap-3 mt-5">
        <button class="text-sm text-mute italic" @click="open = false">Cancel</button>
        <button
          class="kicker border border-ink px-3 py-2 hover:bg-ink hover:text-paper transition"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
