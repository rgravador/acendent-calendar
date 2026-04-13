export const MS_PER_MINUTE = 60_000

export function diffMinutes(target: Date | string, now: Date = new Date()): number {
  const t = typeof target === 'string' ? new Date(target) : target
  return Math.round((t.getTime() - now.getTime()) / MS_PER_MINUTE)
}

export function isCurrent(startISO: string, endISO: string, now: Date = new Date()): boolean {
  const start = new Date(startISO).getTime()
  const end = new Date(endISO).getTime()
  const n = now.getTime()
  return n >= start && n < end
}

export function formatClock(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

/**
 * Editorial-style relative label: "in 12 min", "in 2 h 5 min", "now", "15 min ago".
 */
export function formatRelative(startISO: string, now: Date = new Date()): string {
  const mins = diffMinutes(startISO, now)
  if (mins === 0) return 'now'
  const abs = Math.abs(mins)
  const hours = Math.floor(abs / 60)
  const remainder = abs % 60
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours} h`)
  if (remainder > 0 || hours === 0) parts.push(`${remainder} min`)
  const joined = parts.join(' ')
  return mins > 0 ? `in ${joined}` : `${joined} ago`
}

export function formatDuration(startISO: string, endISO: string): string {
  const mins = Math.max(0, Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / MS_PER_MINUTE))
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}
