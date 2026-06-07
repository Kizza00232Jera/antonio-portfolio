# Blog ideas

The backlog. Read `card-template.md` for the card format. Read `README.md` for how this file is used in the workflow.

Cards are grouped by status. Move a card between sections by editing its `Status:` field and (optionally) moving it under the matching heading. Source of truth is the `Status:` field, not the heading — but keeping them in sync makes the file scannable.

---

## idea

## [even-steven] The 1-cent bug that taught me to stop computing balances in two places

- **Archetype:** technical
- **Pitch:** Even Steven was showing one balance on the groups list and a different balance — off by a single cent — on the balances tab. The root cause was that I was computing balances both in JavaScript (from raw expenses) and in a Postgres trigger, and the two diverged on odd-cent multi-currency splits. The fix wasn't a clever rounding trick. It was deleting the JS calculation entirely and reading the trigger-maintained column directly. Verdict: when client and server agree on the math, they will eventually disagree on the rounding — pick one source of truth and treat the other as a view.
- **Source:** commit `2715bca` (Even Steven), `lib/splits.ts` + `lib/repos/balances.ts` + migration `20260528000024_sum_preserve_balance_trigger.sql`.
- **Code hooks:**
  - `computeBaseShares()` in `lib/splits.ts` — ~25 LOC, shows the floor-non-payers / give-remainder-to-payer pattern that guarantees `sum(shares) === total`.
  - The sum-preservation block in migration 024 — ~30 LOC SQL, shows how the trigger absorbs sub-cent residuals into the largest balance.
  - The "before" `fetchGroupBalances` vs the "after" one-line read in `lib/repos/balances.ts` — ~50 LOC removed, demonstrates the deletion that was the actual fix.
- **Status:** killed

## [even-steven] Supabase RLS broke on every WITH CHECK I wrote — SECURITY DEFINER RPCs were the way out

- **Archetype:** technical
- **Pitch:** Three different tables in Even Steven — expenses, invites, push tokens — all hit the same wall: an RLS INSERT policy that looked correct, used `auth.uid()`, and silently refused every write. Turns out `WITH CHECK` evaluation in PostgREST doesn't get the same `auth.uid()` context as a SELECT policy on the same table. I tried fixing the policy three times before giving up and routing every mutation through a `SECURITY DEFINER` RPC that enforces membership in PL/pgSQL. Verdict: RLS is great for reads, but for any insert that depends on another table's membership, write the RPC. Stop fighting the policy.
- **Source:** commits `1ee78a2`, `48c413c`, `f8d3482` (Even Steven), migrations `20260523000017_create_expense_rpc.sql` and `20260523000019_upsert_push_token_rpc.sql`.
- **Code hooks:**
  - The `create_expense()` RPC body in migration 017 — ~40 LOC, shows the SECURITY DEFINER pattern + the explicit membership check.
  - The before/after diff of `lib/repos/expenses.ts` from `.insert()` to `.rpc('create_expense', ...)` — ~10 LOC, demonstrates the client-side simplification.
  - The original failing RLS policy I tried to rescue first — ~15 LOC, included to show what the dead end looked like.
- **Status:** drafted

## [even-steven] I sandboxed sixteen issues onto a single weekend agent and merged them all

- **Archetype:** reflective
- **Pitch:** Most of Even Steven's product surface — group creation, expense form, debt simplification, balances tab, invite system, friends, account deletion, OTA updates, offline banner — was implemented in two weekend runs of an autonomous coding agent against pre-written issue specs. The interesting part isn't the speed. It's what broke. Every "SANDCASTLE" commit landed clean against its own spec, but the integration surface between them was where I spent the real time: RLS interactions across migrations from different issues, query keys that didn't match between hooks written in parallel, design tokens that drifted. Verdict: agent runs are great at vertical slices and terrible at the seams between them — the human's job moves from typing to defining the seams.
- **Source:** commits `e83e709` through `c893402` and the SANDCASTLE prefix across the git log (Even Steven). Worktree config at commit `440f973`.
- **Code hooks:**
  - The list of merge commits over two weekends, shown chronologically — ~10 lines, demonstrates the run cadence.
  - The follow-up "Refactor X for clarity and consistency" commits that landed right after each merge — ~5 lines, show the human cleanup pass.
  - One concrete cross-issue conflict: the consolidated `041c046` Android image upload fix that had to touch four files written by four different sub-agents — file list only.
