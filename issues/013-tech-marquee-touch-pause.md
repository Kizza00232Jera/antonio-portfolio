---
title: Tech Marquee — pause animation on touch (mobile)
type: AFK
priority: low
---

## Problem

The Tech Marquee scrolling animation can be paused on desktop by hovering. Touch devices have no equivalent — mobile visitors cannot pause the marquee to read individual tech stack items.

## Desired behaviour

`touchstart` pauses the marquee animation. `touchend` resumes it. This mirrors the existing hover-pause behaviour.

## Acceptance criteria

- [ ] Touching (touchstart) the Tech Marquee pauses the scrolling animation
- [ ] Releasing (touchend) resumes the scrolling animation
- [ ] The existing hover-pause on desktop is unchanged
- [ ] Event listeners are cleaned up on component unmount
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change the marquee animation speed or direction
- Do not change the marquee visual design

## Notes

Tech Marquee component: search for `marquee` or `Marquee` in `src/components/`. Find where the hover pause is implemented and add parallel `touchstart`/`touchend` listeners.
