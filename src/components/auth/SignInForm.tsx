import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Mail, Loader2 } from 'lucide-react'

export function SignInForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Check your email for the magic link!' })
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      setMessage({ type: 'error', text: err.message || 'Failed to send magic link' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-2xl font-headline font-bold text-primary">Sign In</DialogTitle>
        <DialogDescription className="text-on_surface_variant">
          Enter your email to receive a magic link. No password required.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-6 py-4">
        <div className="space-y-2">
          <label htmlFor="email" className="font-label text-xs uppercase tracking-widest text-on_surface_variant">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on_surface_variant/50" size={18} />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value) }}
              required
              className="w-full bg-surface_variant border border-outline/10 rounded-xl py-3 pl-12 pr-4 text-on_surface placeholder:text-on_surface_variant/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {message && (
          <div
            data-testid="auth-message"
            className={`p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success'
              ? 'bg-secondary/10 text-secondary border border-secondary/20'
              : 'bg-error/10 text-error border border-error/20'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-on_primary py-4 rounded-xl font-headline font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,45,120,0.3)] hover:shadow-[0_0_25px_rgba(255,45,120,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <span>Send Magic Link</span>
          )}
        </button>
      </form>
    </DialogContent>
  )
}
