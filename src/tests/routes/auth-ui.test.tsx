import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { Route as RootRoute } from '@/routes/__root'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

describe('User Authentication UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mocks
    ;(supabase?.auth.getUser as any).mockResolvedValue({ data: { user: null } })
    ;(supabase?.auth.onAuthStateChange as any).mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    ;(supabase?.auth.signOut as any).mockResolvedValue({ error: null })
  })

  it('renders Sign In button when user is not logged in', async () => {
    const router = createRouter({ routeTree: RootRoute })
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })
  })

  it('renders user icon and Sign Out button when user is logged in', async () => {
    (supabase?.auth.getUser as any).mockResolvedValue({ data: { user: { id: '123', email: 'test@test.com' } } })

    let authCallback: any
    // @ts-expect-error - mock implementation
    vi.mocked(supabase?.auth.onAuthStateChange).mockImplementation((cb: any) => {
        authCallback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
    })

    const router = createRouter({ routeTree: RootRoute })
    render(<RouterProvider router={router} />)

    await waitFor(() => {
        expect(authCallback).toBeDefined()
    })

    authCallback('SIGNED_IN', { user: { id: '123', email: 'test@test.com' } })

    await waitFor(() => {
      expect(screen.getByTitle('Sign Out')).toBeInTheDocument()
    })
  })

  it('calls signOut when Sign Out button is clicked', async () => {
    (supabase?.auth.getUser as any).mockResolvedValue({ data: { user: { id: '123' } } })
    let authCallback: any
    // @ts-expect-error - mock implementation
    vi.mocked(supabase?.auth.onAuthStateChange).mockImplementation((cb: any) => {
        authCallback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
    })

    const router = createRouter({ routeTree: RootRoute })
    render(<RouterProvider router={router} />)

    await waitFor(() => {
        expect(authCallback).toBeDefined()
    })

    authCallback('SIGNED_IN', { user: { id: '123' } })

    const signOutBtn = await screen.findByTitle('Sign Out')
    fireEvent.click(signOutBtn)

    expect(supabase?.auth.signOut).toHaveBeenCalled()
  })
})