- **Status:** killed

## [even-steven] Why I rewrote my expense splits to floor-then-round instead of proportional

- **Archetype:** technical
- **Pitch:** The natural way to split a 100 EUR expense three ways is `(33.33, 33.33, 33.33)` and let the payer eat the missing cent. The natural way is also wrong for multi-currency groups, because the cent that the payer should eat in the group's base currency isn't the same cent they fronted in the expense's original currency. I had two layers of rounding compounding into a sub-cent error that the DB then rounded twice. The fix was to compute non-payer shares with `floor` and back-calculate the payer's share as `total - sum(others)` — at every layer, not just one. Verdict: in money math, the residual belongs to one specific actor and the formula needs to name them explicitly at every conversion step.
- **Source:** commits `36fc8e2` (initial splits TDD) and `2715bca` (the fix), `lib/splits.ts` and `lib/splits.test.ts` in Even Steven.
- **Code hooks:**
  - `floor2()` + `computeEqualShares()` from `lib/splits.ts` — ~30 LOC, shows the floor-non-payers pattern.
  - Two test cases from `lib/splits.test.ts`: 100 EUR split 3 ways + 66.69 EUR split 2 ways in a DKK group — ~40 LOC, demonstrates the integer-cent invariants.
  - The Postgres trigger residual-absorption block from migration 024 — ~15 LOC SQL, shows the DB-side mirror of the same invariant.
- **Status:** drafted

## [even-steven] One useRealtime hook beats three Postgres Changes subscriptions

- **Archetype:** hybrid
- **Pitch:** I had three separate `supabase.channel()` calls in the expenses, balances and summary tabs of a group. Each one re-subscribed on every re-render of its tab. The result was a backend that was constantly opening and closing WebSocket channels and a UI that occasionally missed events because a channel was mid-resubscribe when the change landed. I collapsed all three into one `useRealtime(groupId)` hook mounted on the group detail screen, with TanStack Query invalidations fanning out to the affected query keys. Verdict: in a tabbed UI sharing one entity, the subscription belongs at the parent — never inside the tabs that read from it.
- **Source:** commit `7cf2e77` (Even Steven), `hooks/useRealtime.ts`, and the diff that removes inline subscriptions from `balances.tsx` and `summary.tsx`.
- **Code hooks:**
  - The complete `useRealtime` hook — ~40 LOC, shows the three-channel subscribe + invalidation map.
  - The deleted inline subscription from `balances.tsx` — ~20 LOC, demonstrates what got cut.
  - The query key map showing which Postgres table change invalidates which TanStack key — ~10 LOC.
- **Status:** killed

## [even-steven] Android image uploads in Expo: fetch().blob() is the wrong primitive

- **Archetype:** technical
- **Pitch:** The same image upload code that worked on iOS produced corrupt files on Android. The chain went `expo-image-picker` URI → `fetch(uri).blob()` → `supabase.storage.upload(blob)`. On Android, `fetch()` against a `file://` URI returns a `Blob` that Supabase serializes as an empty payload. I went through two failed fixes — `FileSystem.readAsStringAsync` was the second — before landing on `expo-image-picker`'s built-in `base64` option converted to an `ArrayBuffer`. Verdict: on Expo / React Native, never reach for the Web platform primitive when the Expo module ships a native equivalent.
- **Source:** commits `6cdd250` and `041c046` (Even Steven), `lib/repos/photos.ts`, `lib/repos/groups.ts`, `lib/repos/profiles.ts`.
- **Code hooks:**
  - The `fetch().blob()` version that silently failed on Android — ~10 LOC, marked as the dead end.
  - The `FileSystem.readAsStringAsync` attempt that fixed one but broke another — ~15 LOC.
  - The final `base64ToArrayBuffer` path with `expo-image-picker`'s `base64: true` — ~15 LOC, shows the version that works.
- **Status:** drafted

## [even-steven] Storing every expense in base currency was the only way to make balances make sense

