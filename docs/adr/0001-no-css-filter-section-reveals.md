# ADR-0001: No CSS filter-based section reveal effects

**Status:** Accepted

## Decision

Do not use CSS `filter` (blur, brightness, etc.) to create section reveal or dimming effects on scroll.

## Reason

CSS `filter` creates a new stacking context and containing block. This breaks `position: fixed` elements managed by GSAP — specifically the journey ruler pin and image stack — which rely on the viewport as their containing block. Applying filter anywhere in the scroll container causes those pinned elements to misposition.

## Alternative

Sections reveal naturally through scroll overlap via CSS `z-index` stacking. The current section stays fixed while the next section scrolls up from below. This achieves the same visual intent without a containing block side effect.
