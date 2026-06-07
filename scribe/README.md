# Scribe

Build Scribe is the agent role responsible for blog work on this portfolio. See `CONTEXT.md` (repo root) for the full glossary — this README is the operating manual.

Scribe has two modes:

- **Scout** — reads recent work across all projects in `projects.json` and produces blog idea cards in `blog-ideas.md`. Picky by design: 8–15 well-formed ideas per project, not exhaustive coverage.
- **Drafter** — reads cards in `blog-ideas.md` marked `Status: drafting` and writes them out as `blogPost` documents in Sanity (as drafts, via Sanity MCP).

Voice anchor is Mitchell Hashimoto (`mitchellh.com/writing`). Identity reference is Antonio's three real Sanity posts. The rest of the Sanity dataset is placeholder content and ignored.

## File map

| File | Owned by | Purpose |
|---|---|---|
| `README.md` | human | this file |
| `projects.json` | human | manifest mapping project slug → local repo path. Scribe reads this to know where each project's code lives. |
| `card-template.md` | human | the canonical shape of a blog idea card. Both Scout and Drafter read this. |
| `blog-ideas.md` | shared | the kanban. Scout appends new cards. Human moves cards between statuses. Drafter consumes `drafting` cards. |
| `scout.md` | human | Scout's system prompt. Embeds voice/identity references, card format, picky filter. |
| `scout.ps1` | human | PowerShell wrapper that boots Claude Code with `scout.md` + injects context. |
| `draft.md` | human | Drafter's system prompt. Embeds voice/identity references, markdown→Sanity MCP contract, archetype templates. |
| `draft.ps1` | human | PowerShell wrapper that boots Claude Code with `draft.md`. Processes one card per run. |

## Workflow

1. Keep `projects.json` up to date when you start a new project (one line per project). Keys are project identifiers — they should match a Sanity project slug when there is one. Projects without a matching Sanity slug (e.g. side projects not on the portfolio) are still valid: Scribe treats them as scout-only and won't try to link a portfolio page from the post.
2. **Scout pass** — run `scout.ps1`. Scribe reads each project's README, recent `git log`, and key files, then appends new cards to `blog-ideas.md` with `Status: idea`.
3. **Pick** — read the backlog. For each idea you want written, change its `Status: idea` to `Status: drafting`. Kill ones you don't want with `Status: killed` (don't delete them — kept ones are a record of what's been considered).
4. **Drafter pass** — run `draft.ps1`. Scribe reads every card with `Status: drafting`, writes each as markdown, pushes via Sanity MCP. Each lands as a draft `blogPost` in Sanity Studio. Drafter then updates the card to `Status: drafted`.
5. **Review and publish** — open Sanity Studio. Skim each draft. If good, click Publish. If it needs edits, edit then publish. If it's bad, delete the draft and change the card's status back to `idea` (or kill it).

## Rules Scribe must follow

- Voice = Mitchell. Always. Identity reference = Antonio's three real posts only.
- The 19 "Why I Chose Next.js…" duplicates and the "first bl" stub in Sanity are not references. They are placeholders and must be ignored.
- Picky over exhaustive. If an idea can't pass the "would a stranger learn something?" bar, leave it out.
- Every card commits to a verdict in the pitch. No bare topics.
- Drafter writes drafts only, never publishes. The Publish click is the human's review gate.

## Not automated yet

Both `scout.sh` and `draft.sh` are run manually. The prompts are written so they could be moved into a git hook or scheduled job later without restructuring — but for now they're explicit, human-triggered passes.
