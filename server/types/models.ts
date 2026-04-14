export type Priority = 'high' | 'med' | 'low'

export const PRIORITIES: readonly Priority[] = ['high', 'med', 'low'] as const

export interface User {
  _id: string // Google sub (unique ID)
  email: string
  name: string
  picture?: string
  googleRefreshToken: string
  googleTokenUpdatedAt: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  _id: 'singleton'
  alarmOffsetMinutes: number
  googleRefreshToken?: string
  googleTokenUpdatedAt?: string
}

export interface Todo {
  _id: string
  text: string
  priority: Priority
  dueDate?: string // ISO date (YYYY-MM-DD) or full ISO
  done: boolean
  createdAt: string
  updatedAt: string
}

export interface Note {
  _id: string
  title?: string
  body: string
  createdAt: string
  updatedAt: string
}

export const DEFAULT_SETTINGS: Settings = {
  _id: 'singleton',
  alarmOffsetMinutes: 5,
}
