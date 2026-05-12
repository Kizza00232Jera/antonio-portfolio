# ADR-0003: Three-tier breakpoint system

**Status:** Accepted

## Decision

Three named breakpoint tiers used consistently across all CSS media queries and JavaScript checks:

| Tier | Range | CSS rule form |
|---|---|---|
| mobile | < 768px | `max-width: 767px` |
| tablet | 768px – 1023px | `min-width: 768px` |
| desktop | ≥ 1024px | `min-width: 1024px` |

JavaScript checks use `window.innerWidth < 768` for mobile, `< 1024` for tablet.

## Reason

The codebase previously mixed `min-width: 769px` and `max-width: 768px` — a one-pixel gap that caused the header to show a hamburger at exactly 768px while the hero and project sections showed the desktop layout. The three-tier system closes that gap and gives every future breakpoint decision a named reference point.

## Trade-off

The tablet tier (768–1023px) is broader than many systems. The Project Showcase section uses the full tablet range to show mobile cards rather than the squished desktop split-panel. This is intentional — the desktop split-panel layout requires enough width for a readable right panel, which only exists at ≥ 1024px.
