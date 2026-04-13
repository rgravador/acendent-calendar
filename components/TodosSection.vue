<script setup lang="ts">
import { computed, ref } from 'vue'

const { todos, loading, add, update, remove } = useTodos()

const showDone = ref(false)

const active = computed(() => todos.value.filter((t) => !t.done))
const done = computed(() => todos.value.filter((t) => t.done))

async function onAdd(input: { text: string; priority: 'high' | 'med' | 'low'; dueDate?: string }) {
  try {
    await add(input)
  } catch {
    // swallow; the server rejected a bad payload — error UX is minimal here
  }
}

async function onToggle(id: string, done: boolean) {
  try { await update(id, { done }) } catch { /* rolled back inside composable */ }
}

async function onRemove(id: string) {
  try { await remove(id) } catch { /* rolled back inside composable */ }
}
</script>

<template>
  <div>
    <div class="kicker mb-2">Section II</div>
    <h2 class="font-display text-3xl mb-5">Tasks &amp; Obligations</h2>

    <TodoAddForm @add="onAdd" />

    <div v-if="loading" class="text-mute italic">Loading…</div>

    <ul v-else-if="active.length === 0 && done.length === 0" class="text-mute italic py-8">
      Nothing to do. Go outside.
    </ul>

    <ul v-else class="border-t border-rule">
      <TodoItem
        v-for="t in active"
        :key="t._id"
        :todo="t"
        @toggle="onToggle"
        @remove="onRemove"
      />
    </ul>

    <div v-if="done.length > 0" class="mt-6">
      <button class="kicker text-mute hover:text-accent" @click="showDone = !showDone">
        {{ showDone ? 'Hide' : 'Show' }} Done &middot; {{ done.length }}
      </button>
      <ul v-if="showDone" class="mt-3 border-t border-rule opacity-70">
        <TodoItem
          v-for="t in done"
          :key="t._id"
          :todo="t"
          @toggle="onToggle"
          @remove="onRemove"
        />
      </ul>
    </div>
  </div>
</template>
