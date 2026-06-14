# Blog ideas

The backlog. Read `card-template.md` for the card format. Read `README.md` for how this file is used in the workflow.

Cards are grouped by status. Move a card between sections by editing its `Status:` field and (optionally) moving it under the matching heading. Source of truth is the `Status:` field, not the heading — but keeping them in sync makes the file scannable.

---

## idea

## [nordhem] Two kinds of synonym, and when each one bites you

- **Archetype:** explainer
- **Pitch:** Elasticsearch makes you pick a type for every synonym: equivalent (all terms swap both directions) or one-way (a search for one term expands to another, but not back). The post explains both with furniture examples and the cases where each quietly does the wrong thing: an equivalent group is symmetric, so one weak member (`ottoman, stool`) pollutes searches both ways; a one-way rule's arrow IS its meaning, so `hassock => ottoman` backwards silently fills "ottoman" results with a rare word. Shows the one-line `toSolrRule` that distinguishes them and notes broad equivalent groups can lower nDCG even as recall rises. Verdict: use equivalent only for true synonyms you'd accept either way; reach for one-way when you want to catch a word without the reverse; one-way is the safer default, and measure a broad group on judged queries before shipping.
- **Source:** step 9 slice 1; `services/search/src/es/synonyms.ts` (`toSolrRule`/`parseSolrRule`, the kind field), `synonyms.txt` and the catalog-mined one-way rules
- **Code hooks:** the `toSolrRule` function (~4 lines) showing the `=>` arrow as the only difference between the two kinds
- **Status:** drafted
- **Note:** Approved by Antonio 2026-06-14. Drafted to Sanity (explainer, Julia voice) as drafts.0a71c173-23b1-4957-bf23-17223091d69f with a "One Way" signs hero. Not yet published.

## [nordhem] The two words that silently decide whether your embeddings work

- **Archetype:** explainer
- **Pitch:** I added local semantic search and almost shipped a version that was quietly worse, because of two words. The e5 embedding model is trained to expect a `query:` prefix on searches and a `passage:` prefix on documents; skip them and it returns a slightly-wrong vector with no error, no warning, just silently degraded relevance. The post explains what embeddings are, why e5 cares which role a text plays (it is asymmetric: the same words embed differently as a query vs a passage), what goes wrong if you forget, and how I made it unforgettable by baking the prefixes into `embedQuery`/`embedPassage` so no caller can pass raw text. Verdict: a model's input contract belongs in code, not a README; when there is a detail you must not forget, build it so forgetting is impossible.
- **Source:** step 8; `services/search/src/embed/embed.ts` (the prefixed `embedQuery`/`embedPassage`/`embedPassages` over `Xenova/multilingual-e5-small`), `services/search/test/integration/embed.test.ts` (the sofa-vs-knife separation test that guards it)
- **Code hooks:** the embed module core (~20 lines): the private `embed` with `pooling: mean, normalize: true`, and the two public functions that prepend `query:` / `passage:`
- **Status:** published
- **Note:** Approved by Antonio 2026-06-14. Drafted to Sanity (explainer, Julia voice) with a vintage filing-cabinet hero, then published 2026-06-14 as c54626ee-eb6e-4a23-9b7a-4c075e771f9d.

## [nordhem] Making a hardcoded query tunable without changing what it does

- **Archetype:** explainer
- **Pitch:** My Elasticsearch ranking lived baked inside one function, so I had no clean way to ask "does a higher name boost actually help?" without editing code and eyeballing results. I turned the query into a config object (a RankingConfig value with the boosts, fuzziness, phrase boost and popularity as fields) fed to a boring builder, with one non-negotiable rule: the default config reproduces the old query byte for byte, proven by a deep-equality test. That safety is what let me tune afterwards without wondering if I'd quietly broken search. I'm honest that the measured win was modest (nDCG@10 0.6532 to 0.6629). Verdict: the payoff isn't the config object, it's the measurement the object unlocks; make the default reproduce the old behaviour exactly and write the test that proves it before changing anything else.
- **Source:** step 7; `services/search/src/search/query.ts` (RankingConfig, DEFAULT_RANKING, buildMultiMatch, coerceRankingConfig), `services/search/test/unit/query.test.ts` + `query-ranking.test.ts` (the byte-for-byte default proof and the tuned-config DSL proof), `apps/web/app/components/tune-controls.tsx`
- **Code hooks:** the `RankingConfig` interface (~14 lines); `buildMultiMatch` with the if-guards that let off-values disappear (~11 lines); the deep-equality `toEqual` proof test (~20 lines); `coerceRankingConfig` clamping untrusted slider input (~18 lines)
- **Status:** published
- **Note:** Approved by Antonio 2026-06-14. Published to Sanity as 04b4262b-4235-4a2d-b164-e5b04bdd5605.

## [nordhem] Reading the _explain tree: why did this product rank here?

