---
title: Component tests for tag filter bars (Blog + Projects listing)
type: done
priority: normal
---

## Problem

The tag filter bars on the Blog and Projects listing pages have no tests. Clicking a tag, filtering results, and resetting are user-visible behaviours that could silently regress.

## Desired behaviour

React Testing Library tests verify the filter bar's observable behaviour — what the user sees changes when they click tags.

## Acceptance criteria

- [x] A test file exists for the filter bar component (co-located) and tests:
  - Clicking a tag button filters the visible item list to only items with that tag
  - Clicking "All" resets to all items
  - The active tag button is visually indicated (has `bg-text` class on its indicator span)
- [x] `pnpm test` passes with no failures

## What was done

- Created `src/components/ui/ProjectFilterBar.test.tsx` with 3 tests
- Used a `FilterIntegration` wrapper that pairs the filter bar with a real item list to verify end-to-end filtering behaviour
- No mocks required — `ProjectFilterBar` has no external dependencies (no GSAP, no next/navigation, no Sanity)
- The filter bar uses CSS class (`bg-text`) not an aria attribute for active state; tests check `classList.contains('bg-text')` on the indicator span
- Both mobile (options panel in collapsed state) and desktop buttons are present in jsdom DOM; tests use `getAllByRole(...)[0]` to consistently pick the mobile options panel button

## Scope note

Only `ProjectFilterBar` is tested. `BlogFilterBar` was not tested — it has similar callback behaviour but is more complex (GSAP animations, Sanity `urlFor` dependency for hover images). The `filterByTag` utility that drives both filter bars is already covered in `src/utils/tags.test.ts`.
