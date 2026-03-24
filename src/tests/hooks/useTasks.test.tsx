import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTasksByProject, useCreateTask } from '@/hooks/useTasks'
import * as dbTasks from '@/db/tasks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

vi.mock('@/db/tasks')

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useTasks hook', () => {
  beforeEach(() => {
    queryClient.clear()
    vi.clearAllMocks()
  })

  it('fetches tasks by project', async () => {
    const mockTasks = [{ id: '1', name: 'Task' }]
    vi.mocked(dbTasks.getTasksByProject).mockResolvedValue(mockTasks as any)
    const { result } = renderHook(() => useTasksByProject('p1'), { wrapper })
    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })
    expect(result.current.data).toEqual(mockTasks)
  })

  it('creates a task and invalidates cache', async () => {
    const newTask = { id: '2', name: 'New Task' }
    vi.mocked(dbTasks.createTask).mockResolvedValue(newTask as any)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateTask(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ name: 'New Task', projectId: 'p1', estimatedPomodoros: 3, realPomodoros: 0, status: 'pending' })
    })
    expect(dbTasks.createTask).toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalled()
  })
})
