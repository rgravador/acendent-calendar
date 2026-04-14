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

const priorityLabel = computed(() => ({ high: 'HI', med: 'MD', low: 'LO' }[props.todo.priority]))
const priorityTag = computed(() => ({
  high: 'tag-bear',
  med: 'tag-warn',
  low: 'tag-info',
}[props.todo.priority]))

const isOverdue = computed(() => {
  if (props.todo.done || !props.todo.dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(props.todo.dueDate).getTime() < today.getTime()
})

const dueLabel = computed(() => {
  if (!props.todo.dueDate) return null
  const d = new Date(props.todo.dueDate)
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase()
})
</script>

<template>
  <li class="group flex items-start gap-3 py-2.5">
    <button
      class="shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition"
      :class="todo.done
        ? 'bg-accent border-accent text-[#071513]'
        : 'border-rule-strong hover:border-accent hover:bg-accent-soft'"
      :aria-label="todo.done ? 'Mark incomplete' : 'Mark complete'"
      @click="emit('toggle', todo._id, !todo.done)"
    >
      <svg v-if="todo.done" class="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M3 8.5 L7 12 L13 4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div class="flex-1 min-w-0">
      <div
        class="text-sm leading-snug"
        :class="{ 'line-through text-mute': todo.done }"
      >
        {{ todo.text }}
      </div>
      <div class="flex items-center gap-1.5 mt-1 flex-wrap">
        <span v-if="!todo.done" class="tag num" :class="priorityTag">{{ priorityLabel }}</span>
        <span v-if="dueLabel" class="tag num" :class="isOverdue ? 'tag-bear' : ''">
          {{ isOverdue ? '▼ OVERDUE ' : '' }}{{ dueLabel }}
        </span>
      </div>
    </div>

    <button
      class="shrink-0 opacity-0 group-hover:opacity-100 text-mute hover:text-bear transition text-xs px-1.5 font-mono"
      :aria-label="`Close ${todo.text}`"
      @click="emit('remove', todo._id)"
    >
      ×
    </button>
  </li>
</template>
