---
title: Section Titles — reduce clamp minimum to prevent horizontal overflow on mobile
type: AFK
priority: normal
---

## Problem

The SectionTitle component uses a `clamp()` with a minimum of `5rem` for the display font. On narrow mobile viewports, words like "PROJECTS" and "JOURNEY" overflow the viewport horizontally, introducing unwanted horizontal scroll.

## Desired behaviour

The clamp minimum is reduced to `3rem` so section title text always fits within the viewport width on all screen sizes.

## Acceptance criteria

- [ ] The `clamp()` minimum for the SectionTitle display font is `3rem` (was `5rem`)
- [ ] On a 375px viewport, no section title causes horizontal overflow
- [ ] On desktop, section titles are visually unchanged (clamp max/preferred values unchanged)
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change the clamp preferred value or maximum
- Do not change anything else in SectionTitle

## Notes

SectionTitle component: `src/components/ui/SectionTitle.tsx`.
Look for a `clamp(5rem, ...)` expression on the font-size. Change `5rem` to `3rem`.
