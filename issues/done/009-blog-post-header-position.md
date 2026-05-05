---
title: Blog Post page — move Header outside article element
type: AFK
priority: normal
---

## Problem

On the Blog Post page, the Header component is rendered inside the `<article>` element. This causes incorrect positioning — the header does not sit at the top of the viewport as it does on other pages.

## Desired behaviour

The Header component on the Blog Post page is rendered at the page level (outside `<article>`), matching every other page in the site.

## Acceptance criteria

- [ ] The Header component is rendered outside the `<article>` element on the Blog Post page
- [ ] The header appears correctly fixed at the top of the viewport on the blog post page
- [ ] The article content is not affected (same content, same styling)
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not change the blog post article content or typography
- Do not change the Header component itself

## Notes

Blog Post page: `src/app/(site)/blog/[slug]/page.tsx` (check exact path).
The fix is moving the `<Header />` JSX to be a sibling of `<article>`, not a child.
