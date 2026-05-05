---
title: Project Showcase — extend mobile card layout to tablet (< 1024px)
type: AFK
priority: normal
---

## Problem

The Project Showcase section switches from the sticky split-panel layout to mobile cards only at < 768px. On tablet viewports (768px–1023px), the sticky split-panel renders but is cramped and hard to use. Tablet visitors should see the mobile card layout.

## Desired behaviour

The mobile card layout (stacked project cards) renders for all viewports below 1024px. The sticky split-panel only activates at >= 1024px.

## Acceptance criteria

- [ ] At viewports 768px–1023px, the Project Showcase renders stacked mobile cards (not the sticky split-panel)
- [ ] At viewports >= 1024px, the sticky split-panel layout is unchanged
- [ ] At viewports < 768px, behaviour is unchanged (already shows mobile cards)
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change the mobile card design
- Do not change the desktop split-panel design
- Do not touch any other section

## Notes

Project Showcase section: `src/components/sections/ProjectShowcaseSection.tsx` (or similar — check exact path).
The breakpoint change is likely a single CSS media query change from `max-width: 767px` to `max-width: 1023px`, or a Tailwind class change from `md:` to `lg:`.
