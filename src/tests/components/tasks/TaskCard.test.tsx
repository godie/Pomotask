import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskCard } from '@/components/tasks/TaskCard'

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    name: 'Test Task',
    estimatedPomodoros: 3,
    realPomodoros: 1,
    status: 'pending' as const,
    projectId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  it('renders task name and pomodoro count', () => {
    render(<TaskCard task={mockTask} onDelete={vi.fn()} onToggleComplete={vi.fn()} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument()
  })
})
