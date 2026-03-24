import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProjects } from '@/hooks/useProjects'
import * as dbProjects from '@/db/projects'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

vi.mock('@/db/projects')

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useProjects hook', () => {
  it('fetches all projects', async () => {
    const mockProjects = [{ id: '1', name: 'Test' }]
    vi.mocked(dbProjects.getAllProjects).mockResolvedValue(mockProjects as any)
    const { result } = renderHook(() => useProjects(), { wrapper })
    await waitFor(() => { expect(result.current.isSuccess).toBe(true); })
    expect(result.current.data).toEqual(mockProjects)
  })
})