- **Archetype:** hybrid
- **Pitch:** A 52-euro dinner in a Danish-krone group is not a 52-krone dinner. I learned this the embarrassing way when balances on a Stockholm trip showed everyone owing each other roughly 1/7th of what they actually owed. The fix wasn't a runtime conversion — it was adding `base_currency_amount` to the expenses table and `base_share_amount` to participants, computing them client-side at insert time where the exchange rate cache lives, and letting the balance trigger only see base-currency numbers. Verdict: for multi-currency apps, the original amount is the document; the base-currency amount is the index. You store both and you compute on the index.
- **Source:** commit `f8d3482` (Even Steven), migration `20260523000020_base_currency_amounts_for_balance.sql`.
- **Code hooks:**
  - The new columns + balance trigger update from migration 020 — ~40 LOC SQL.
  - The client-side rate fetch + `computeBaseShares` call in `add-expense.tsx` — ~20 LOC.
  - A balance-render snippet that shows both currencies side by side — ~10 LOC TSX.
- **Status:** drafted

## [even-steven] I stopped showing OTA update banners and the app got better

- **Archetype:** reflective
- **Pitch:** Expo's OTA updates are a superpower. My UI for them was a tap-to-restart banner that nobody tapped. After watching users sit on a three-week-old JS bundle because they were "in the middle of something," I rewrote the hook to check for an update on launch, download it in the background, and apply it on the next cold start with no banner, no prompt, no question. Verdict: OTA on a personal-finance app should be invisible — if the user has to consent to the update, you've already lost.
- **Source:** commit `8a2a5d2` (Even Steven), `hooks/useOTAUpdates.ts`.
- **Code hooks:**
  - The full `useOTAUpdates` hook after the rewrite — ~40 LOC, shows the launch-check + silent apply.
  - The deleted banner component + its `onPress` handler — ~25 LOC, demonstrates what got removed.
- **Status:** killed

## [habit-flow] Web Push on iOS made me rebuild HabitFlow's reminder pipeline

- **Archetype:** technical
- **Pitch:** HabitFlow started with `setTimeout` notifications fired from the foreground page. That worked exactly as long as the PWA was open. Moving to real Web Push meant standing up a Vercel cron, a VAPID-signed push service, an Upstash Redis store of subscriptions, and a service worker handler — five moving parts to deliver one notification at 8 a.m. Then I needed exact-time task reminders and the cron model fell apart, so I added QStash for per-task scheduling. Verdict: Web Push on iOS is real, but the pipeline is a six-month project disguised as a feature flag — pick QStash + Upstash from day one if you want exact-time reminders.
- **Source:** commits `a22f74c` (initial web push) and `6a0c533` (QStash) in habitflow, `api/cron-morning.js`, `api/schedule.js`, `api/notify.js`, `src/sw.js`.
- **Code hooks:**
  - The service worker `push` handler from `src/sw.js` — ~25 LOC, shows the payload-to-notification path.
  - The `schedule.js` QStash publish loop — ~30 LOC, shows the per-task `notBefore` scheduling.
  - The `notify.js` HMAC signature verification block — ~15 LOC, demonstrates the QStash-to-webhook trust boundary.
- **Status:** drafted

## [habit-flow] Migrating HabitFlow's email summaries from Supabase Edge Functions to EmailJS

- **Archetype:** hybrid
- **Pitch:** I wired up a weekly summary email through a Supabase Edge Function calling Resend. It worked. It also meant maintaining a Deno Edge Function, a server-side Resend account, and a deploy pipeline for code that ran once a week. After two weeks of zero engagement and one deploy failure, I deleted the Edge Function and rewrote the summary to fire from the client through EmailJS — the user's browser is the cron. Verdict: for a personal PWA whose users number in the single digits, EmailJS is the right move; Supabase + Resend is the right move when you cross "send while offline" or "send to users who aren't you".
- **Source:** commit `df5e351` (habitflow), `src/utils/emailUtils.js`, `supabase/functions/send-weekly-summary/index.ts` (deleted).
- **Code hooks:**
  - The deleted `send-weekly-summary/index.ts` — file list + signature only, to show the surface that got removed (~247 LOC gone).
  - The new client-side `sendWeeklySummary()` in `emailUtils.js` — ~50 LOC, shows the EmailJS call and the Monday-only gate.
  - The Monday banner UI hook — ~15 LOC, demonstrates the "browser as scheduler" pattern.
