import { ref, onMounted } from 'vue'
import type { Todo, Priority } from '~/server/types/models'

export function useTodos() {
  const todos = ref<Todo[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function refresh() {
    try {
      const res = await $fetch<{ todos: Todo[] }>('/api/todos')
      todos.value = res.todos
      error.value = null
    } catch (e: unknown) {
      error.value = (e as Error).message ?? 'Failed to load todos'
    } finally {
      loading.value = false
    }
  }

  async function add(input: { text: string; priority: Priority; dueDate?: string }) {
    const res = await $fetch<{ todo: Todo }>('/api/todos', { method: 'POST', body: input })
    todos.value = [...todos.value, res.todo]
    await refresh()
  }

  async function update(id: string, patch: Partial<Pick<Todo, 'text' | 'priority' | 'done'>> & { dueDate?: string | null }) {
    // optimistic
    const prev = todos.value
    todos.value = todos.value.map((t) => (t._id === id ? { ...t, ...patch, dueDate: patch.dueDate ?? t.dueDate } : t))
    try {
      await $fetch(`/api/todos/${id}`, { method: 'PATCH', body: patch })
      await refresh()
    } catch (e) {
      todos.value = prev
      throw e
    }
  }

  async function remove(id: string) {
    const prev = todos.value
    todos.value = todos.value.filter((t) => t._id !== id)
    try {
      await $fetch(`/api/todos/${id}`, { method: 'DELETE' })
    } catch (e) {
      todos.value = prev
      throw e
    }
  }

  onMounted(refresh)

  return { todos, loading, error, refresh, add, update, remove }
}
