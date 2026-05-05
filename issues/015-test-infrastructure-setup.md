---
title: Set up Vitest + React Testing Library + Playwright test infrastructure
type: HITL
priority: normal
---

## Status: blocked on package installation

Config files, scripts, and `e2e/` directory are committed. Human must run:

```
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event @playwright/test
```

Once that runs and `pnpm-lock.yaml` is updated, this issue is complete.
Verify with `pnpm test` (exits 0) and `pnpm test:e2e` (exits 0).

## What was done

- [x] `vitest.config.ts` created (jsdom env, @vitejs/plugin-react, path alias, passWithNoTests)
- [x] `vitest.setup.ts` created (imports @testing-library/jest-dom)
- [x] `playwright.config.ts` created (testDir: e2e/, baseURL: localhost:3000)
- [x] `pnpm test` and `pnpm test:e2e` scripts added to package.json
- [x] All new devDependencies declared in package.json (need `pnpm install` to lock)
- [x] `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts` excluded from tsconfig.json
- [x] `e2e/` directory created with .gitkeep
- [x] `pnpm build` passes with no errors

## Blocked on

`pnpm add` was not available in the current session permission mode (acceptEdits).
A human or privileged session must run the install command above.