- **Status:** drafted

## [habit-flow] Dexie over localStorage: why I gave up on JSON.parse for HabitFlow's data layer

- **Archetype:** hybrid
- **Pitch:** The plan said localStorage. I built the first version on localStorage. I rewrote it on Dexie a week later. The breaking point wasn't size — it was that every habit-completion toggle was reading, parsing, mutating, serializing, and writing a ~30 KB blob to disk. Add tasks and movement-log and the toggle latency hit a hundred milliseconds on a mid-range Android. Dexie's IndexedDB schema made it disappear. Verdict: localStorage is the right choice for settings, never for any collection you mutate in a tap-loop.
- **Source:** commit `0ac5730` (initial localStorage version) and the silent migration in the next two weeks (habitflow), `src/db/habitflowDB.js`.
- **Code hooks:**
  - The `habitflowDB.js` Dexie schema declaration — ~25 LOC.
  - A `toggleCompletion()` before/after — ~20 LOC, shows the JSON-blob version next to the indexed put.
  - The seed loader using `bulkAdd` — ~15 LOC.
- **Note:** Commit `0ac5730` is the initial data-layer commit, but it introduces Dexie from the start — `src/db/habitflowDB.js` is created with `new Dexie('HabitFlowDB')` already in place. No prior localStorage version exists in the git history, and the accompanying `docs/learning/step-2-data-layer.md` frames Dexie as the planning-stage choice over localStorage rather than a migration. The pitch's narrative (first built on localStorage, migrated two weeks later) is not supported by the source.
- **Status:** idea

## [habit-flow] Schedule history: how I let users edit a habit without breaking last month's stats

- **Archetype:** technical
- **Pitch:** When a user edits "Cold Shower" from "every day" to "Mon/Wed/Fri", the question is: what does last month's completion rate now mean? I shipped it three times wrong before getting it right. The fix is a `habitScheduleHistory` table keyed by `(habitId, effectiveFrom)`; the stats engine picks the schedule active on a given date instead of reading the habit's current schedule. Verdict: for any habit / subscription / config that has historical reporting attached, the schedule itself is event-sourced — past stats never re-bind to the current row.
- **Source:** commit `d82c967` (habitflow), `src/db/habitflowDB.js`, `src/store/habitStore.js`, `src/utils/statsUtils.js`.
- **Code hooks:**
  - The `habitScheduleHistory` Dexie table + index — ~15 LOC.
  - The `getActiveScheduleForDate(habitId, date)` resolver — ~20 LOC.
  - The before/after of `getHabitMonthStats` reading the historical schedule — ~25 LOC.
- **Status:** drafted

## [habit-flow] Why the FAB moved to the center of HabitFlow's nav bar — a one-handed phone story

- **Archetype:** reflective
- **Pitch:** I shipped HabitFlow with a bottom-right floating action button because that's where Material Design puts FABs. Then I used the app one-handed on a 6.7" Android for a week. The FAB was a thumb stretch. Worse, it was a stretch I made twenty times a day. I moved it to the center of the nav bar and the app got noticeably better to use. Verdict: design-system defaults are written for the median app; for any app you use daily, the layout decisions belong to your hand, not Material.
- **Source:** commit `639c8b2` (habitflow).
- **Code hooks:**
  - The nav-bar component with the centered FAB — ~30 LOC, shows the 5-slot layout (Today / Planner / FAB / Stats / Settings).
  - The thumb-reach diagram (described, not coded) and the screenshot pair.
- **Status:** killed

## [recipe-app] Clerk's parallel + intercepting routes are the right modal in Next.js — when they work

