---
title: Latest Posts — remove max-h-screen overflow-hidden on mobile
type: AFK
priority: normal
---

## Problem

The Latest Posts section has `max-h-screen overflow-hidden` applied on mobile, which clips post previews. Visitors on mobile cannot see all available posts.

## Desired behaviour

On mobile, the Latest Posts section renders as a normal scrollable block with no height cap. All post previews are visible. Sticky/desktop behaviour is unchanged.

## Acceptance criteria

- [ ] On mobile (< 768px), no `max-h-screen` or `overflow-hidden` is applied to the Latest Posts section container
- [ ] All blog post previews are visible on mobile without scrolling a clipped inner container
- [ ] On desktop, the section layout is unchanged
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change the desktop sticky layout
- Do not redesign the mobile post list appearance

## Notes

Latest Posts section: `src/components/sections/LatestPostsSection.tsx` (or similar).
Look for Tailwind classes `max-h-screen` and `overflow-hidden` on the section wrapper or list container. Remove them or scope them to desktop-only with `md:` prefix.
