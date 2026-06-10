# Portfolio Domain Context

## Breakpoints

Three named viewport tiers used consistently across all CSS media queries and JavaScript checks:

| Name | Range | Typical devices |
|---|---|---|
| **mobile** | < 768px | phones |
| **tablet** | 768px – 1023px | iPad portrait, small laptop |
| **desktop** | ≥ 1024px | everything else |

**Rule:** CSS uses `max-width: 767px` for mobile-only rules, `min-width: 768px` for tablet-and-up, `min-width: 1024px` for desktop-only. JavaScript checks use `window.innerWidth < 768` for mobile, `< 1024` for tablet. There is no 769px threshold anywhere — that was an off-by-one that has been removed.

## Sections

The home page is composed of named sections in this order:

1. **Hero** — full-viewport intro with tech sphere globe (desktop) or panel carousel (mobile)
2. **Journey** — scroll-pinned timeline of five career stops (desktop) / stacked cards (mobile)
3. **Project Showcase** — scroll-driven split panel with featured projects (desktop) / stacked mobile cards (tablet and mobile)
4. **Latest Posts** — preview of recent blog posts
5. **Contact** — contact section

## Header Height

`--header-h: 5rem` (80px) is defined globally in `:root` and is the same on all breakpoints. The header's internal `padding-top: 2.5rem` sits inside that 80px — it is a layout choice, not part of `--header-h`. Any section that needs to clear the fixed header uses `padding-top: var(--header-h)`.

## Components (glossary in progress)

- **NavOverlay** — the full-screen navigation overlay, toggled by the MenuButton. Contains four links: Home, Projects, Blog, Contact. Contact links to `/#contact` so it works correctly from any route.
- **MenuButton** — the hamburger/menu toggle button. Visible on mobile only. Triggers NavOverlay via MenuContext.
- **useCarouselState** — a standalone hook that owns all Panel Carousel state: active panel index, dot index, auto-advance timer, reset-on-interaction. Public interface: `{ activePanel, goToPanel }`. See ADR-0002.
- **Panel Carousel** — the mobile-only hero UI. Two panels (About Me, Roles) with dot indicators and auto-advance. Panels slide horizontally — panel 2 (Roles) sits to the right of panel 1 (About Me) in the track. Swipe left or tap the right dot to advance; swipe right or tap the left dot to go back. Auto-advance loops (panel 2 → panel 1 → panel 2 …) at a 5-second interval. Any interaction resets the countdown timer; the timer always resumes after reset.
- **Tech Sphere** — the interactive 3D globe of tech items in the desktop Hero. Hidden on mobile; replaced entirely by the Panel Carousel.
- **Hero Height** — `100dvh` on all breakpoints. On mobile the wordmark has `padding-bottom: 2rem` to lift it off the screen edge.
- **Section Title** — the large full-width display-font divider between sections (e.g. "MY JOURNEY", "MY PROJECTS").
- **Journey Stop** — one entry in the career timeline. There are five stops (Multimedia Design, Mono, Web Dev, Decode, Stockholm).
- **Horizontal Project Card** — a portrait-aspect-ratio card used in the Projects listing horizontal scroll on desktop/tablet.
- **Mobile Project Card** — a landscape-aspect-ratio (4:3) card used in the Projects listing vertical scroll on mobile. Shows image, title, tagline, and tags. Tapping triggers the project transition animation.
- **Blog Row** — one entry in the blog list. Composed of three Blog Cells (title, tags, date) on desktop. Used identically in the home Latest Posts section and on `/blog`.
- **Cell Scramble** — the GSAP char-by-char scramble that runs on Blog Row hover. Distinct from the CSS-only char-reveal used in NavOverlay/Header — different mechanism, different timing. Lives in `BlogListClient.tsx`.
- **Hover Preview Image** — the cursor-following image that shows the active Blog Row's heroImage. Position is driven by a global `mousemove` listener via `gsap.quickTo` (matches the CustomCursor follow pattern). Desktop and pointer-fine only. Crossfades opacity when the active row changes; fades out on list mouseleave.

