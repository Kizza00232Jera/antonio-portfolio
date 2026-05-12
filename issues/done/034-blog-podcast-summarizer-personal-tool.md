---
title: Write and publish blog post — building a personal tool with Perplexity AI
type: AFK
priority: normal
---

## Goal

Write and publish a story-driven blog post about building the Podcast Summarizer — a personal tool the author uses every day. Tone: genuine, first-person, honest about the problem it solves and the decisions behind it. Less tutorial, more "here's why I built this and what I learned."

## Post spec

| Field | Value |
|---|---|
| Title | I built a tool I use every day: Podcast Summarizer with Perplexity AI |
| Slug | `podcast-summarizer-perplexity-ai` |
| Excerpt | I watch podcasts across tech, football, and business — and a week later I can barely recall the key points. So I built a tool that turns any YouTube podcast into a structured, searchable article. I use it every day. |
| Tags | AI, Next.js, Web App |
| Author | reference `465cfecb-034a-4f5c-8717-8fd37e61b172` |
| publishedAt | `2025-04-01T00:00:00Z` |

## Content brief

**Opening — the problem (~150 words):** Be specific and personal. The author watches different podcasts daily — tech, football, business. The problem: a week later, in a conversation, they can't remember the key points. They'd want to quickly scan what a podcast covered before a discussion. Existing tools either don't exist for this use case or are generic. The frustration is real. End the opening with: so I built it myself.

**What it does (~150 words):** Paste a YouTube URL. Perplexity AI reads the transcript and generates a structured article: sections with headings, a few direct quotes, tags. The output is searchable. The library grows over time. Brief, no fluff. Include a sentence about the live app URL: https://podcast-blog-v2.vercel.app

**The AI part — Perplexity sonar-reasoning-pro (~200 words):** This is the most interesting section. The model choice: `sonar-reasoning-pro`. Why: powerful enough for quality output, cheap enough to not think about cost — each summary costs roughly €0.01. Cover the prompt engineering angle: without constraints, AI summaries are generic ("The speakers discussed..."). The system prompt enforces: specific headings, minimum section length, 2–3 direct quotes, no padding. Show the structure of the system prompt (not necessarily word for word, but the key constraints). Include a code block showing the API call structure:

```typescript
const response = await fetch("https://api.perplexity.ai/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "sonar-reasoning-pro",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Summarize this podcast: ${youtubeUrl}` },
    ],
  }),
});
```

**Supabase as the whole backend (~150 words):** One service for auth, database, and session management. GitHub OAuth + email/password. Sessions via HTTP-only cookies with `@supabase/ssr`. The database uses a JSONB column for the article body — storing sections, headings, and content as structured JSON rather than flat text. Why JSONB: flexible schema for AI-generated content that can vary in structure. Keep this section factual and brief.

**The "personal tool" philosophy (~150 words):** This is the most opinionated section. There's a specific kind of project that's worth finishing: one you'll actually use. Most side projects die because the motivation is learning or showing off, not solving a real problem you have. The Podcast Summarizer is different — the author uses it after every podcast. That usage is the best forcing function for polish: you notice bugs, you fix rough edges, you add the feature you actually need. Write this in first person, direct. No advice-column tone — just what it felt like.

**Closing (~100 words):** Brief. Link to GitHub: https://github.com/Kizza00232Jera/podcast-blog-v2 and the live app. One sentence on what you'd build next if you kept iterating.

## Sanity document format

Use PortableText blocks for body. Check the `blogPost` schema first with `get_schema` to confirm the code block type. Use `"style": "h2"` for section headings.

## Tag IDs

Query `*[_type == "tag"]{ _id, name, "slug": slug.current }` to find IDs for AI, Next.js, Web App.

## Acceptance criteria

- [ ] blogPost document created with correct slug, title, excerpt, tags, author ref
- [ ] Body contains: problem opening, what it does, Perplexity/prompt engineering section (with code block), Supabase backend section, personal tool philosophy section, closing
- [ ] At least one code block
- [ ] Document published
- [ ] Move issue to `issues/done/`

## Notes

No code changes. Sanity MCP only. Project GitHub: https://github.com/Kizza00232Jera/podcast-blog-v2
