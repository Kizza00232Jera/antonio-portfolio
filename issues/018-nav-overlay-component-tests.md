---
title: Component tests for NavOverlay (menu button + overlay behaviour)
type: AFK
priority: normal
---

## Problem

The NavOverlay and MenuButton interaction (open/close, keyboard, route change) has no tests. These are user-facing interactions where a regression would directly break mobile navigation.

## Desired behaviour

React Testing Library tests verify the NavOverlay's observable behaviour through its public interface (rendered output + user events).

## Acceptance criteria

- [ ] A test file exists (co-located with NavOverlay or in `src/components/ui/__tests__/`) and tests:
  - Clicking the menu button renders the overlay visible
  - Pressing Escape closes the overlay
  - All four nav links are present in the overlay: Home, Projects, Blog, Contact
- [ ] `pnpm test` passes with no failures

## Out of scope

- Do not test CSS animations or transition timing
- Do not test route changes via real router navigation (mock the router)
- "Navigating closes the overlay" test is optional — skip if it requires complex router mocking

## Notes

Depends on issue 003 (Contact added to NavOverlay) and issue 015 (test infrastructure) being complete first.
Use `@testing-library/user-event` for keyboard events. Mock `next/navigation` if the overlay reads the current route.
