---
title: Sanity schema — author contact fields, blogPost author reference, tags reference
type: AFK
priority: high
---

## Problem

Three schema gaps block all subsequent work:
1. The `author` document has no phone or email fields — contact info can't be sourced from Sanity.
2. `blogPost.author` is a plain string — no link to the author document, no single source of truth.
3. `blogPost.tags` is an array of strings — inconsistent with `project.tags` which already uses references to tag documents.
4. `blogPost.relatedPosts` is a manual array — being replaced by auto-calculation in a later issue.

## Desired behaviour

- `author` document has `phoneCroatian`, `phoneSwedish`, and `email` fields visible in Sanity Studio.
- `blogPost.author` is a reference field pointing to an `author` document.
- `blogPost.tags` is an array of references to `tag` documents (matching how `project.tags` works).
- `blogPost.relatedPosts` field is removed from the schema.
- Schema is deployed to Sanity cloud so the MCP and Studio reflect the changes.

## Acceptance criteria

- [x] `sanity/schemas/author.ts` has `phoneCroatian` (string), `phoneSwedish` (string), `email` (string) fields
- [x] `sanity/schemas/blogPost.ts` `author` field is `type: 'reference', to: [{ type: 'author' }]`
- [x] `sanity/schemas/blogPost.ts` `tags` field is `type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }]`
- [x] `relatedPosts` field removed from `sanity/schemas/blogPost.ts`
- [x] Schema deployed successfully with `npx sanity schema deploy`
- [x] `pnpm build` passes

## Deploy step (run manually)

All local schema files are updated and committed (65a8e6c). Run this to deploy to Sanity cloud:

```powershell
cd d:\github\antonio-portfolio\sanity
npx sanity schema deploy
```

Or from the repo root: `pnpm schema:deploy` (script added to package.json)

## Out of scope

- Do not migrate any existing Sanity data — data migration is handled manually (HITL).
- Do not update any GROQ queries or TypeScript types — those are separate issues.
- Do not touch any other schema files.

## Notes

Run schema deploy from the `sanity/` subdirectory with env vars explicitly set (they live in `.env.local` at the repo root, not in `sanity/`):

```powershell
cd d:\github\antonio-portfolio\sanity
$env:NEXT_PUBLIC_SANITY_PROJECT_ID="b7ue5jlq"
$env:NEXT_PUBLIC_SANITY_DATASET="production"
npx sanity schema deploy
```

Schema files are in `sanity/schemas/`. The `author.ts` and `blogPost.ts` files use `defineField` / `defineType` from `'sanity'`.

For `blogPost.tags`, match the exact pattern already used in `sanity/schemas/project.ts` for its `tags` field.
