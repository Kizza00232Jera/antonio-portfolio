# ADR-0002: Extract useCarouselState as a standalone hook

**Status:** Accepted

## Decision

The Hero Panel Carousel's state logic (active panel index, dot index, auto-advance timer, reset-on-interaction) is extracted into a standalone `useCarouselState` hook rather than kept inline inside `HeroSection`.

Public interface:
```
const { activePanel, goToPanel } = useCarouselState({ panelCount: 2, interval: 5000 })
```

## Reason

The carousel state is the only pure, non-visual logic in the codebase that is worth unit testing. Keeping it inside `HeroSection` would entangle it with GSAP entrance animations, SVG rendering, and globe interaction — making it impossible to test without a full component render. As a standalone hook it can be exercised with `renderHook` from React Testing Library: no DOM, no GSAP, no SVG.

## Trade-off

A small amount of indirection is added — `HeroSection` calls the hook and passes values down to the panels rather than managing state directly. This is the correct trade-off: the hook's interface is stable and simple, the implementation complexity is hidden inside it, and the component stays focused on rendering.