## Shared Utilities

All shared utility functions live in `src/utils/`. Co-located test files cover each one.

### Date formatting

Four named functions in `src/utils/format.ts` — each format was written independently across components and is now consolidated:

| Function | Output | Used for |
|---|---|---|
| `formatDateFull` | "15 January 2024" | Blog post page header |
| `formatDateMedium` | "15 Jan 2024" | Blog list rows |
| `formatDateShort` | "January 2024" | Project detail hero |
| `formatDateCompact` | "JAN 2024" | Project card annotations |

### Project media

`getThumbnailUrl(project)` in `src/utils/project.ts` — resolves Mux thumbnail URL (if muxVideoId present) or Sanity image URL (if coverImage present), returns null if neither.

## Testing Conventions

- **Test runner:** Vitest + React Testing Library
- **E2E:** Playwright
- **File location:** co-located — test files sit next to the file they test (e.g. `useCarouselState.test.ts` next to `useCarouselState.ts`)
- **What to test:** observable behaviour through public interfaces only — tests must survive internal refactors

## Agent workflow

- **AFK issue** — a task in `issues/` that Ralph can complete autonomously. Has clear acceptance criteria and no open design decisions.
- **HITL issue** — a task that requires a human decision before implementation. Ralph skips these.
- **Ralph** — the autonomous coding agent defined in `ralph/prompt.md`. Run via `ralph/once.sh` (single task) or `ralph/afk.sh` (loop). Job: implement issues.
- **Build Scribe** — a separate autonomous agent role responsible for blog work. Distinct from Ralph (different trigger, different output, different prompt). Has two modes: Scout and Drafter.
- **Scout** — the Build Scribe mode that reads recent work across all projects and produces a backlog of blog ideas. Output: cards appended to `blog-ideas.md`. Picky by design — aims for 8–15 well-formed ideas per project, not exhaustive coverage.
- **Drafter** — the Build Scribe mode that turns an approved blog idea into a full Sanity post. Output: a `blogPost` document in Sanity via the Sanity MCP, written as markdown and converted server-side.
- **Blog idea** — a card in `blog-ideas.md` representing a publishable blog pitch. Has Title, Archetype, Pitch (with verdict), Source, Code hooks, Status. Not the same as a "topic" — every blog idea must already commit to an angle and a verdict.
- **Blog archetype** — one of three structural patterns: **hybrid** (tradeoff + verdict, the default — matches existing posts), **technical** (problem → solution → verification, code-heavy), **reflective** (opinion or narrative, minimal code).
- **Voice anchor** — Mitchell Hashimoto's writing at `mitchellh.com/writing` used by Build Scribe as the primary voice model. Defines tone, paragraph rhythm, register, sentence variation, the punchy-short-then-long pattern, and the thesis-up-top structural habit. Canonical samples: `/writing/ghostty-leaving-github`, `/writing/simdutf-no-libcxx`, `/writing/building-block-economy`, `/writing/my-ai-adoption-journey`, `/writing/tripwire`.
- **Identity reference** — Antonio's three real blog posts in Sanity (`sanity-cms-portfolio-worth-it`, `podcast-summarizer-perplexity-ai`, `uploadthing-file-upload-nextjs`) used by Build Scribe to anchor *positioning* only: what stack, what domain, what kinds of decisions get blogged about, what level of technical depth fits. Not used for voice. All other `blogPost` documents in Sanity — the 19 "Why I Chose Next.js…" duplicates and the "first bl" stub — are visual placeholders, not references. They stay in the dataset until enough real posts replace them, but Scribe must explicitly exclude them.
- **Tracer bullet** — the smallest end-to-end slice of a feature that produces something visible and verifiable. Preferred as the first issue in any feature set.
