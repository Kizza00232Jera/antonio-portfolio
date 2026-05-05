---
title: Hero section — mobile panel carousel (About Me + Roles)
type: AFK
priority: high
---

## Problem

The Hero section has a three-column desktop layout. On mobile, this layout collapses poorly — the tech sphere globe occupies the wrong amount of space, text sizes are too small, and there is no alternative layout for smaller screens. Mobile visitors cannot comfortably read the Hero.

## Desired behaviour

On mobile (< 768px), the Hero renders as a two-panel carousel:
- **Panel 1 (default):** About Me text
- **Panel 2:** Roles list
- Two dot indicators in the bottom-right corner show active panel and allow tap-to-switch
- The carousel auto-advances every 5 seconds and wraps (panel 2 → panel 1 → ...)
- Any tap on a dot resets the auto-advance timer
- The tech sphere globe is hidden on mobile
- The ANTONIO JERKOVIC wordmark stays at the bottom with `padding-bottom: 2rem`
- Role text and about-me text: minimum font-size `0.875rem`
- Eyebrow label: minimum font-size `0.75rem`

## Acceptance criteria

- [ ] On viewports < 768px, the three-column desktop layout is replaced by the panel carousel
- [ ] Panel 1 shows the About Me text; Panel 2 shows the Roles list
- [ ] Two dot indicators are visible in the bottom-right of the carousel
- [ ] Tapping a dot switches to the corresponding panel
- [ ] The carousel auto-advances every 5 seconds
- [ ] Auto-advance resets when the user taps a dot
- [ ] Auto-advance wraps from last panel back to first
- [ ] The tech sphere globe is not rendered on mobile
- [ ] Wordmark sits at the bottom with `padding-bottom: 2rem`
- [ ] Text is readable at minimum font sizes listed above
- [ ] On viewports >= 768px, the Hero is visually unchanged
- [ ] `pnpm build` passes with no errors

## Out of scope

- No swipe gesture support (dots only)
- No GSAP animation — use CSS transitions for panel switching
- Do not change the desktop Hero layout

## Notes

Extract panel-switching state into a `useCarouselState` hook (returns `{ activePanel, goToPanel }`). This makes the state logic unit-testable without DOM or animation dependencies.
Hero section: `src/components/sections/HeroSection.tsx`.
Mobile breakpoint: `max-width: 767px`.
