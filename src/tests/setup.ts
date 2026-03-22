import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock IndexedDB (Dexie doesn't work in jsdom without this)
vi.mock('@/db/schema', () => ({
  db: {
    projects: {
      toArray: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue(undefined),
      add: vi.fn().mockResolvedValue('mock-id'),
      put: vi.fn().mockResolvedValue('mock-id'),
      delete: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
    },
    tasks: {
      toArray: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue(undefined),
      add: vi.fn().mockResolvedValue('mock-id'),
      put: vi.fn().mockResolvedValue('mock-id'),
      delete: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
    },
    sessions: {
      toArray: vi.fn().mockResolvedValue([]),
      add: vi.fn().mockResolvedValue('mock-id'),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
    },
  },
}))

// Mock Supabase (optional — won't be initialized in tests)
vi.mock('@/lib/supabase', () => ({
  supabase: null,
  isSupabaseEnabled: false,
}))

// Mock Web Audio API
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0 },
    type: 'sine',
  }),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: { value: 1, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  }),
  destination: {},
  currentTime: 0,
}))

// Mock Notification API
global.Notification = {
  permission: 'granted',
  requestPermission: vi.fn().mockResolvedValue('granted'),
} as unknown as typeof Notification
