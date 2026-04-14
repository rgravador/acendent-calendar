<script setup lang="ts">
import { ref } from 'vue'

const { notes, loading, add, update, remove } = useNotes()

const newBody = ref('')
const newTitle = ref('')
const expanded = ref(false)
const adding = ref(false)

async function onCreate() {
  const body = newBody.value.trim()
  if (!body) return
  adding.value = true
  try {
    await add({ body, ...(newTitle.value.trim() ? { title: newTitle.value.trim() } : {}) })
    newTitle.value = ''
    newBody.value = ''
    expanded.value = false
  } finally {
    adding.value = false
  }
}

async function onSave(id: string, patch: { title?: string | null; body?: string }) {
  try { await update(id, patch) } catch { /* noop */ }
}
async function onRemove(id: string) {
  try { await remove(id) } catch { /* rolled back */ }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="kicker text-accent">03</span>
        <h2 class="text-sm text-ink font-medium tracking-wide">Notes</h2>
      </div>
      <span v-if="notes.length > 0" class="tag num">
        {{ String(notes.length).padStart(2, '0') }}
      </span>
    </div>

    <form class="rounded-md bg-surface-soft p-3 mb-4 border border-rule" @submit.prevent="onCreate">
      <input
        v-if="expanded"
        v-model="newTitle"
        placeholder="Title (optional)"
        maxlength="120"
        class="field mb-2 text-sm"
      >
      <textarea
        v-model="newBody"
        :rows="expanded ? 3 : 2"
        maxlength="2000"
        placeholder="A thought, a quote, a reminder…"
        class="field resize-none text-sm font-mono"
        @focus="expanded = true"
      />
      <div v-if="expanded" class="flex items-center justify-between mt-2">
        <span class="text-[0.68rem] text-mute num">{{ newBody.length }}/2000</span>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn btn-ghost text-xs"
            @click="expanded = false; newTitle = ''; newBody = ''"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="adding || !newBody.trim()"
            class="btn btn-accent text-xs"
          >
            Save
          </button>
        </div>
      </div>
    </form>

    <div v-if="loading" class="text-mute text-xs font-mono py-4">Loading…</div>

    <div v-else-if="notes.length === 0" class="rounded-md bg-surface-soft border border-rule p-6 text-center">
      <p class="text-sm text-ink">No notes yet</p>
      <p class="text-xs text-mute mt-1">Start typing above.</p>
    </div>

    <div v-else class="space-y-2.5">
      <NoteCard
        v-for="n in notes"
        :key="n._id"
        :note="n"
        @save="onSave"
        @remove="onRemove"
      />
    </div>
  </div>
</template>
