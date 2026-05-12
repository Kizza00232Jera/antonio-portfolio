---
title: Write and publish blog post — Sanity CMS for a one-person portfolio
type: AFK
priority: normal
---

## Goal

Write and publish an opinion blog post about using Sanity CMS for a personal developer portfolio. Honest, balanced, first-person. The audience is developers considering a headless CMS for a similar project. Not a Sanity tutorial — an opinionated take on the tradeoff.

## Post spec

| Field | Value |
|---|---|
| Title | Sanity CMS for a one-person portfolio: overkill or the right call? |
| Slug | `sanity-cms-portfolio-worth-it` |
| Excerpt | Most developer portfolios are static files or a hard-coded array of projects. Mine fetches everything from a headless CMS. Here's whether that was worth it. |
| Tags | Sanity, Web Development, Web Design |
| Author | reference `465cfecb-034a-4f5c-8717-8fd37e61b172` |
| publishedAt | `2025-05-01T00:00:00Z` |

## Content brief

**Opening (~120 words):** Set the scene. The typical developer portfolio is a JSON file of projects, maybe a markdown blog. Simple, fast, gets the job done. This portfolio pulls everything — projects, blog posts, author info, site settings — from Sanity. That's a deliberate choice with real tradeoffs. Start with a mild provocation: "Is this overkill? Yes. Was it worth it? Also yes."

**What you actually get (~200 words):** Concrete benefits, not marketing copy:
- **Live content editing** without a deploy: update your tagline, add a project, fix a typo — no git commit, no Vercel rebuild. For a portfolio you update occasionally, this matters more than it sounds.
- **Structured data**: projects have typed fields (title, slug, tech stack refs, sections). Blog posts have portable text bodies. Tags are documents, not strings — so filtering and cross-referencing works properly. Explain what this enables: the blog filter, auto related posts, the project ordering system.
- **MCP access**: Sanity's MCP server means an AI agent can read and write content directly. That's how this portfolio is managed — an autonomous agent (Ralph) writes blog posts and creates project entries. Without structured CMS, that wouldn't be possible.
- **GROQ queries**: fetch exactly what you need, no over-fetching. One query gets the post, author, dereferenced tags, and related post candidates. Explain briefly why that's better than REST for content-heavy pages.

**What it costs (~200 words):** Be honest and specific:
- **Setup complexity**: schema definition, deploying the schema, wiring `sanityFetch` into Next.js, setting up `<SanityLive />` for cache invalidation. None of this is hard but it's 2–3 hours of config before you write a single piece of content.
- **Cold start / build complexity**: every page that fetches from Sanity adds a network call. With Next.js and proper caching (`sanityFetch` + CDN tags) this is a non-issue in production, but in development it's slower than reading a local file.
- **Another vendor**: Sanity is free at this scale but it's an external service. Your content lives in their database. If Sanity goes away, you export and migrate — but that's friction.
- **Overkill for purely static content**: if your portfolio never changes and you have no blog, a JSON file is genuinely better. Sanity earns its complexity when content changes frequently and when cross-referencing (tags, authors, related posts) matters.

**The call (~150 words):** Answer the title question directly. For a portfolio that:
- Has a regularly updated blog
- Cross-references content (tags, authors, related posts)
- Is managed by an AI agent or non-technical collaborator
- Needs live updates without redeploys

…Sanity is the right call. For a static "here are my 3 projects" portfolio, it's overkill.

The honest version: the author would make the same choice again. The structured data made building the blog filter, auto related posts, and the AI agent workflow significantly easier. The 3-hour setup paid back quickly.

**Closing (~80 words):** Brief. Link to the portfolio GitHub repo (the author can add it). One sentence on what you'd set up differently if starting over (e.g., deploy the schema before writing content — deploying it after is annoying).

## Sanity document format

Use PortableText blocks for body. Check the `blogPost` schema first with `get_schema` to confirm correct block types. Use `"style": "h2"` for section headings. No code blocks required for this post — it's opinion, not tutorial. But if a GROQ query example would help illustrate a point, include one.

## Tag IDs

Query `*[_type == "tag"]{ _id, name, "slug": slug.current }` to find IDs for Sanity, Web Development, Web Design.

## Acceptance criteria

- [ ] blogPost document created with correct slug, title, excerpt, tags, author ref
- [ ] Body contains: opening provocation, what you get (4 concrete benefits), what it costs (4 honest downsides), the direct answer to the title question, closing
- [ ] Document published
- [ ] Move issue to `issues/done/`

## Notes

No code changes. Sanity MCP only. Portfolio GitHub: https://github.com/Kizza00232Jera/antonio-portfolio
