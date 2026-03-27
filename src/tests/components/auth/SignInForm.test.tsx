import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SignInForm } from '@/components/auth/SignInForm'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
    },
  },
}))

// Mock Dialog components
vi.mock('@/components/ui/Dialog', () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: any) => <div role="dialog" data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
}))

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sign in form', () => {
    render(<SignInForm />)
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send Magic Link/i })).toBeInTheDocument()
  })

  it('submits email and shows success message', async () => {
    (supabase?.auth.signInWithOtp as any).mockResolvedValue({ data: {}, error: null })

    render(<SignInForm />)
    const input = screen.getByLabelText(/Email Address/i)
    fireEvent.change(input, { target: { value: 'test@example.com' } })

    const button = screen.getByRole('button', { name: /Send Magic Link/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('auth-message')).toHaveTextContent(/Check your email/i)
    }, { timeout: 3000 })

    expect(supabase?.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        emailRedirectTo: expect.any(String),
      },
    })
  })

  it('shows error message on failure', async () => {
    (supabase?.auth.signInWithOtp as any).mockResolvedValue({
      data: null,
      error: { message: 'Invalid email' }
    })

    render(<SignInForm />)
    const input = screen.getByLabelText(/Email Address/i)
    // Use a valid email format to satisfy HTML5 validation, but mock Supabase to return error
    fireEvent.change(input, { target: { value: 'error@example.com' } })

    fireEvent.click(screen.getByRole('button', { name: /Send Magic Link/i }))

    await waitFor(() => {
      expect(screen.getByTestId('auth-message')).toHaveTextContent(/Invalid email/i)
    }, { timeout: 3000 })
  })
})
