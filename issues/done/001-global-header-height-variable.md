---
title: Define --header-h globally in :root
type: AFK
priority: high
---

## Problem

`--header-h` is only defined inside `.projects-theme` (used on `/projects` and `/blog`). On the home page (dark theme), the variable is undefined, so any CSS that does `padding-top: var(--header-h)` falls back to nothing.

## Desired behaviour

`--header-h: 5rem` is defined in `:root` so every section on every page can reliably clear the fixed header.

## Acceptance criteria

- [ ] `--header-h: 5rem` is added to the global `:root` block in `src/app/globals.css`
- [ ] `.projects-theme` still defines its own `--header-h: 4rem` (overrides root for those pages — this is correct and intentional)
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change any component padding values — this issue is only the CSS variable declaration.

## Notes

File: `src/app/globals.css`
The `:root` block with typography scale is around line 29. Add `--header-h: 5rem` in a spacing `:root` block nearby.
`.projects-theme` override at line 120 sets `--header-h: 4rem` — leave that unchanged.
