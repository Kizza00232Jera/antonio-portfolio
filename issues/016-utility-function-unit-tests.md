---
title: Unit tests for shared utility functions
type: AFK
priority: normal
---

## Problem

The shared utility functions in `src/utils/` (created in issue 002) have no tests. Pure functions are the easiest and highest-value things to test — they need no DOM, no mocks, no network.

## Desired behaviour

Each utility function in `src/utils/` has co-located unit tests that verify observable behaviour through the public interface.

## Acceptance criteria

- [ ] `src/utils/format.test.ts` exists and tests:
  - `formatDateFull`: valid ISO string → "15 January 2024"; empty/undefined → empty string
  - `formatDateMedium`: valid ISO string → "15 Jan 2024"
  - `formatDateShort`: valid ISO string → "January 2024"
  - `formatDateCompact`: valid ISO string → "JAN 2024"
- [ ] `src/utils/project.test.ts` exists and tests:
  - `padIndex`: 0 → "01"; 9 → "10"; 10 → "10" (double digits pass through)
  - `getThumbnailUrl`: Mux ID present → Mux URL; no Mux but coverImage → Sanity URL; neither → null
- [ ] `src/utils/tags.test.ts` exists and tests:
  - `filterByTag`: active tag → only matching items returned; null active tag → all items returned
- [ ] `pnpm test` passes with no failures

## Out of scope

- Do not test GSAP, CSS, Sanity queries, or Next.js routing
- Do not add tests for any component behaviour in this issue

## Notes

Depends on issue 002 (utility consolidation) and issue 015 (test infrastructure) being complete first.
Test files sit next to the file they test (co-located convention). Use Vitest's `describe`/`it`/`expect` — no `test()` wrapper needed.
