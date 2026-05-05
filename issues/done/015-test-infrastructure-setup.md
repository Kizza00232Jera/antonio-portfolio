---
title: Set up Vitest + React Testing Library + Playwright test infrastructure
type: done
priority: normal
---

## What was done

- [x] `vitest.config.ts` created (jsdom env, @vitejs/plugin-react, path alias, passWithNoTests)
- [x] `vitest.setup.ts` fixed: imports matchers via `expect.extend` and registers `afterEach(cleanup)` so RTL cleans up between tests without needing `globals: true`
- [x] `playwright.config.ts` created (testDir: e2e/, baseURL: localhost:3000)
- [x] `pnpm test` and `pnpm test:e2e` scripts added to package.json
- [x] All devDependencies installed (vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, @playwright/test)
- [x] Test configs excluded from tsconfig.json to avoid build errors
- [x] `e2e/` directory created
- [x] `pnpm build` passes
- [x] `pnpm test` passes (28 tests across 6 files)