- **Archetype:** technical
- **Pitch:** Recipe modals on the home grid use Next.js parallel + intercepting routes — tap a card, the URL becomes `/recipe/[id]` and the modal opens; refresh the page and the same URL loads the standalone detail view. It is genuinely magical when you understand it. It is also genuinely fragile: a missing `@modal/default.tsx`, a stray `loading.tsx` in the wrong segment, or the wrong matcher in the intercepting folder name will silently break the modal without erroring. Verdict: parallel + intercepting routes are the right pattern for "open this in a modal, share the URL, refresh to full page" — but you should write the failure modes down before you ship them.
- **Source:** commit `76a00e3` (recipe-app), `src/app/@modal/(.)recipe/[id]/page.tsx`, `src/app/@modal/default.tsx`, `src/app/recipe/[id]/page.tsx`.
- **Code hooks:**
  - The directory tree under `src/app/` with `@modal` and `(.)recipe` highlighted — ~10 lines, demonstrates the routing convention.
  - The three-line `@modal/default.tsx` that prevents the framework from erroring on non-modal routes — ~3 LOC, the gotcha.
  - The `<Modal>` wrapper in `(.)recipe/[id]/page.tsx` — ~20 LOC, shows what the intercept actually renders.
- **Status:** drafted

## [recipe-app] Why my Recipe App's /demo is just my real recipes behind a DEMO_CLERK_ID

- **Archetype:** hybrid
- **Pitch:** Every portfolio app has the same problem: you want strangers to see what the product feels like, but you don't want them to sign up. The standard answers are fake seed data or a screenshot tour. I did neither — instead, `/demo` is a public route that reads my actual recipes via a `DEMO_CLERK_ID` env var, in read-only mode. The grid is mine, the photos are mine, the recipe pages render normally, but every mutation is hidden by middleware. Verdict: for portfolio-grade apps, the right demo is your real data — fake data feels fake, and the cost of read-only branching is two `if` statements in your middleware.
- **Source:** commit `b6ba312` (recipe-app), `src/app/demo/page.tsx`, `src/lib/db/queries.ts`, `src/proxy.ts`, `src/lib/demo-data.ts`.
- **Code hooks:**
  - The `getDemoUser()` query in `src/lib/db/queries.ts` — ~15 LOC, shows the env-var lookup with static fallback.
  - The `proxy.ts` matcher exempting `/demo` from Clerk — ~10 LOC.
  - The `DemoBanner` + read-only conditional on `recipe-card.tsx` — ~15 LOC.
- **Status:** drafted

## [recipe-app] Upstash rate limiting on Next.js server actions: 14 lines of code, infinite peace of mind

- **Archetype:** technical
- **Pitch:** Uploadthing handles the actual upload. Clerk handles the auth. But nothing stopped a logged-in user from creating ten thousand recipes in an afternoon and burning my Uploadthing quota. Upstash Ratelimit on the `createRecipe` server action — 10/hour, sliding window, keyed by Clerk user id — closed that hole in fewer lines than this paragraph. Verdict: every server action that writes to a paid third-party resource needs a rate limiter; not eventually, on day one.
- **Source:** commit `c3f2b61` (recipe-app), `src/lib/ratelimit.ts`, `src/server/actions/recipes.ts`.
- **Code hooks:**
  - The full `src/lib/ratelimit.ts` — ~25 LOC, shows the two sliding-window limiters.
  - The `createRecipe` server action with the limiter check at the top — ~15 LOC.
  - The error response that the UI maps to a toast — ~5 LOC.
- **Status:** drafted

## [recipe-app] Installing the Recipe App as a PWA on iOS: the install banner that actually works

- **Archetype:** technical
- **Pitch:** Chrome on Android fires `beforeinstallprompt` and you can show a real install button. Safari on iOS fires nothing — you can only tell the user to tap Share → Add to Home Screen. My install banner branches on `isIOS`, captures the deferred prompt on Android, and shows a screenshot-illustrated sheet on iOS. The non-obvious part is the post-install state: Android dispatches `appinstalled`; iOS just silently flips `navigator.standalone`. I had to wait for both. Verdict: PWA install UX is two different products glued behind one banner — design both, don't pretend one fits.
- **Source:** commits `a3f30bc`, `8f54c62` (recipe-app), `src/hooks/use-install-prompt.ts`, `src/components/install-banner.tsx`, `src/components/ios-install-sheet.tsx`.
- **Code hooks:**
  - The `useInstallPrompt` hook with both branches — ~50 LOC, shows the iOS detection + the `Promise.all` minimum-2s install wait.
  - The iOS install sheet step list — ~20 LOC TSX.
  - The Android `triggerInstall` outcome handling — ~15 LOC.
- **Status:** drafted

