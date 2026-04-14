import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'dashboard_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

interface SessionPayload {
  sub: string // userId (Google sub)
  iat: number
  exp: number
}

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8')
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const base64 = (input + pad).replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(base64, 'base64')
}

function sign(payload: string, secret: string): string {
  return b64url(createHmac('sha256', secret).update(payload).digest())
}

export function issueSessionToken(userId: string, secret: string, now: number = Date.now()): string {
  const payload: SessionPayload = {
    sub: userId,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS,
  }
  const encoded = b64url(JSON.stringify(payload))
  const sig = sign(encoded, secret)
  return `${encoded}.${sig}`
}

/**
 * Verify the session token and return the userId if valid, or null otherwise.
 */
export function verifySessionToken(token: string | undefined, secret: string, now: number = Date.now()): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [encoded, sig] = parts
  if (!encoded || !sig) return null
  const expectedSig = sign(encoded, secret)
  const a = Buffer.from(sig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length) return null
  if (!timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(b64urlDecode(encoded).toString('utf8')) as SessionPayload
    if (typeof payload.exp !== 'number' || typeof payload.sub !== 'string') return null
    if (Math.floor(now / 1000) >= payload.exp) return null
    return payload.sub
  } catch {
    return null
  }
}

export function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  }
}
