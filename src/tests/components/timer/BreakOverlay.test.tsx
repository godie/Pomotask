import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BreakOverlay } from '@/components/timer/BreakOverlay'

describe('BreakOverlay', () => {
  it('shows short break label when mode is short_break', () => {
    render(<BreakOverlay mode="short_break" onSkip={vi.fn()} />)
    expect(screen.getByText(/short break/i)).toBeInTheDocument()
  })
})
