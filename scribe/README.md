# Scribe

Build Scribe is the agent role responsible for blog work on this portfolio. See `CONTEXT.md` (repo root) for the full glossary — this README is the operating manual.

Scribe has three modes:

- **Scout** — autonomous. Reads recent work across all projects in `projects.json` and produces blog idea cards in `blog-ideas.md`. Picky by design: 8–15 well-formed ideas per project, not exhaustive coverage. Use when you want a backlog generated from your code.
- **Intake** — interactive. You say "I want to write about X," and Scribe interviews you to turn that into one well-formed card with `Status: drafting`. Use when you already know what you want to write and want Scribe's help shaping the pitch.
- **Drafter** — autonomous. Reads cards in `blog-ideas.md` marked `Status: drafting` and writes them out as `blogPost` documents in Sanity (as drafts, via Sanity MCP). Processes one card per run.

Two voice anchors. Three archetypes (`hybrid`, `technical`, `reflective`) use Mitchell Hashimoto (`mitchellh.com/writing`) — developer-targeted, confident, no warmth fillers. The fourth (`explainer`) uses Julia Evans (`jvns.ca`) — friendly, accessible to non-developers, headings as questions. Identity reference (what topics, what depth) is always Antonio's three real Sanity posts. The rest of the Sanity dataset is placeholder content and ignored.

## File map

| File | Owned by | Purpose |
|---|---|---|
| `README.md` | human | this file |
| `projects.json` | human | manifest mapping project slug → local repo path. Scribe reads this to know where each project's code lives. |
| `card-template.md` | human | the canonical shape of a blog idea card. Both Scout and Drafter read this. |
| `blog-ideas.md` | shared | the kanban. Scout appends new cards. Human moves cards between statuses. Drafter consumes `drafting` cards. |
| `scout.md` | human | Scout's system prompt. Embeds voice/identity references, card format, picky filter. |
| `scout.ps1` | human | PowerShell wrapper that boots Claude Code with `scout.md` + injects context. |
| `intake.md` | human | Intake's system prompt. The eight-question interview that turns one of your blog requests into a card with `Status: drafting`. |
| `intake.ps1` | human | PowerShell wrapper that boots Claude Code with `intake.md`. |
| `draft.md` | human | Drafter's system prompt. Embeds voice/identity references, Portable Text contract, archetype templates (including `explainer`), slop-word ban. |
| `draft.ps1` | human | PowerShell wrapper that boots Claude Code with `draft.md`. Processes one card per run. |
| `unsplash-search.mjs` | human | Node script that searches Unsplash across one or more query variants, pools/dedupes candidates, downloads ~12 thumbnails to `scribe/.unsplash-cache/`, and prints a JSON manifest (id, alt, tags, color, thumb path). Touches Unsplash only, never Sanity. Drafter views the thumbnails and picks the best fit. |
| `unsplash-apply.mjs` | human | Node script that applies a SPECIFIC hand-picked Unsplash photo (by id or URL): downloads it, uploads to Sanity, and patches `heroImage`. Drafter calls this with the id it chose from `unsplash-search.mjs`. |
| `unsplash-upload.mjs` | human | Legacy: searches Unsplash and uploads the top result blindly. Superseded by the search → look → apply flow (`unsplash-search.mjs` + `unsplash-apply.mjs`). Kept for one-shot use. |

## Workflow

There are two entry points into the backlog — Scout for code-driven discovery, Intake for human-driven requests — and one writer at the back end.

1. Keep `projects.json` up to date when you start a new project (one line per project). Keys are project identifiers — they should match a Sanity project slug when there is one. Projects without a matching Sanity slug (e.g. side projects not on the portfolio) are still valid: Scribe treats them as scout-only and won't try to link a portfolio page from the post.
2. **Scout pass (when you want ideas surfaced from your code)** — run `scout.ps1`. Scribe reads each project's README, recent `git log`, and key files, then appends new cards to `blog-ideas.md` with `Status: idea`. Pick what you want — flip `Status: idea` to `Status: drafting`, kill the rest with `Status: killed` (keep them as a record).
3. **Intake pass (when you already know what you want to write)** — run `intake.ps1`. Scribe interviews you (eight questions) and writes one card directly to `Status: drafting`. Skip Scout entirely for this path.
4. **Drafter pass** — run `draft.ps1`. Scribe picks the topmost card with `Status: drafting`, writes the post, pushes via Sanity MCP, attaches an Unsplash hero, then updates the card to `Status: drafted`. One card per run by design — repeat for each draft.
5. **Review and publish** — open Sanity Studio. Skim each draft. If good, click Publish. If it needs edits, edit then publish. If it's bad, delete the draft and change the card's status back to `idea` (or kill it).

## Rules Scribe must follow

- Voice = Mitchell for `hybrid`/`technical`/`reflective`, Julia for `explainer`. Always.
- Identity reference = Antonio's three real posts only. The 19 "Why I Chose Next.js…" duplicates and the "first bl" stub in Sanity are placeholders and must be ignored.
- Picky over exhaustive. If an idea can't pass the "would a stranger learn something?" bar (or for `explainer`, "would a non-developer get value?"), leave it out.
- Every card commits to a take in the pitch. No bare topics.
- All archetypes target 1,200–2,500 words of prose per post. No code in the word count.
- Slop-word ban (`leverage`, `seamless`, `delve`, etc. — full list in `draft.md`) applies to every archetype.
- Drafter writes drafts only, never publishes. The Publish click is the human's review gate.

## Not automated yet

Both `scout.sh` and `draft.sh` are run manually. The prompts are written so they could be moved into a git hook or scheduled job later without restructuring — but for now they're explicit, human-triggered passes.
