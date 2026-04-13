import { MongoClient, type Db } from 'mongodb'

const DB_NAME = 'dashboard'

// Cache the client on globalThis so it survives Nitro hot-reloads in dev
// and warm Lambda containers in production.
declare global {
  // eslint-disable-next-line no-var
  var __mongoClient: MongoClient | undefined
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(uri: string): Promise<MongoClient> {
  if (!globalThis.__mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5_000,
    })
    globalThis.__mongoClient = client
    globalThis.__mongoClientPromise = client.connect()
  }
  return globalThis.__mongoClientPromise
}

export async function getDb(): Promise<Db> {
  const config = useRuntimeConfig()
  const uri = config.mongoUri
  if (!uri) {
    throw new Error('MONGO_URI is not configured')
  }
  const client = await getClientPromise(uri)
  return client.db(DB_NAME)
}

/**
 * Test-only helper: allow tests to inject a client directly.
 * Production code should never call this.
 */
export function __setMongoClientForTests(client: MongoClient | undefined) {
  globalThis.__mongoClient = client
  globalThis.__mongoClientPromise = client ? Promise.resolve(client) : undefined
}
