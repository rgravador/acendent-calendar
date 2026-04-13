import { randomUUID } from 'node:crypto'
import { getDb } from '~/server/utils/mongo'
import type { Note } from '~/server/types/models'

const COLLECTION = 'notes'
const MAX_BODY_LENGTH = 2000
const MAX_TITLE_LENGTH = 120

export interface CreateNoteInput {
  title?: string
  body: string
}

export interface UpdateNoteInput {
  title?: string | null
  body?: string
}

function assertValidBody(body: string) {
  const trimmed = body.trim()
  if (trimmed.length === 0) throw new Error('Note body cannot be empty')
  if (trimmed.length > MAX_BODY_LENGTH) {
    throw new Error(`Note body exceeds ${MAX_BODY_LENGTH} characters`)
  }
}

function assertValidTitle(title: string) {
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Error(`Note title exceeds ${MAX_TITLE_LENGTH} characters`)
  }
}

export async function listNotes(): Promise<Note[]> {
  const db = await getDb()
  const docs = await db.collection<Note>(COLLECTION).find({}).toArray()
  return [...docs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  assertValidBody(input.body)
  if (input.title) assertValidTitle(input.title)
  const now = new Date().toISOString()
  const note: Note = {
    _id: randomUUID(),
    ...(input.title ? { title: input.title } : {}),
    body: input.body.trim(),
    createdAt: now,
    updatedAt: now,
  }
  const db = await getDb()
  await db.collection<Note>(COLLECTION).insertOne(note)
  return note
}

export async function updateNote(id: string, patch: UpdateNoteInput): Promise<Note | null> {
  const safePatch: Record<string, unknown> = {}
  const unset: Record<string, ''> = {}

  if (patch.body !== undefined) {
    assertValidBody(patch.body)
    safePatch.body = patch.body.trim()
  }
  if (patch.title !== undefined) {
    if (patch.title === null || patch.title === '') {
      unset.title = ''
    } else {
      assertValidTitle(patch.title)
      safePatch.title = patch.title
    }
  }
  safePatch.updatedAt = new Date().toISOString()

  const db = await getDb()
  const update: Record<string, unknown> = { $set: safePatch }
  if (Object.keys(unset).length > 0) update.$unset = unset
  const result = await db.collection<Note>(COLLECTION).findOneAndUpdate(
    { _id: id },
    update,
    { returnDocument: 'after' },
  )
  return result ?? null
}

export async function deleteNote(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.collection<Note>(COLLECTION).deleteOne({ _id: id })
  return result.deletedCount === 1
}
