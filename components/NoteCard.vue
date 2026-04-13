<script setup lang="ts">
import { ref, watch } from 'vue'
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
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
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

function onBlur() {
  flush()
  editing.value = false
}

const updatedAgo = computed(() => {
  const d = new Date(props.note.updatedAt)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
})
</script>

<template>
  <article class="group border border-rule bg-paper p-5 break-inside-avoid mb-5">
    <div v-if="!editing" class="cursor-text" @click="editing = true">
      <h3 v-if="note.title" class="font-display text-xl mb-2">{{ note.title }}</h3>
      <p class="whitespace-pre-wrap leading-snug">{{ note.body }}</p>
      <div class="flex items-center justify-between mt-3">
        <span class="kicker text-mute">{{ updatedAgo }}</span>
        <button
          class="opacity-0 group-hover:opacity-100 text-xs text-mute hover:text-accent transition"
          @click.stop="emit('remove', note._id)"
        >
          Delete
        </button>
      </div>
    </div>

    <div v-else @keydown="onKeydown">
      <input
        v-model="draftTitle"
        placeholder="Title (optional)"
        maxlength="120"
        class="w-full bg-transparent border-b border-rule py-1 font-display text-xl focus:outline-none focus:border-accent"
        @input="scheduleSave"
      >
      <textarea
        v-model="draftBody"
        rows="4"
        maxlength="2000"
        autofocus
        class="mt-3 w-full bg-transparent resize-none focus:outline-none leading-snug"
        @input="scheduleSave"
        @blur="onBlur"
      />
      <div class="flex items-center justify-between mt-2">
        <span class="text-xs text-mute italic">Cmd/Ctrl+Enter to save · Esc to cancel</span>
        <span class="text-xs text-mute tabular-nums">{{ draftBody.length }}/2000</span>
      </div>
    </div>
  </article>
</template>
