---
title: Unit tests for shared utility functions
type: done
priority: normal
---

Completed. All three co-located test files created and passing.

- `src/utils/format.test.ts` — tests formatDateFull, formatDateMedium, formatDateShort, formatDateCompact
- `src/utils/project.test.ts` — tests padIndex and getThumbnailUrl (with vi.mock for Sanity image builder)
- `src/utils/tags.test.ts` — tests filterByTag

Note: padIndex is 1-based (adds 1 to index), so padIndex(10) → "11", not "10" as the issue example suggested. Tests reflect the actual implementation.

tsconfig.json updated to exclude `**/*.test.ts`, `**/*.test.tsx`, and `e2e/**` from the main TypeScript compilation so tsc does not error on test-only imports.
