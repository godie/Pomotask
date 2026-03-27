import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { createRouter, RouterProvider, createRoute } from '@tanstack/react-router'
import { Route as RootRoute } from '@/routes/__root'
import { supabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

vi.mock("@tanstack/router-devtools", () => ({
  TanStackRouterDevtools: () => null,
}));

// Mock timerStore
vi.mock("@/stores/timerStore", () => ({
  useTimerStore: vi.fn(() => ({
    status: 'idle',
    secondsLeft: 1500,
    mode: 'focus',
  })),
}))

describe('Auth UI Integration', () => {
  const createMockRouter = () => {
    const rootRoute = RootRoute;
    const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: () => <div>Home</div>
    })
    const routeTree = rootRoute.addChildren([indexRoute]);
    return createRouter({ routeTree });
  };

  beforeEach(() => {
    vi.clearAllMocks()
    if (supabase) {
        // Default mock for onAuthStateChange
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } as unknown as Subscription }
        } as any)
    }
  })

  it('renders sign in button when user is not logged in', async () => {
    const router = createMockRouter()
    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeDefined()
    })
  })

  it('renders user avatar and sign out button when logged in', async () => {
    let authCallback: ((event: AuthChangeEvent, session: Session | null) => void | Promise<void>) | undefined

    if (supabase) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb: any) => {
            authCallback = cb
            return { data: { subscription: { id: '1', callback: cb, unsubscribe: vi.fn() } as unknown as Subscription } }
        })
    }

    const router = createMockRouter()
    render(<RouterProvider router={router} />)

    // Wait for effect
    await waitFor(() => {
        expect(authCallback).toBeDefined()
    })

    // Simulate login
    await act(async () => {
        if (authCallback) {
            void authCallback('SIGNED_IN', { user: { email: 'test@example.com' } } as any)
        }
    })

    await waitFor(() => {
      expect(screen.getByTitle(/sign out/i)).toBeDefined()
    })

    // Click sign out
    const signOutBtn = screen.getByTitle(/sign out/i)
    await act(async () => {
      signOutBtn.click()
    })

    if (supabase) {
        expect(supabase.auth.signOut).toHaveBeenCalled()
    }
  })
})