## [recipe-app] `server-only`, Drizzle, and the day I almost shipped my database URL to the browser

- **Archetype:** reflective
- **Pitch:** I had `import { db } from '@/lib/db'` in a component file. The component happened to also be marked `"use client"`. Nothing complained. The build succeeded. The Drizzle client — and the Postgres URL it carried — would have shipped to every visitor's browser if I hadn't installed the `server-only` package and put it at the top of `db/index.ts`. Verdict: every server-only module in a Next.js project gets one line — `import 'server-only'` — and the build fails the moment a client component imports it. It costs nothing. Add it before you need it.
- **Source:** commit `3a8d535` (recipe-app), `src/lib/uploadthing.ts`, `src/lib/db/index.ts`.
- **Code hooks:**
  - The single-line `import 'server-only'` at the top of `db/index.ts` — ~3 LOC.
  - The build error you get when a client component tries to import a tainted module — ~10 lines of output.
  - The Uploadthing file router with the same treatment — ~15 LOC.
- **Status:** killed

## [recipe-app] Three runtimes, three Sentry configs: what Next.js 16 actually needs to capture every error

- **Archetype:** technical
- **Pitch:** Sentry's Next.js wizard wants you to ship three files: `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts`. Plus `instrumentation.ts`. Plus an env var for the auth token at build time. I spent two evenings on `3b67f54` and `9b1fb5e` figuring out which combination actually captures server-action errors versus edge middleware errors versus client crashes. Verdict: Sentry on Next.js 16 is not a "drop in three lines" install — it is three runtimes that need three separate inits and one instrumentation hook. Plan an afternoon, not a coffee break.
- **Source:** commits `8ff86f5`, `1a45eb4`, `b5e5612`, `0e21f87`, `3b67f54`, `9b1fb5e` (recipe-app), `src/instrumentation.ts`, the three `sentry.*.config.ts` files.
- **Code hooks:**
  - The three minimal Sentry config bodies, side by side — ~30 LOC each, shows what `Sentry.init` looks like per runtime.
  - The `instrumentation.ts` `onRequestError` + runtime-switched `register()` — ~25 LOC.
  - The server action `try/catch` with `Sentry.captureException` — ~10 LOC.
- **Status:** drafting

## [recipe-app] Multi-select and batch-move on a Pinterest grid without a state-management library

- **Archetype:** hybrid
- **Pitch:** I wanted "tap a card to select, tap more to multi-select, batch-move to a folder" without pulling in Zustand or Redux just for this. The whole interaction lives in two `useState` hooks on the grid component: a `Set<string>` of selected IDs and a derived "select mode" boolean. A bottom action bar appears when the set is non-empty; the server action takes an array. Verdict: for any selection UI confined to a single list view, local state with a `Set` beats a global store — escalate only when the selection has to survive route changes.
- **Source:** commit at recipe-app, `src/components/recipe-grid.tsx`.
- **Code hooks:**
  - The two `useState` declarations + the `toggleSelect` callback — ~20 LOC.
  - The bottom action bar with the `addToFolder` server action call — ~25 LOC.
  - The card-level "selected" visual treatment — ~10 LOC TSX.
- **Status:** killed

## [podcast-summarizer] Why I rewrote my podcast summarizer's prompt to forbid the word "Overview"

- **Archetype:** technical
- **Pitch:** The first version of the Podcast Summarizer returned articles that all had the same five headings: Overview, Key Takeaways, Background, Conclusion, Actionable Advice. They were technically summaries. They were unreadable. The fix wasn't a better model — it was a system prompt with an explicit FORBIDDEN list of generic headings and a STRICT requirement that every heading "be specific and descriptive, like a newspaper subheading." Output quality jumped immediately. Verdict: for structured-output AI tasks, the bullet list of what you forbid does more work than the bullet list of what you ask for.
- **Source:** commit `68b1912` (podcast-blog-v2), `app/api/generate/route.ts`.
- **Code hooks:**
  - The FORBIDDEN headings block from the system prompt — ~10 lines of prompt text.
  - A before/after pair: a generic "Overview" article next to a "Why Social Media Is Hitting Teenage Girls Hardest" article — ~30 lines of rendered output, side by side.
  - The JSON schema enforced in the prompt — ~25 lines.