- **Archetype:** explainer
- **Pitch:** After a tuning session I still could not point at a single result and say why it ranked where it did. The fix is that Elasticsearch already knows, exactly, and will tell you via the `_explain` API: hand it a query and one document id and it returns the score as a little tree of math. I added an `/explain` endpoint that reuses the real production query builder (so the receipt matches the meal shoppers actually order) plus a recursive studio tree view, then walked `task chair` against product 1864 (score ~50.5) down to its BM25 leaves: term frequency, inverse document frequency, field-length norm, the `best_fields` "max of", and my phrase boost sitting at the top with my `slop: 2` printed verbatim. Verdict: add an explain view the moment you start tuning; it's what turns "I think the ranking does X" into "the ranking does X, and here is the math."
- **Source:** step 7; `services/search/src/server.ts` (the `/explain` route reusing `buildSearchBody`), `services/search/src/search/query.ts` (DEFAULT_RANKING, the `match_phrase` should clause), `apps/web/app/components/explain-view.tsx` (the recursive ExplainTree), `apps/web/app/studio/relevance/explain/page.tsx`
- **Code hooks:** the tiny `/explain` handler showing `buildSearchBody` reuse (~18 lines); the `DEFAULT_RANKING` config (~8 lines); the `match_phrase` should-clause construction (~4 lines); the recursive `ExplainTree` renderer with collapsed leaves (~22 lines)
- **Status:** published
- **Note:** Approved by Antonio 2026-06-14. Published to Sanity as 7d79895e-3900-4376-8163-2e6f909c9c2f.

## [nordhem] Why my search filters never touch the relevance score

- **Archetype:** technical
- **Pitch:** When a shopper types "sofa" and ticks the Sofas category, those two conditions are not equal: the typed word should drive ranking, the category is a yes/no gate that must not make a product more relevant. Elasticsearch encodes this as query context (bool.must, scored by BM25) versus filter context (bool.filter, unscored and cached as a reusable bitmap). This post shows the must/filter split in my faceted search, why a category in must quietly pollutes relevance and burns the filter cache, and the regression test that pins a product's score unchanged with and without a filter applied. Verdict: the question that decides where every clause goes is "is this about relevance, or about membership?" — relevance is scored, membership is gated and cached.
- **Source:** step 4; `services/search/src/search/query.ts` (buildQueryClause must/filter split, queryFilterClauses vs postFilterClauses), `services/search/test/integration/facets.test.ts` (the scoring-invariance guard test), D39 in docs/DECISIONS.md
- **Code hooks:** the must/filter split in `buildQueryClause` (~15 lines); the `queryFilterClauses` / `postFilterClauses` helpers that decide each clause's home (~12 lines); the "does not change relevance scores" guard test (~15 lines)
- **Status:** published

## [nordhem] What is Elasticsearch, and why use it?

- **Archetype:** explainer
- **Pitch:** Elasticsearch is the search engine behind my webshop's search box. This is the plain-English tour I wish I'd had: what it actually is (a back-of-book inverted index over your data, spoken to over a JSON API), the capabilities that make it worth running, and exactly how I use each one in NORDHEM. The tour covers full-text analysis (tokenizing, lowercasing, stop words, stemming, with my real "Antonio's Solid Wood Beds" becoming antonio solid wood bed), synonyms so "couch" finds a sofa, typo tolerance so "vellvet" finds 22 velvet products, relevance scoring with BM25 and field boosts, autocomplete and did-you-mean, faceted filtering with aggregations (what I'm building next), and vector/semantic search (what I'm saving for later). Verdict: a database stores your data, a search engine finds it; the moment search becomes a feature customers judge you on, Elasticsearch earns its place, and I'll show which of its powers I actually reach for and which are still ahead of me.
- **Source:** steps 1–3; `services/search/src/es/analysis.ts`, `src/search/query.ts`, `synonyms.txt`, D5/D33/D34 in docs/DECISIONS.md; PLAN.md steps 4 (facets) and 8 (semantic) for the honestly-labeled "coming next" capabilities
- **Code hooks:** the analyzer chain from `analysis.ts` (~20 lines); the boosted fuzzy `multi_match` from `query.ts` (~15 lines); optionally the `synonyms.txt` groups; the analysis-chain example ("Antonio's Solid Wood Beds" → `antonio solid wood bed`)
- **Status:** published
- **Note:** Reframed 2026-06-13 at Antonio's request from the "two databases" angle to a capabilities tour ("what is Elasticsearch and why use it"). Original recovered card approved 2026-06-12T22:38Z (session b9fb4cc3); first draft drafts.a949885c discarded and replaced. Published 2026-06-13 as 495021ad-2268-43c0-a220-68c6ab3ce598 with githubUrl set.

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

## [meta] What is MCP, and what changed once I started using it?

