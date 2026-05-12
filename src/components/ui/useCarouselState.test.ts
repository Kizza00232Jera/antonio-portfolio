import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCarouselState } from './useCarouselState'

describe('useCarouselState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('defaults active panel index to 0', () => {
    const { result } = renderHook(() => useCarouselState(3))
    expect(result.current.activePanel).toBe(0)
  })

  it('goToPanel sets the active index', () => {
    const { result } = renderHook(() => useCarouselState(3))
    act(() => {
      result.current.goToPanel(1)
    })
    expect(result.current.activePanel).toBe(1)
  })

  it('active dot index matches active panel index', () => {
    const { result } = renderHook(() => useCarouselState(3))
    act(() => {
      result.current.goToPanel(2)
    })
    expect(result.current.activePanel).toBe(2)
  })

  it('auto-advances after the configured interval', () => {
    const { result } = renderHook(() => useCarouselState(3, 1000))
    expect(result.current.activePanel).toBe(0)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.activePanel).toBe(1)
  })

  it('auto-advance wraps from last panel back to 0', () => {
    const { result } = renderHook(() => useCarouselState(3, 1000))
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.activePanel).toBe(0)
  })

  it('goToPanel resets the auto-advance timer', () => {
    const { result } = renderHook(() => useCarouselState(3, 1000))
    act(() => {
      vi.advanceTimersByTime(500)
      result.current.goToPanel(2)
    })
    act(() => {
      vi.advanceTimersByTime(999)
    })
    expect(result.current.activePanel).toBe(2)
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.activePanel).toBe(0)
  })

  it('unmounting does not cause further state updates', () => {
    const { unmount } = renderHook(() => useCarouselState(3, 1000))
    unmount()
    act(() => {
      vi.advanceTimersByTime(2000)
    })
  })
})
