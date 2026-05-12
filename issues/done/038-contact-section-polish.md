---
title: Contact section polish — background, nav hover, footer bar
type: AFK
priority: normal
---

## Parent

issues/036-contact-section-cv-modal.md

## What to build

Polish the Contact section to align with the rest of the site's design language:

1. **Background colour** — change from warm cream (`#f2ede8`) to off-white (`#fafaf8`), matching the Journey section exactly.
2. **Footer nav link hover** — HOME, PROJECTS, BLOGS currently fade to 45% opacity on hover. Replace with the `CharRevealLink` letter-flip animation (same component used in the main header nav). The flip colour must stay black — no blue accent — since this is a light-background context. Override `--cr-hover` to match the text colour so the effect is motion-only.
3. **Footer bottom bar** — remove the copyright line ("© 2026 All rights reserved Antonio Jerkovic"). Keep only the Stockholm live clock. The clock already reads "STOCKHOLM: (GMT+2) HH:MM:SS" — no changes to its output.
4. **Address block** — remove the "Address: Solna, Stockholm, Sweden" block. The clock is sufficient location signal.

No changes to the big "ANTONIO JERKOVIC" slide-up animation, phone numbers, email, LinkedIn, GitHub links, or the `#contact` anchor.

## Acceptance criteria

- [ ] Contact section background matches the Journey section (`#fafaf8`) — no warm cream tint
- [ ] HOME, PROJECTS, BLOGS links animate with the CharReveal letter-flip on hover
- [ ] Flip colour stays black — no blue accent appears on hover
- [ ] Copyright line is removed from the footer bottom bar
- [ ] Address block ("Solna, Stockholm, Sweden") is removed
- [ ] Stockholm clock remains and displays correctly
- [ ] `pnpm build` passes