- **Status:** drafting

## [podcast-summarizer] Switching from sonar-pro to sonar-reasoning-pro and why my prompt got 40% shorter

- **Archetype:** hybrid
- **Pitch:** I started with Perplexity's `sonar-pro`. The articles were fine. To make them rich enough, I had to spell out every constraint twice — minimum paragraph counts, banned filler phrases, repeated reminders not to use bullet points. Switching to `sonar-reasoning-pro` let me delete most of the guardrails because the reasoning step now does what the redundant prompt lines were doing. Verdict: when you upgrade to a reasoning model, shorten the prompt first, then re-evaluate output — you are paying for thinking time, not for restating constraints.
- **Source:** commit `68b1912` (podcast-blog-v2), `app/api/generate/route.ts`.
- **Code hooks:**
  - The `model: 'sonar-reasoning-pro'` line + `max_tokens: 5000` config — ~5 LOC.
  - The deleted-prompt diff (~40 lines removed from the system message) — shown as a strikethrough block.
  - The post-processing step that strips `[1][2]` citation markers the reasoning model adds — ~5 LOC.
- **Status:** drafting

## [podcast-summarizer] Single-file API routes are still the right Next.js 16 default

- **Archetype:** hybrid
- **Pitch:** I'd been deferring to Supabase Edge Functions for "AI-touching" endpoints — they feel like they belong on the backend. For the Podcast Summarizer's generate route, the Edge Function added a deploy step, a separate logs surface, and a CORS dance for a single POST that calls Perplexity once and returns JSON. I moved it to `app/api/generate/route.ts` and deleted the Edge Function. The code became 90 lines and shipped with the Next.js deploy. Verdict: for stateless server-side endpoints in a Next.js app, the App Router route handler is the right home; Edge Functions earn their place only when you need to run independently of the web deploy.
- **Source:** commit `1e87799` (podcast-blog-v2), `app/api/generate/route.ts`.
- **Code hooks:**
  - The complete `app/api/generate/route.ts` after the migration — ~90 LOC.
  - The deleted Supabase Edge Function's `serve()` wrapper — ~20 LOC, shown as removed.
  - The Vercel deploy diff — one URL versus two.
- **Status:** killed

## [podcast-summarizer] YouTube oEmbed is the cheapest pre-context step in the AI pipeline

- **Archetype:** technical
- **Pitch:** Before sending a YouTube URL to Perplexity, I hit the YouTube oEmbed endpoint — no API key, no quota — to grab the canonical title and channel name. The AI then gets `Find and analyze this podcast episode: <url> titled "<title>" by <channel>` instead of just a bare URL. The title alone cut hallucinated episode titles to near zero. Verdict: for any AI pipeline that takes a public URL, run the URL through oEmbed (or the equivalent) first — free context is the highest-ROI step in the whole chain.
- **Source:** `app/api/generate/route.ts` (podcast-blog-v2) and the front-end fetcher.
- **Code hooks:**
  - The oEmbed fetch in the upload page — ~15 LOC.
  - The `searchQuery` template-string assembly in `route.ts` — ~5 LOC.
  - The override block at the end of `route.ts` that re-imposes the oEmbed title on the AI response — ~5 LOC.
- **Status:** drafting

## [sporcle-helper] What a brute-force letter cycler taught me about DOM event modeling

- **Archetype:** technical
- **Pitch:** Sporcle's crossword cells don't expose a public API. They accept a keypress only when the cell is "selected" — represented by a `cursor-hilight` class that the game removes the instant you type a wrong letter. So a naive "loop through A-Z and dispatch keydown" cycles letters into nothing after the first miss. The fix is to store the cell's DOM reference at cycle start, fire a synthesized `mousedown / mouseup / click` sequence before each letter to restore selection, then dispatch the `keydown / keypress / keyup` trio with `keyCode`, `which`, and `charCode` populated. Verdict: when you're scripting against a non-API surface, the right mental model is the browser's event order — recreate every step a human's input pipeline would.
- **Source:** `content.js` lines 19-53 and `CONTEXT.md` (sporcle-helper).
- **Code hooks:**
  - The full `tryLetters()` function — ~30 LOC.
  - The `keyOpts` literal with all four legacy fields — ~10 LOC.
  - The exit condition checking `cell.classList.contains('right')` — ~3 LOC, points to the only success signal that survives.
