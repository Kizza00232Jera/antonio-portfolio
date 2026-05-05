---
title: Component tests for tag filter bars (Blog + Projects listing)
type: AFK
priority: normal
---

## Problem

The tag filter bars on the Blog and Projects listing pages have no tests. Clicking a tag, filtering results, and resetting are user-visible behaviours that could silently regress.

## Desired behaviour

React Testing Library tests verify the filter bar's observable behaviour — what the user sees changes when they click tags.

## Acceptance criteria

- [ ] A test file exists for the filter bar component (co-located) and tests:
  - Clicking a tag button filters the visible item list to only items with that tag
  - Clicking the active tag again (or clicking "All") resets to all items
  - The active tag button is visually indicated (has an active class or aria attribute)
- [ ] `pnpm test` passes with no failures

## Out of scope

- Do not test Sanity data fetching
- Do not test CSS styling directly — use aria attributes or class presence to verify active state

## Notes

Depends on issue 015 (test infrastructure) being complete first. Also depends on issue 002 if the `filterByTag` utility is used in the component.
Find the filter bar component by searching for tag filtering logic in `src/app/(site)/projects/` and `src/app/(site)/blog/`.
