---
title: Project Detail — replace window.location.href with Next.js router on back button
type: AFK
priority: low
---

## Problem

The back/close button on the Project Detail page uses `window.location.href = '/projects'` for navigation. This triggers a full page reload, losing scroll position and causing a flash of unstyled content. On mobile this is especially noticeable.

## Desired behaviour

The back button uses Next.js client-side navigation (`useRouter` from `next/navigation`) so navigating back to /projects is instant with no full page reload.

## Acceptance criteria

- [ ] The back/close button on Project Detail uses `router.push('/projects')` (or `router.back()`) instead of `window.location.href`
- [ ] Clicking the back button navigates to /projects without a full page reload
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change the button appearance or position
- Do not change any other navigation in the site

## Notes

Project Detail page/component: `src/app/(site)/projects/[slug]/page.tsx` or the component that renders the close/back button. Search for `window.location.href` to find it.
Import `useRouter` from `'next/navigation'` (not `'next/router'` — this is Next.js App Router).
