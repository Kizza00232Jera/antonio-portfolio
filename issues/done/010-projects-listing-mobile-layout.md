---
title: Projects listing — vertical single-column layout on mobile
type: AFK
priority: normal
---

## Problem

The Projects listing page uses a horizontal scroll of portrait cards on all viewports. On mobile (< 768px), this forces the user to swipe horizontally through portrait-orientation cards, which is a poor experience on a narrow screen.

## Desired behaviour

On mobile (< 768px), the Projects listing renders as a vertical single-column list of cards. The horizontal scroll layout remains for desktop and tablet (>= 768px).

## Acceptance criteria

- [ ] On viewports < 768px, projects are displayed in a vertical single-column layout
- [ ] On viewports >= 768px, the horizontal scroll layout is unchanged
- [ ] Project cards in the mobile layout show image, title, tagline, and tags
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change the desktop horizontal scroll layout
- Do not redesign the card appearance beyond what is needed for vertical stacking

## Notes

Projects listing: `src/app/(site)/projects/page.tsx` and related components.
The mobile card variant may already exist as `MobileProjectCard` — check if it can be reused for the vertical list.
