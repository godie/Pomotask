import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectStats } from '@/components/projects/ProjectStats'

describe('ProjectStats', () => {
  it('renders estimated and real pomodoro counts', () => {
    render(<ProjectStats estimated={10} real={5} />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
