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
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="flex flex-wrap items-end gap-3 mb-6" @submit.prevent="submit">
    <label class="flex-1 min-w-[200px]">
      <span class="kicker">New task</span>
      <input
        v-model="text"
        type="text"
        placeholder="Call the dentist…"
        class="mt-1 w-full bg-transparent border-b border-ink py-2 font-display text-xl focus:outline-none focus:border-accent"
      >
    </label>
    <label>
      <span class="kicker">Priority</span>
      <select
        v-model="priority"
        class="mt-1 block bg-transparent border-b border-ink py-2 pr-6 focus:outline-none focus:border-accent"
      >
        <option value="high">High</option>
        <option value="med">Medium</option>
        <option value="low">Low</option>
      </select>
    </label>
    <label>
      <span class="kicker">Due</span>
      <input
        v-model="dueDate"
        type="date"
        class="mt-1 block bg-transparent border-b border-ink py-2 focus:outline-none focus:border-accent"
      >
    </label>
    <button
      type="submit"
      :disabled="submitting || !text.trim()"
      class="kicker border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition disabled:opacity-40"
    >
      Add
    </button>
  </form>
</template>
