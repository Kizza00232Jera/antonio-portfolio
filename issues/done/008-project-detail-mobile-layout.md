---
title: Project Detail — single-column metadata layout on mobile
type: AFK
priority: normal
---

## Problem

The Project Detail hero uses a 2-column metadata grid on all viewports. On mobile, this is cramped and hard to read — metadata labels and values are squeezed side-by-side in a narrow column.

## Desired behaviour

On mobile (< 768px), the metadata renders as a single-column stacked list. Each metadata item (label + value) occupies its own full-width row. Desktop layout is unchanged.

## Acceptance criteria

- [ ] On viewports < 768px, project detail metadata is displayed in a single column (full-width rows)
- [ ] Order on mobile: close button, GitHub, Date, Focus Areas, Live Website, then title and tagline
- [ ] On viewports >= 768px, the layout is unchanged
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change the desktop layout
- Do not change the metadata fields shown

## Notes

Project Detail page/component: `src/app/(site)/projects/[slug]/` or `src/components/sections/ProjectDetailHero.tsx` (check exact path).
The fix is likely changing a `grid-cols-2` to `grid-cols-1 md:grid-cols-2`, or similar responsive grid class.
