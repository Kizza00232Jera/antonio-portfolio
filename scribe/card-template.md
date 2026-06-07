# Blog idea card — canonical format

Every entry in `blog-ideas.md` follows this shape. Scout writes new cards in this format. Drafter reads them. Human moves them between statuses.

## [project-slug] Title of the post

- **Archetype:** `hybrid` | `technical` | `reflective`
- **Pitch:** 2–4 sentences. Must end with the verdict the post argues. Not a topic — a thesis. If you can't write the verdict in a sentence, the card isn't ready and shouldn't enter the backlog.
- **Source:** what surfaced this idea. A commit hash, a file path, an ADR, a decision you remember making. Anchored enough that you can find your own materials six months later.
- **Code hooks:**
  - 1–3 specific snippets the post would show. Each one: roughly how many lines, what it demonstrates.
- **Status:** `idea` | `drafting` | `drafted` | `published` | `killed`

## Field rules

- **Project slug** in brackets matches a key in `projects.json`. No slug = the card isn't tied to a project (e.g. cross-cutting reflections); use `[meta]` for those.
- **Title** is the actual proposed blog title, not a topic name. Scout commits to a phrasing; you can rewrite it before drafting.
- **Archetype** drives Drafter's structural template:
  - `hybrid` (default) — tradeoff + verdict, modeled on Antonio's existing Sanity-CMS post. Maps to Mitchell's `building-block-economy` pattern.
  - `technical` — problem → why it exists → solution → verification → reflection. Heavy code. Maps to Mitchell's `simdutf-no-libcxx` / `tripwire` pattern.
  - `reflective` — narrative or opinion. Minimal or zero code. Maps to Mitchell's `ghostty-leaving-github` / `my-ai-adoption-journey` pattern.
- **Pitch** must end with the verdict. The verdict is what the post *argues*, not what it *covers*.
- **Source** lets you (or future-you) reconstruct the post from cold. Specific is better than general: `commit a3f4b2e in habit-flow, src/auth/middleware.ts` beats "auth refactor".
- **Code hooks** lets Drafter know which snippets to actually show. Without these, Drafter invents code; with these, Drafter shows real code from real files.
- **Status** is the kanban field. Source of truth. `blog-ideas.md` is sorted/grouped by it.

## Status meanings

- `idea` — Scout wrote it. Awaiting human review.
- `drafting` — Human picked it. Drafter will write it on the next pass.
- `drafted` — Drafter wrote it. Lives as a draft `blogPost` in Sanity Studio. Awaiting human publish.
- `published` — Human clicked Publish. Live on `/blog` (or will be, once the route is unhidden).
- `killed` — Human rejected. Kept in `blog-ideas.md` as a record. Do not delete killed cards — they prevent Scout from re-proposing the same idea on the next sweep.
