---
title: Unit tests for useCarouselState hook
type: AFK
priority: normal
---

## Problem

The `useCarouselState` hook (created in issue 004) contains a pure state machine with auto-advance logic. This is the best TDD target in the codebase — it has no DOM or animation dependencies and can be tested in isolation.

## Desired behaviour

`useCarouselState` has co-located unit tests that verify all state transitions and timer behaviour.

## Acceptance criteria

- [ ] `src/components/ui/useCarouselState.test.ts` (or wherever the hook lives) exists and tests:
  - Default active panel index is 0
  - `goToPanel(1)` sets active index to 1
  - Active dot index matches active panel index
  - Auto-advance fires after the configured interval and increments the panel index
  - Auto-advance wraps from last panel back to 0
  - `goToPanel` resets the auto-advance timer
  - Unmounting the component does not cause further state updates (no memory leak / no act() warning)
- [ ] `pnpm test` passes with no failures

## Out of scope

- Do not test GSAP or CSS transitions
- Do not test DOM rendering

## Notes

Depends on issue 004 (carousel implementation) and issue 015 (test infrastructure) being complete first.
Use Vitest's `vi.useFakeTimers()` to control the auto-advance interval in tests. Use `renderHook` from `@testing-library/react`.
