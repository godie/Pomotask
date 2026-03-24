import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TimerRing } from '@/components/timer/TimerRing'

describe('TimerRing', () => {
  it('renders without crashing', () => {
    const { container } = render(<TimerRing progress={0.5} mode="focus" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
