---
title: Hero globe — debounced resize listener for orbit radius
type: AFK
priority: low
---

## Problem

The tech sphere globe in the Hero computes its orbit radius once on mount. When the user rotates their device or resizes the browser window, the globe orbit radius does not update — items float at the wrong positions for the new viewport size.

## Desired behaviour

A debounced `resize` event listener recomputes the sphere orbit radius when the viewport changes. The globe re-renders correctly at the new size without visual glitching.

## Acceptance criteria

- [ ] A debounced resize listener is added to the Hero globe component
- [ ] Rotating the device (or resizing the browser window) causes the globe orbit radius to recompute
- [ ] The debounce delay is 200ms or less
- [ ] The listener is cleaned up when the component unmounts (no memory leak)
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change any globe visual styling
- Do not change the orbit radius formula — only re-trigger it on resize

## Notes

Hero globe component: `src/components/ui/TechSphere.tsx` or similar. Find where the orbit radius is computed and trigger that computation again inside a debounced resize handler.
