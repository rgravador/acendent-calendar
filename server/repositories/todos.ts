import { randomUUID } from 'node:crypto'
import { getDb } from '~/server/utils/mongo'
import { PRIORITIES, type Priority, type Todo } from '~/server/types/models'

const COLLECTION = 'todos'
const MAX_TEXT_LENGTH = 500

const PRIORITY_RANK: Record<Priority, number> = { high: 0, med: 1, low: 2 }

export interface CreateTodoInput {
  text: string
  priority: Priority
  dueDate?: string
}

export interface UpdateTodoInput {
  text?: string
  priority?: Priority
  dueDate?: string | null
  done?: boolean
}

function assertValidText(text: string) {
  const trimmed = text.trim()
  if (trimmed.length === 0) throw new Error('Todo text cannot be empty')
  if (trimmed.length > MAX_TEXT_LENGTH) {
    throw new Error(`Todo text exceeds ${MAX_TEXT_LENGTH} characters`)
  }
}

function assertValidPriority(priority: string): asserts priority is Priority {
  if (!PRIORITIES.includes(priority as Priority)) {
    throw new Error(`Invalid priority: ${priority}`)
  }
}

function assertValidDueDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid dueDate: ${value}`)
}

export async function listTodos(): Promise<Todo[]> {
  const db = await getDb()
  const docs = await db.collection<Todo>(COLLECTION).find({}).toArray()
  return [...docs].sort(compareTodos)
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  assertValidText(input.text)
  assertValidPriority(input.priority)
  if (input.dueDate) assertValidDueDate(input.dueDate)
  const now = new Date().toISOString()
  const todo: Todo = {
    _id: randomUUID(),
    text: input.text.trim(),
    priority: input.priority,
    ...(input.dueDate ? { dueDate: input.dueDate } : {}),
    done: false,
    createdAt: now,
    updatedAt: now,
  }
  const db = await getDb()
  await db.collection<Todo>(COLLECTION).insertOne(todo)
  return todo
}

export async function updateTodo(id: string, patch: UpdateTodoInput): Promise<Todo | null> {
  const safePatch: Record<string, unknown> = {}
  const unset: Record<string, ''> = {}

  if (patch.text !== undefined) {
    assertValidText(patch.text)
    safePatch.text = patch.text.trim()
  }
  if (patch.priority !== undefined) {
    assertValidPriority(patch.priority)
    safePatch.priority = patch.priority
  }
  if (patch.done !== undefined) safePatch.done = Boolean(patch.done)
  if (patch.dueDate !== undefined) {
    if (patch.dueDate === null || patch.dueDate === '') {
      unset.dueDate = ''
    } else {
      assertValidDueDate(patch.dueDate)
      safePatch.dueDate = patch.dueDate
    }
  }
  safePatch.updatedAt = new Date().toISOString()

  const db = await getDb()
  const update: Record<string, unknown> = { $set: safePatch }
  if (Object.keys(unset).length > 0) update.$unset = unset
  const result = await db.collection<Todo>(COLLECTION).findOneAndUpdate(
    { _id: id },
    update,
    { returnDocument: 'after' },
  )
  return result ?? null
}

export async function deleteTodo(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection<Todo>(COLLECTION).deleteOne({ _id: id })
  return result.deletedCount === 1
}

export function compareTodos(a: Todo, b: Todo): number {
  // incomplete first
  if (a.done !== b.done) return a.done ? 1 : -1
  // then priority
  const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  if (pr !== 0) return pr
  // then due date asc, nulls last
  const hasA = Boolean(a.dueDate)
  const hasB = Boolean(b.dueDate)
  if (hasA && hasB) {
    return (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
  }
  if (hasA) return -1
  if (hasB) return 1
  // stable tiebreaker
  return a.createdAt.localeCompare(b.createdAt)
}
