<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Note } from '~/server/types/models'

const props = defineProps<{
  note: Note
}>()

const emit = defineEmits<{
  (e: 'save', id: string, patch: { title?: string | null; body?: string }): void
  (e: 'remove', id: string): void
}>()

const editing = ref(false)
const draftTitle = ref(props.note.title ?? '')
const draftBody = ref(props.note.body)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.note, (n) => {
  if (!editing.value) {
    draftTitle.value = n.title ?? ''
    draftBody.value = n.body
  }
})

function scheduleSave() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(flush, 400)
}

function flush() {
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null }
  const patch: { title?: string | null; body?: string } = {}
  const trimmedBody = draftBody.value.trim()
  if (trimmedBody && trimmedBody !== props.note.body) patch.body = trimmedBody
  const titleChanged = (draftTitle.value || '') !== (props.note.title || '')
  if (titleChanged) patch.title = draftTitle.value || null
  if (Object.keys(patch).length > 0) emit('save', props.note._id, patch)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    draftTitle.value = props.note.title ?? ''
    draftBody.value = props.note.body
    editing.value = false
  } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    flush()
    editing.value = false
  }
}

function onBlur() { flush(); editing.value = false }

const timestamp = computed(() => {
  const d = new Date(props.note.updatedAt)
  const diffMin = Math.round((Date.now() - d.getTime()) / 60000)
  if (diffMin < 1) return 'NOW'
  if (diffMin < 60) return `T-${diffMin}M`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `T-${diffHr}H`
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase()
})
</script>

<template>
  <article class="group rounded-md bg-surface-soft border border-rule p-3 card-hover transition">
    <div v-if="!editing" class="cursor-text" @click="editing = true">
      <div class="flex items-start justify-between gap-2 mb-1.5">
        <h3 v-if="note.title" class="text-sm font-medium text-ink leading-tight">{{ note.title }}</h3>
        <span class="tag num shrink-0">{{ timestamp }}</span>
      </div>
      <p class="whitespace-pre-wrap text-xs leading-relaxed text-ink-soft font-mono">{{ note.body }}</p>
      <div class="flex justify-end mt-2">
        <button
          class="opacity-0 group-hover:opacity-100 text-[0.65rem] text-mute hover:text-bear transition font-mono uppercase tracking-wider"
          @click.stop="emit('remove', note._id)"
        >
          × Delete
        </button>
      </div>
    </div>

    <div v-else @keydown="onKeydown">
      <input
        v-model="draftTitle"
        placeholder="Title (optional)"
        maxlength="120"
        class="field text-sm mb-2"
        @input="scheduleSave"
      >
      <textarea
        v-model="draftBody"
        rows="4"
        maxlength="2000"
        autofocus
        class="field text-sm resize-none leading-relaxed font-mono"
        @input="scheduleSave"
        @blur="onBlur"
      />
      <div class="flex items-center justify-between mt-2">
        <span class="text-[0.65rem] text-mute font-mono uppercase tracking-wider">⌘/Ctrl+Enter save · Esc cancel</span>
        <span class="text-[0.65rem] text-mute num">{{ draftBody.length }}/2000</span>
      </div>
    </div>
  </article>
</template>
