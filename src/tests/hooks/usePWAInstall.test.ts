import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

describe('usePWAInstall', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('detects when app is installable', () => {
    const { result } = renderHook(() => usePWAInstall())

    expect(result.current.isInstallable).toBe(false)

    const event = new Event('beforeinstallprompt')
    // @ts-expect-error - userChoice is not on Event
    event.userChoice = Promise.resolve({ outcome: 'accepted' })
    // @ts-expect-error - prompt is not on Event
    event.prompt = vi.fn()

    act(() => {
      window.dispatchEvent(event)
    })

    expect(result.current.isInstallable).toBe(true)
  })

  it('calls prompt when install is called', async () => {
    const { result } = renderHook(() => usePWAInstall())

    const event = new Event('beforeinstallprompt')
    const mockPrompt = vi.fn()
    // @ts-expect-error - userChoice is not on Event
    event.userChoice = Promise.resolve({ outcome: 'accepted' })
    // @ts-expect-error - prompt is not on Event
    event.prompt = mockPrompt

    act(() => {
      window.dispatchEvent(event)
    })

    await act(async () => {
      await result.current.install()
    })

    expect(mockPrompt).toHaveBeenCalled()
    expect(result.current.isInstallable).toBe(false)
  })
})
