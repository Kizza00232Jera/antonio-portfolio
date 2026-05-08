---
title: Auto related posts — replace manual relatedPosts with tag-based calculation
type: AFK
priority: normal
---

## Problem

The blog post detail page shows a "Related posts" section sourced from a manually curated `relatedPosts` field in Sanity. Nobody has filled this in, so it never renders. The field should be replaced with automatic calculation: find posts that share the most tags with the current post.

## Desired behaviour

At the bottom of every blog post, up to 3 related posts are shown automatically. Posts sharing the most tags with the current one appear first. If two posts share the same number of tags, the more recently published one wins. If no posts share any tags, the section is hidden.

## Acceptance criteria

- [ ] `BLOG_POST_BY_SLUG_QUERY` no longer includes `relatedPosts`
- [ ] A new `RELATED_POSTS_QUERY` is added to `src/lib/sanity/queries.defined.ts` that fetches posts sharing at least one tag with the current post, excluding the current post itself, ordered by `publishedAt desc`, limited to 10 candidates
- [ ] A new `getRelatedPosts(slug: string, tagIds: string[])` function is added to `src/lib/sanity/queries.ts`
- [ ] TypeScript ranking function: sort candidates by shared tag count descending, then `publishedAt` descending, slice to 3
- [ ] `BlogPost.relatedPosts` removed from `src/lib/sanity/types.ts`
- [ ] Blog post detail page (`app/(site)/blog/[slug]/page.tsx`) calls `getRelatedPosts` with the current post's tag IDs and renders the result
- [ ] Related posts section is hidden when the result is empty
- [ ] Related posts UI matches the existing related posts list style (title + ↗ arrow link)
- [ ] `pnpm build` passes

## Out of scope

- Do not add hero images or excerpts to the related posts list — title + link only, matching current style.
- Do not add pagination.
- Do not change the related posts CSS.

## Notes

The GROQ query for candidates uses `references()` to find posts sharing at least one tag. Pass the current post's tag `_id` values as the `$tagIds` parameter:

```groq
*[_type == "blogPost" && slug.current != $slug && count(tags[]._ref[@ in $tagIds]) > 0]
| order(publishedAt desc)[0...10] {
  _id, title, slug, publishedAt,
  tags[]->{ _id }
}
```

TypeScript ranking (run after fetching candidates):
```ts
candidates
  .map(p => ({
    ...p,
    sharedCount: p.tags?.filter(t => tagIds.includes(t._id)).length ?? 0
  }))
  .sort((a, b) => b.sharedCount - a.sharedCount || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  .slice(0, 3)
```

The tag IDs to pass are `post.tags?.map(t => t._id) ?? []` from the already-fetched post.

## Blocked by

- Issue 021 (schema — relatedPosts removed, tags as references)
- Issue 026 (must run after 026 since tags are now objects with `_id`)
