---
title: Set up Vitest + React Testing Library + Playwright test infrastructure
type: AFK
priority: normal
---

## Status: partially complete — packages not yet installed

Config files, scripts, and `e2e/` directory are committed. A human must run:

```
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event @playwright/test
```

## What was done

- [x] `vitest.config.ts` created (jsdom env, @vitejs/plugin-react, path alias, passWithNoTests)
- [x] `vitest.setup.ts` created (imports @testing-library/jest-dom)
- [x] `playwright.config.ts` created (testDir: e2e/, baseURL: localhost:3000)
- [x] `pnpm test` and `pnpm test:e2e` scripts added to package.json
- [x] All new devDependencies declared in package.json
- [x] Test configs excluded from tsconfig.json to avoid build errors
- [x] `e2e/` directory created
- [x] `pnpm build` passes
