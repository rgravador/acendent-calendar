import { ref, onMounted } from 'vue'
import type { Note } from '~/server/types/models'

export function useNotes() {
  const notes = ref<Note[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function refresh() {
    try {
      const res = await $fetch<{ notes: Note[] }>('/api/notes')
      notes.value = res.notes
      error.value = null
    } catch (e: unknown) {
      error.value = (e as Error).message ?? 'Failed to load notes'
    } finally {
      loading.value = false
    }
  }

  async function add(input: { title?: string; body: string }) {
    const res = await $fetch<{ note: Note }>('/api/notes', { method: 'POST', body: input })
    notes.value = [res.note, ...notes.value]
  }

  async function update(id: string, patch: { title?: string | null; body?: string }) {
    const res = await $fetch<{ note: Note }>(`/api/notes/${id}`, { method: 'PATCH', body: patch })
    notes.value = [res.note, ...notes.value.filter((n) => n._id !== id)]
  }

  async function remove(id: string) {
    const prev = notes.value
    notes.value = notes.value.filter((n) => n._id !== id)
    try {
      await $fetch(`/api/notes/${id}`, { method: 'DELETE' })
    } catch (e) {
      notes.value = prev
      throw e
    }
  }

  onMounted(refresh)

  return { notes, loading, error, refresh, add, update, remove }
}
