---
title: Journey description — fluid font size with clamp()
type: AFK
priority: low
---

## Problem

The Journey section description text (`j-desc`) uses a fixed `font-size: 1rem`. On large screens this looks small relative to the surrounding layout; on small screens it can feel cramped.

## Desired behaviour

The Journey description uses a fluid `clamp()` font size that scales smoothly with viewport width, staying readable on all screen sizes.

## Acceptance criteria

- [ ] `.j-desc` in `src/app/globals.css` uses `font-size: clamp(0.875rem, 2vw, 1.125rem)` (or a similarly reasoned range — adjust if it looks wrong)
- [ ] The text is visually balanced on both mobile and desktop
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change any other Journey text styles
- Do not change the Journey layout

## Notes

Find `.j-desc` in `src/app/globals.css`. Change the `font-size` from a fixed value to `clamp(0.875rem, 2vw, 1.125rem)`. Adjust the clamp values if the visual result is off.
