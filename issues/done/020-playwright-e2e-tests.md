---
title: Playwright end-to-end smoke tests (3 critical journeys)
type: AFK
priority: normal
---

## Problem

There are no end-to-end tests. Three user journeys are critical enough to warrant smoke-test coverage: home page loads, mobile navigation, and project detail back navigation.

## Desired behaviour

Three Playwright tests run against a local dev or preview server and verify the most important user journeys work end-to-end.

## Acceptance criteria

- [ ] `e2e/home.spec.ts` (or similar) contains a test: home page loads, and section titles "MY JOURNEY", "MY PROJECTS", "BLOGS" are all visible after load
- [ ] `e2e/mobile-nav.spec.ts` contains a test: at 375px viewport, hamburger button is visible; clicking it opens the overlay; the overlay contains a Projects link
- [ ] `e2e/project-detail.spec.ts` contains a test: navigating to a project detail page and clicking the close button returns to /projects (URL check — `/projects` in the URL after click)
- [ ] `pnpm test:e2e` passes with no failures (requires `pnpm dev` or `pnpm start` running)
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not add visual regression / screenshot tests
- Do not test every page — only the three journeys above
- Do not mock network requests — these are smoke tests against real pages

## Notes

Depends on issue 015 (test infrastructure), issue 003 (mobile nav), and issue 012 (client navigation) being complete first.
Playwright config should target `http://localhost:3000`. Tests should use `page.goto('/')`, `page.locator(...)`, `expect(locator).toBeVisible()`.
For the project detail test, navigate to any real project slug or set up the test to find and click the first project card.
