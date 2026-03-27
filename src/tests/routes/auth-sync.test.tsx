import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { Route as RootRoute } from '@/routes/__root'
import { supabase } from '@/lib/supabase'
import { syncToSupabase } from '@/db/sync'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn(),
    },
  },
}))

vi.mock('@/db/sync', () => ({
  syncToSupabase: vi.fn(),
}))

describe('Auth Sync Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('triggers syncToSupabase on SIGNED_IN event', async () => {
    let authCallback: any
    // @ts-expect-error - mock implementation
    vi.mocked(supabase?.auth.onAuthStateChange).mockImplementation((cb: any) => {
      authCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })

    const router = createRouter({ routeTree: RootRoute })

    render(<RouterProvider router={router} />)

    // Wait for effect to run and set authCallback
    await waitFor(() => {
        expect(authCallback).toBeDefined()
    })

    // Simulate SIGNED_IN event
    authCallback('SIGNED_IN', { user: { id: 'test-user' } })

    await waitFor(() => {
      expect(syncToSupabase).toHaveBeenCalled()
    })
  })
})
