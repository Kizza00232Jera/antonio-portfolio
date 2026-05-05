---
title: Set up Vitest + React Testing Library + Playwright test infrastructure
type: AFK
priority: normal
---

## Problem

There is no test suite. Before writing any unit or e2e tests, the test infrastructure must be installed and configured.

## Desired behaviour

Three testing layers are configured and can run with a single command each:
- `pnpm test` — Vitest unit tests
- `pnpm test:e2e` — Playwright end-to-end tests

## Acceptance criteria

- [ ] `vitest` and `@testing-library/react` and `@testing-library/jest-dom` are installed as dev dependencies
- [ ] `vitest.config.ts` is created at the project root, configured for jsdom environment and Next.js
- [ ] `@playwright/test` is installed as a dev dependency
- [ ] `playwright.config.ts` is created at the project root, configured to run against `http://localhost:3000`
- [ ] `pnpm test` runs Vitest and exits 0 (even if no tests exist yet — zero tests passing is fine)
- [ ] `pnpm test:e2e` runs Playwright and exits 0 (or reports "no tests found" cleanly)
- [ ] `pnpm build` passes with no errors

## Out of scope

- Do not write any tests in this issue — infrastructure only
- Do not configure code coverage

## Notes

For Vitest with Next.js App Router, the config needs `environment: 'jsdom'` and may need to handle CSS module transforms. Use `@vitejs/plugin-react` if needed.
Add `"test": "vitest run"` and `"test:e2e": "playwright test"` to `package.json` scripts.
