import { getDb } from '~/server/utils/mongo'
import { isMockMode } from '~/server/utils/mock-mode'
import type { User } from '~/server/types/models'

const COLLECTION = 'users'

export interface UpsertUserInput {
  googleId: string
  email: string
  name: string
  picture?: string
  googleRefreshToken: string
}

// In-memory store for mock mode
const mockUsers = new Map<string, User>()

export async function upsertUser(input: UpsertUserInput): Promise<User> {
  const now = new Date().toISOString()

  if (isMockMode()) {
    const existing = mockUsers.get(input.googleId)
    const user: User = {
      _id: input.googleId,
      email: input.email,
      name: input.name,
      ...(input.picture ? { picture: input.picture } : {}),
      googleRefreshToken: input.googleRefreshToken,
      googleTokenUpdatedAt: now,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    mockUsers.set(input.googleId, user)
    return user
  }

  const db = await getDb()
  const result = await db.collection<User>(COLLECTION).findOneAndUpdate(
    { _id: input.googleId },
    {
      $set: {
        email: input.email,
        name: input.name,
        ...(input.picture ? { picture: input.picture } : {}),
        googleRefreshToken: input.googleRefreshToken,
        googleTokenUpdatedAt: now,
        updatedAt: now,
      },
      $setOnInsert: {
        _id: input.googleId,
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' },
  )
  return result!
}

export async function getUserById(googleId: string): Promise<User | null> {
  if (isMockMode()) return mockUsers.get(googleId) ?? null
  const db = await getDb()
  return db.collection<User>(COLLECTION).findOne({ _id: googleId })
}
