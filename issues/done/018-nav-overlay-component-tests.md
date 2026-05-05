---
title: Component tests for NavOverlay (menu button + overlay behaviour)
type: done
priority: normal
---

## Problem

The NavOverlay and MenuButton interaction (open/close, keyboard, route change) has no tests. These are user-facing interactions where a regression would directly break mobile navigation.

## Desired behaviour

React Testing Library tests verify the NavOverlay's observable behaviour through its public interface (rendered output + user events).

## Acceptance criteria

- [x] A test file exists (co-located with NavOverlay) and tests:
  - Clicking the menu button renders the overlay visible
  - Pressing Escape closes the overlay
  - All four nav links are present in the overlay: Home, Projects, Blog, Contact
- [x] `pnpm test` passes with no failures

## What was done

- Created `src/components/layout/NavOverlay.test.tsx` with 3 tests:
  1. Clicking the menu button sets `aria-expanded="true"` on the button
  2. Pressing Escape after opening resets `aria-expanded` to `"false"`
  3. All four nav links (Home, Projects, Blog, Contact) are present in the DOM
- Mocked `next/navigation` (usePathname), `gsap`, `next/image`, `next/link`
- Mocked `window.matchMedia` to satisfy NavOverlay's `prefers-reduced-motion` check
- Used full `MenuProvider` + `MenuButton` + `NavOverlay` integration render (no state mocking)
- GSAP visibility toggling is not tested (GSAP does not run in jsdom); aria-expanded is used instead as the observable state indicator
