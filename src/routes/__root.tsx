import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useTimerStore } from '@/stores/timerStore'
import { formatTime } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

function RootLayout() {
    const { status, secondsLeft, mode } = useTimerStore()
    const isRunning = status === 'running'
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
      if (!supabase) return
      void supabase.auth.getUser().then(({ data }) => { setUser(data.user); })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => { subscription.unsubscribe(); }
    }, [])

    const handleLogin = () => {
      if (!supabase) return
      alert("Auth is optional for MVP. Please set env vars to enable Supabase.")
    }

    return (
      <div className="min-h-screen bg-background text-foreground font-body">
        <nav className="border-b border-outline/20 p-4 flex justify-between items-center bg-surface sticky top-0 z-50">
          <div className="flex gap-6 items-center">
            <Link to="/" className="text-xl font-headline font-bold text-primary tracking-tight">
              POMOTASK
            </Link>
            <div className="hidden md:flex gap-4 font-label text-sm uppercase tracking-wider">
              <Link to="/" className="hover:text-primary transition-colors [&.active]:text-primary">Timer</Link>
              <Link to="/projects" className="hover:text-primary transition-colors [&.active]:text-primary">Projects</Link>
              <Link to="/tasks" className="hover:text-primary transition-colors [&.active]:text-primary">Tasks</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {isRunning && (
              <div className="hidden sm:flex items-center gap-3 bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,45,120,0.2)]">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-label text-xs font-bold text-primary">
                  {mode.toUpperCase()}: {formatTime(secondsLeft)}
                </span>
              </div>
            )}

            {supabase && (
              <button
                onClick={handleLogin}
                className="text-xs font-label uppercase tracking-widest text-on_surface_variant hover:text-secondary transition-colors"
              >
                {user ? 'Profile' : 'Sign In'}
              </button>
            )}
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Outlet />
        </main>
        <TanStackRouterDevtools />
      </div>
    )
}

export const Route = createRootRoute({
  component: RootLayout,
})