- **Archetype:** explainer
- **Pitch:** I kept hearing "MCP" everywhere, in Claude Code, in Sanity, in every new tool that wanted to talk to an AI. I thought it was just another acronym I'd have to memorise. It turns out MCP is a small idea: a shared protocol that lets AI assistants like Claude actually do things in the apps I use, instead of just talking about them. This post is the friendly version of what MCP is, how it plugs into my work, and why I think it's worth paying attention to. Verdict: MCP isn't magic. It's the moment Claude stopped being a chat window and started being a coworker who can reach into my tools, and that's a bigger deal for non-developers than the protocol's plumbing makes it sound.
- **Source:** my general use of MCP via Claude Code over the last several months; the `scribe/` folder in this repo as a concrete example to point at; Anthropic's MCP documentation as the underlying spec the post works from.
- **Code hooks:**
  - At most one tiny snippet showing what an MCP tool call looks like in practice (~10 LOC), pulled from `scribe/draft.md` lines 127–148 (the `create_documents_from_json` shape). Optional, fine to ship with zero code if the prose carries it.
- **Status:** published

## [meta] How I taught Claude to fill in my Sanity blog posts for me

- **Archetype:** explainer
- **Pitch:** Typing a blog post into Sanity Studio is slow. Title in one box, slug in another, body in a third with its own rich-text editor, then tags, then a hero image to upload. I did it for three posts before deciding I'd rather build a small system that lets Claude type for me. It's called Scribe, it sits in this repo at `scribe/`, and it uses the Sanity MCP to write directly into my CMS. This post walks through how the agent fills each field, title, slug, body Portable Text, tags, hero image, and what I had to teach it before it stopped guessing. Verdict: building this kind of agent is worth it once you have enough posts in your backlog to feel the typing pain. For one or two posts, just type them. For a backlog like mine, Scribe paid for itself by the third post, and the field-by-field map below is what it took to get there.
- **Source:** commit `39e1a96` ("feat: scribe blog automation framework"), commit `4a3c8ff` ("feat: enable blog pages, homepage section, responsive list"); files `scribe/draft.md`, `scribe/scout.md`, `scribe/unsplash-upload.mjs`, `scribe/card-template.md`.
- **Code hooks:**
  - One ~15-line snippet of the `create_documents_from_json` call shape from `scribe/draft.md` lines 127–148, showing which fields the agent fills.
  - Optionally one ~10-line snippet of the Portable Text block structure from `scribe/draft.md` lines 158–168, showing what the body actually becomes once the agent writes it.
- **Status:** published

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

## [nordhem] Test a library against a real database, not a mock

- **Archetype:** explainer
- **Pitch:** When you mock a third-party library in a test, you end up asserting that your own mock got called, which proves nothing about the library. Spin up a real but disposable database with Testcontainers, run the real code against your real schema, and assert on the rows it actually wrote. Verdict: for anything that persists data through an adapter you did not write (auth, ORMs, storage clients), a real ephemeral database catches the schema, adapter, and behaviour bugs mocks hide, and it still runs in CI; mock only true externals and pure functions.
- **Source:** NORDHEM step 5 auth. `apps/web/test/integration/auth.test.ts`, `apps/web/lib/auth.ts`, `tools/test/integration/write-shop.test.ts`, `docs/TESTING.md`.
- **Code hooks:**
  - The Testcontainers `beforeAll`/`afterAll` that boots a real Postgres 17 and applies the schema (~14 LOC).
  - The Better Auth sign-up assertion reading the account row and checking `password` is truthy but `not.toBe(PASSWORD)` (~12 LOC).
- **Status:** published (Sanity `71139110-df43-47a4-a9cf-304d2f174a02`, live 2026-06-13)

## [nordhem] The four bugs my unit tests were never going to find

- **Archetype:** explainer
- **Pitch:** Three test layers, each best at a different job: fast unit tests that pinpoint one function, integration tests against a real Postgres that prove transactions, constraints and rollbacks headlessly, and one Playwright golden flow through a real browser plus both servers plus real Elasticsearch and Postgres. Getting that flow green surfaced four bugs the lower layers structurally could not see (a form submitting as a native GET before hydration, localhost resolving to IPv6 while Fastify bound IPv4, dev-mode HMR breaking hydration on a custom port, an optimistic control clicked before it mounted). Verdict: keep the pyramid (29 / 16 / 2 here); an e2e failure says "somewhere in a long journey", a unit failure names the line, and you want all three.
- **Source:** NORDHEM step 5 slice 11. `apps/web/playwright.config.ts`, `apps/web/e2e/golden-flow.spec.ts`, `apps/web/vitest.config.ts`, `apps/web/test/integration/checkout-repo.test.ts`, `docs/TESTING.md`.
- **Code hooks:**
  - The two-project unit/integration split in `vitest.config.ts` (~20 LOC).
  - The payment-rollback integration test in `checkout-repo.test.ts` (~18 LOC).
  - The 127.0.0.1 baseURL + production-build webServer in `playwright.config.ts`, and the `waitForHydration` helper in the spec (~6 LOC).
- **Status:** published (Sanity `eaf5bb05-559d-4cf2-91f1-92927d34b550`, live 2026-06-13)

---

## published

*Shipped.*

---

## killed

*Rejected. Kept as a record so Scout doesn't re-propose them.*
