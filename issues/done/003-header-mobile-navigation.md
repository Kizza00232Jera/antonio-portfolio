---
title: Add hamburger menu and Contact link to mobile header
type: AFK
priority: high
---

## Problem

On mobile (< 768px), the header shows the "Contact Me" link on the right side. There is no hamburger/nav-overlay toggle, so visitors on phones cannot navigate to Projects or Blog. The MenuButton component exists but is not rendered in the Header.

## Desired behaviour

On mobile, the "Contact Me" link is replaced by the hamburger MenuButton. Tapping it opens the NavOverlay. Contact is accessible from inside the NavOverlay alongside Home, Projects, and Blog. Desktop layout (>= 768px) is unchanged: logo | nav | contact.

## Acceptance criteria

- [x] On viewports < 768px, the "Contact Me" link in the header is hidden
- [x] On viewports < 768px, the MenuButton (hamburger) is visible in the header in the same position
- [x] Tapping the MenuButton opens the NavOverlay (via MenuContext — existing mechanism)
- [x] The NavOverlay contains four links: Home, Projects, Blog, Contact
- [x] Contact link in the overlay points to `/#contact` so it works from any route
- [x] On viewports >= 768px, the header is visually unchanged
- [x] `pnpm build` passes with no errors

## Out of scope

- Do not change the desktop header layout
- Do not redesign the NavOverlay — just add the Contact link

## Notes

Header component: `src/components/layout/Header.tsx` (or similar — check exact path).
MenuButton: `src/components/ui/MenuButton.tsx`.
NavOverlay: `src/components/ui/NavOverlay.tsx` (or similar).
MenuContext is already set up — MenuButton uses it to toggle open state.
Use Tailwind responsive classes (`hidden md:flex` etc.) to toggle visibility.
