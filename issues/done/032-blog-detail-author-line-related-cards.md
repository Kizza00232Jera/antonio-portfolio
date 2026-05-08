---
title: Blog detail page — author line + related post cards
type: AFK
priority: normal
---

## Problem

The blog detail page header mixes date, author, and tags in a single `flex-wrap` row. Author GitHub/LinkedIn links are buried in the footer. Related posts are plain text links with no images.

## Desired behaviour

**Header metadata (two lines):**
- Line 1: `date · By Antonio · GitHub ↗ · LinkedIn ↗` — all on one line, separated by `·` dividers
- Line 2: tag chips (same pill style as now)

**Related posts section:**
- 3-column horizontal card grid on desktop, single column on mobile (`grid-cols-1 sm:grid-cols-3`)
- Each card: hero image at top (use `next/image`, aspect-ratio `16/9` or `3/2`), title below, date below title
- Card is a `<Link>` wrapping the whole card to `/blog/[slug]`
- Cards should match the site's dark theme — no bright backgrounds, subtle border or hover state

**Footer:**
- Remove the GitHub/LinkedIn author links from the footer (they move to the header line)
- Keep `View on GitHub ↗` and `View live app ↗` (these are post-specific links, not author links)
- Keep `← All blogs` link

## Files to change

### 1. `src/lib/sanity/queries.defined.ts`

Add `heroImage` to `RELATED_POSTS_QUERY`:

```ts
export const RELATED_POSTS_QUERY = defineQuery(
  `*[_type == "blogPost" && slug.current != $slug && count(tags[]._ref[@ in $tagIds]) > 0]
  | order(publishedAt desc)[0...10] {
    _id, title, slug, publishedAt, heroImage,
    tags[]->{ _id }
  }`
)
```

### 2. `src/lib/sanity/queries.ts`

Add `heroImage` to the `RelatedPost` type:

```ts
export type RelatedPost = {
  _id: string
  title: string
  slug: SanitySlug
  publishedAt: string
  heroImage?: SanityImage | null
}
```

`SanityImage` is already imported/defined in `src/lib/sanity/types.ts` — use the same import pattern as the rest of the file.

### 3. `src/app/(site)/blog/[slug]/page.tsx`

**Header section** — replace the current single `flex-wrap` metadata row with two separate rows:

```tsx
<header className="mb-12 text-center">
  <h1 ...>{post.title}</h1>

  {/* Row 1: date · By Antonio · GitHub ↗ · LinkedIn ↗ */}
  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-text-muted mt-4">
    {post.publishedAt && (
      <time className="font-ui" dateTime={post.publishedAt}>
        {formatDateFull(post.publishedAt)}
      </time>
    )}
    {post.author && (
      <>
        <span aria-hidden>·</span>
        <span className="font-ui">By {post.author.name}</span>
      </>
    )}
    {post.author?.githubUrl && (
      <>
        <span aria-hidden>·</span>
        <a href={post.author.githubUrl} target="_blank" rel="noopener noreferrer"
           className="... hover underline style">
          GitHub ↗
        </a>
      </>
    )}
    {post.author?.linkedinUrl && (
      <>
        <span aria-hidden>·</span>
        <a href={post.author.linkedinUrl} target="_blank" rel="noopener noreferrer"
           className="... hover underline style">
          LinkedIn ↗
        </a>
      </>
    )}
  </div>

  {/* Row 2: tags */}
  {post.tags && post.tags.filter(Boolean).length > 0 && (
    <div className="flex flex-wrap justify-center gap-2 mt-3">
      {post.tags.filter(Boolean).map((tag) => (
        <span key={tag._id}
          className="rounded-full border border-border px-3 py-0.5 font-ui text-xs">
          {tag.name}
        </span>
      ))}
    </div>
  )}

  {post.excerpt && (
    <p className="mt-6 ...">{post.excerpt}</p>
  )}
</header>
```

Match the existing link/hover styles from the rest of the file (`text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors`).

**Related posts section** — replace the `<ul>` text list with a card grid:

```tsx
{relatedPosts.length > 0 && (
  <section className="mt-16 pt-8 border-t border-border">
    <h2 className="font-heading text-lg font-semibold text-text mb-6">Related posts</h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {relatedPosts.map((rp) => (
        <Link
          key={rp._id}
          href={`/blog/${rp.slug.current}`}
          className="group flex flex-col border border-border rounded-lg overflow-hidden hover:border-accent transition-colors"
        >
          <div className="relative aspect-video bg-surface overflow-hidden">
            {rp.heroImage ? (
              <Image
                src={urlFor(rp.heroImage).width(600).height(338).quality(80).url()}
                alt={rp.title}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-surface-raised" />
            )}
          </div>
          <div className="p-4 flex flex-col gap-1">
            <p className="font-ui text-sm font-medium text-text leading-snug line-clamp-2">
              {rp.title}
            </p>
            {rp.publishedAt && (
              <time className="font-ui text-xs text-text-muted" dateTime={rp.publishedAt}>
                {formatDateFull(rp.publishedAt)}
              </time>
            )}
          </div>
        </Link>
      ))}
    </div>
  </section>
)}
```

Add `import Image from 'next/image'` and `import { urlFor } from '@/lib/sanity/image'` at the top if not already present.

**Footer** — remove the `post.author?.githubUrl` and `post.author?.linkedinUrl` links (they now live in the header). Keep `post.githubUrl`, `post.appUrl`, and the `← All blogs` link.

## Acceptance criteria

- [ ] Header line 1: date · By [name] · GitHub ↗ · LinkedIn ↗ all on one row (items hidden when null)
- [ ] Header line 2: tag chips, same style as before
- [ ] Author GitHub/LinkedIn removed from footer
- [ ] Related posts render as 3-column card grid on sm+ screens, 1-column on mobile
- [ ] Each card has hero image (fallback empty div when no image), title, date
- [ ] Whole card is a link to the post
- [ ] `pnpm build` passes

## Notes

No Sanity data changes. Code only. Commit when build passes.
