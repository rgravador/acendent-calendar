<script setup lang="ts">
import { ref } from 'vue'
import type { Priority } from '~/server/types/models'

const emit = defineEmits<{
  (e: 'add', input: { text: string; priority: Priority; dueDate?: string }): void
}>()

const text = ref('')
const priority = ref<Priority>('med')
const dueDate = ref('')
const submitting = ref(false)
const expanded = ref(false)

async function submit() {
  const trimmed = text.value.trim()
  if (!trimmed) return
  submitting.value = true
  try {
    emit('add', {
      text: trimmed,
      priority: priority.value,
      ...(dueDate.value ? { dueDate: dueDate.value } : {}),
    })
    text.value = ''
    dueDate.value = ''
    priority.value = 'med'
    expanded.value = false
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="space-y-2" @submit.prevent="submit">
    <div class="flex gap-2">
      <input
        v-model="text"
        type="text"
        placeholder="Add a task…"
        class="field flex-1"
        @focus="expanded = true"
      >
      <button
        type="submit"
        :disabled="submitting || !text.trim()"
        class="btn btn-primary"
      >
        Add
      </button>
    </div>
    <div
      v-if="expanded || dueDate || priority !== 'med'"
      class="flex items-center gap-2 flex-wrap text-xs"
    >
      <label class="flex items-center gap-1.5">
        <span class="text-mute">Priority</span>
        <select
          v-model="priority"
          class="field py-1 px-2 text-xs"
        >
          <option value="high">High</option>
          <option value="med">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>
      <label class="flex items-center gap-1.5">
        <span class="text-mute">Due</span>
        <input
          v-model="dueDate"
          type="date"
          class="field py-1 px-2 text-xs"
        >
      </label>
    </div>
  </form>
</template>
