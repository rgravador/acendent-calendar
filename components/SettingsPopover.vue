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

const PRESETS = [0, 5, 10, 15, 30]
</script>

<template>
  <div class="relative inline-block">
    <button
      class="btn btn-ghost text-xs"
      @click="open = !open"
    >
      <span class="dot text-accent" />
      <span>Alarm · {{ offsetMinutes }}m before</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-2 w-72 card p-4 z-20"
    >
      <div class="kicker">Alarm lead time</div>
      <p class="text-xs text-mute mt-1">How long before each event to alert you.</p>

      <div class="flex gap-1.5 flex-wrap mt-3">
        <button
          v-for="p in PRESETS"
          :key="p"
          type="button"
          class="tag hover:bg-accent-soft hover:text-accent transition cursor-pointer"
          :class="draft === p ? 'tag-accent' : ''"
          @click="draft = p"
        >
          {{ p }}m
        </button>
      </div>

      <label class="block mt-4">
        <span class="text-xs text-mute">Custom</span>
        <input
          v-model.number="draft"
          type="number"
          min="0"
          max="120"
          class="field text-sm mt-1 tabular-nums"
        >
      </label>

      <div class="flex justify-end gap-2 mt-4">
        <button class="btn btn-ghost text-xs" @click="open = false">Cancel</button>
        <button
          class="btn btn-accent text-xs"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