- **Status:** killed

## [sporcle-helper] Chrome Manifest V3 commands beat keyboard event listeners

- **Archetype:** hybrid
- **Pitch:** My first version of the Sporcle Helper bound Ctrl+Shift+L in the content script's `keydown` handler. It mostly worked. It also fired inside text inputs, fought Sporcle's own shortcut bindings, and silently broke whenever Sporcle's page wrapped the grid in an iframe. I rewrote the trigger as a Manifest V3 `commands` entry routed through the background service worker, sending a `chrome.runtime.sendMessage` to the active tab. The content script keeps its own `keydown` fallback for non-Sporcle frames. Verdict: in MV3 extensions, the right place for a global shortcut is the `commands` manifest entry — content-script key listeners are a backup, not the primary path.
- **Source:** `manifest.json`, `background.js`, `content.js` (sporcle-helper).
- **Code hooks:**
  - The `commands` block in `manifest.json` — ~10 LOC JSON.
  - The full `background.js` — ~15 LOC, shows the active-tab check and the message dispatch.
  - The dual-path `keydown` handler + `onMessage` listener in `content.js` — ~15 LOC.
- **Status:** killed

## [sporcle-helper] One CONTEXT.md file made my Chrome extension legible six months later

- **Archetype:** reflective
- **Pitch:** The Sporcle Helper is two files and a manifest. It should not need documentation. It does. Six months after writing it, I couldn't remember why I was calling `mousedown / mouseup / click` before every key press, or why the `cursor-hilight` class wasn't a reliable identifier mid-cycle. I wrote a `CONTEXT.md` with a glossary: Cell, Fillable Cell, Active Cell, Solved Cell, Letter Cycle. Reading it puts me back in the head of the developer who wrote the code in twenty seconds flat. Verdict: every project — including the two-file ones — gets a CONTEXT.md naming the concepts; the cost is fifteen minutes, the payoff is every future session.
- **Source:** `CONTEXT.md` (sporcle-helper), referenced against `content.js`.
- **Code hooks:**
  - The Cell / Active Cell / Solved Cell glossary entries from `CONTEXT.md` — ~30 lines of markdown.
  - The "Example dialogue" block at the end — ~10 lines.
  - The two `content.js` lines that only make sense given the glossary — `const cell = document.querySelector('.cell.cursor-hilight:not(.right)')` and `if (cell.classList.contains('right')) break` — pointed at directly.
- **Status:** drafting

---

## drafting

*Cards picked for the next Drafter pass.*

---

## drafted

*Live as drafts in Sanity Studio. Awaiting Publish click.*

## [meta] Why I switched my portfolio from npm to pnpm and what I actually got

- **Archetype:** hybrid
- **Pitch:** I switched this portfolio from npm to pnpm with no crisis driving it, just curiosity about the content-addressable store. Six weeks later the disk savings are real, the strictness caught two latent bugs in the first week, and the one production incident (a Vercel build that failed because I forgot to commit the regenerated lockfile) was pnpm catching a mistake npm would have hidden. Verdict: for a single-developer Next.js project on a machine that already has other Node projects, pnpm is the right call; for a public library that lives on first-time contributions or any project whose tooling assumes a flat node_modules, stay on npm.
- **Source:** the portfolio repo itself, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, commit `62ec597` ("fix: sync pnpm-lock.yaml with package.json to fix Vercel build").
- **Code hooks:**
  - `package.json` from the repo, trimmed to ~30 LOC, showing the declared dependency surface.
  - The `pnpm-workspace.yaml` two-line `ignoredBuiltDependencies` config, the security knob npm has no equivalent for.
  - A `pnpm-lock.yaml` fragment showing the recursive peer-dependency context syntax in the `version:` field.
  - An npm vs pnpm CLI translation table for daily commands.
  - The before / after `du -sh` measurements: combined `node_modules` size across this repo plus typical side-projects on npm, versus the single pnpm store on disk afterwards.
- **Status:** drafted

---

## published

*Shipped.*

---

## killed

*Rejected. Kept as a record so Scout doesn't re-propose them.*
