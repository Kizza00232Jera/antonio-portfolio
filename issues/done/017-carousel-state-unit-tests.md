---
title: Unit tests for useCarouselState hook
type: done
priority: normal
---

Completed. Co-located test file created at `src/components/ui/useCarouselState.test.ts`.

Tests cover all acceptance criteria:
- Default active panel index is 0
- `goToPanel(1)` sets active index to 1
- Active dot index matches active panel index (both use `activePanel`)
- Auto-advance fires after configured interval and increments panel index
- Auto-advance wraps from last panel (index 2) back to 0
- `goToPanel` resets the auto-advance timer (verified by calling at t=500ms and confirming next tick at t=1500ms)
- Unmounting clears the interval — advancing timers after unmount causes no errors or state updates

Uses `vi.useFakeTimers()` + `vi.advanceTimersByTime()` to control interval timing. Uses `renderHook` + `act` from `@testing-library/react`.
