import { getDb } from '~/server/utils/mongo'
import { DEFAULT_SETTINGS, type Settings } from '~/server/types/models'

const COLLECTION = 'settings'
const SINGLETON_ID = 'singleton' as const

export async function getSettings(): Promise<Settings> {
  const db = await getDb()
  const doc = await db.collection<Settings>(COLLECTION).findOne({ _id: SINGLETON_ID })
  if (!doc) return { ...DEFAULT_SETTINGS }
  // Guarantee defaults for any new fields added later.
  return { ...DEFAULT_SETTINGS, ...doc }
}

export async function updateSettings(patch: Partial<Omit<Settings, '_id'>>): Promise<Settings> {
  const db = await getDb()
  const safePatch: Partial<Omit<Settings, '_id'>> = {}
  if (typeof patch.alarmOffsetMinutes === 'number' && Number.isFinite(patch.alarmOffsetMinutes)) {
    safePatch.alarmOffsetMinutes = Math.max(0, Math.floor(patch.alarmOffsetMinutes))
  }
  if (typeof patch.googleRefreshToken === 'string') {
    safePatch.googleRefreshToken = patch.googleRefreshToken
    safePatch.googleTokenUpdatedAt = new Date().toISOString()
  }
  await db.collection<Settings>(COLLECTION).updateOne(
    { _id: SINGLETON_ID },
    { $set: safePatch, $setOnInsert: { _id: SINGLETON_ID, alarmOffsetMinutes: DEFAULT_SETTINGS.alarmOffsetMinutes } },
    { upsert: true },
  )
  return getSettings()
}
