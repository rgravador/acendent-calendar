<script setup lang="ts">
import { computed } from 'vue'
import type { Todo } from '~/server/types/models'

const props = defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string, done: boolean): void
  (e: 'remove', id: string): void
}>()

const priorityLabel = computed(() => ({ high: 'High', med: 'Med', low: 'Low' }[props.todo.priority]))
const priorityClass = computed(() => ({
  high: 'text-accent',
  med: 'text-ink',
  low: 'text-mute',
}[props.todo.priority]))

const isOverdue = computed(() => {
  if (props.todo.done || !props.todo.dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(props.todo.dueDate)
  return due.getTime() < today.getTime()
})

const dueLabel = computed(() => {
  if (!props.todo.dueDate) return null
  const d = new Date(props.todo.dueDate)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
})
</script>

<template>
  <li class="group flex items-start gap-4 py-3 border-b border-rule">
    <button
      class="mt-1 w-5 h-5 border border-ink flex items-center justify-center hover:bg-ink transition"
      :aria-label="todo.done ? 'Mark incomplete' : 'Mark complete'"
      @click="emit('toggle', todo._id, !todo.done)"
    >
      <span v-if="todo.done" class="text-paper text-xs leading-none">&#10003;</span>
    </button>

    <div class="flex-1 min-w-0">
      <div
        class="font-display text-lg leading-snug"
        :class="{ 'line-through text-mute': todo.done }"
      >
        {{ todo.text }}
      </div>
      <div class="flex items-center gap-3 text-xs mt-1">
        <span class="kicker" :class="priorityClass">{{ priorityLabel }}</span>
        <span v-if="dueLabel" :class="isOverdue ? 'text-accent' : 'text-mute'">
          {{ isOverdue ? 'Overdue &middot; ' : '' }}{{ dueLabel }}
        </span>
      </div>
    </div>

    <button
      class="opacity-0 group-hover:opacity-100 text-xs text-mute hover:text-accent transition"
      @click="emit('remove', todo._id)"
    >
      Delete
    </button>
  </li>
</template>
