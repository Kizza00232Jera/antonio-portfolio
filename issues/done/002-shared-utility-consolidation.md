---
title: Consolidate shared utility functions into src/utils/
type: AFK
priority: high
---

## Problem

There are three separate `formatDate` implementations scattered across blog post page, project detail page, and horizontal project card. `padIndex` and `getThumbnailUrl` helpers live inline inside Project Showcase. Tag filtering logic is duplicated across Blog and Projects listing. Scattered logic cannot be unit tested reliably and drifts out of sync.

## Desired behaviour

All shared pure functions live in `src/utils/` so each piece of logic exists in exactly one place. All call sites import from there.

## Acceptance criteria

- [ ] `src/utils/format.ts` exists and exports `formatDateFull`, `formatDateMedium`, `formatDateShort`, `formatDateCompact` (one function per format currently in use — match the exact output each callsite was producing)
- [ ] `src/utils/project.ts` exists and exports `padIndex` and `getThumbnailUrl`
- [ ] `src/utils/tags.ts` exists and exports a `filterByTag(items, activeTag)` function used by both Blog listing and Projects listing
- [ ] All original inline implementations are removed; all call sites import from `src/utils/`
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change how dates are displayed — match existing output exactly
- Do not add new formatting variants
- Do not add tests yet (tests are a separate issue)

## Notes

Search for `formatDate`, `padIndex`, `getThumbnailUrl` across `src/` to find all current implementations and call sites. The four date formats to cover: "15 January 2024", "15 Jan 2024", "January 2024", "JAN 2024".
