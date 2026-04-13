<script setup lang="ts">
import { ref } from 'vue'

const { notes, loading, add, update, remove } = useNotes()

const newBody = ref('')
const newTitle = ref('')
const adding = ref(false)

async function onCreate() {
  const body = newBody.value.trim()
  if (!body) return
  adding.value = true
  try {
    await add({ body, ...(newTitle.value.trim() ? { title: newTitle.value.trim() } : {}) })
    newTitle.value = ''
    newBody.value = ''
  } finally {
    adding.value = false
  }
}

async function onSave(id: string, patch: { title?: string | null; body?: string }) {
  try { await update(id, patch) } catch { /* no-op */ }
}

async function onRemove(id: string) {
  try { await remove(id) } catch { /* rolled back */ }
}
</script>

<template>
  <div>
    <div class="kicker mb-2">Section III</div>
    <h2 class="font-display text-3xl mb-5">Marginalia</h2>

    <form class="border border-rule p-4 mb-6" @submit.prevent="onCreate">
      <input
        v-model="newTitle"
        placeholder="Title (optional)"
        maxlength="120"
        class="w-full bg-transparent border-b border-rule py-1 font-display text-lg focus:outline-none focus:border-accent"
      >
      <textarea
        v-model="newBody"
        rows="3"
        maxlength="2000"
        placeholder="A thought, a quote, a reminder…"
        class="mt-3 w-full bg-transparent resize-none focus:outline-none leading-snug"
      />
      <div class="flex justify-between items-center mt-2">
        <span class="text-xs text-mute tabular-nums">{{ newBody.length }}/2000</span>
        <button
          type="submit"
          :disabled="adding || !newBody.trim()"
          class="kicker border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition disabled:opacity-40"
        >
          Add note
        </button>
      </div>
    </form>

    <div v-if="loading" class="text-mute italic">Loading…</div>

    <div v-else-if="notes.length === 0" class="text-mute italic py-8">
      The page awaits.
    </div>

    <div v-else class="columns-1 md:columns-2 gap-5">
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
