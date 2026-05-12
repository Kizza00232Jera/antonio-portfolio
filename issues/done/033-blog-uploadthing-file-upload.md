---
title: Write and publish blog post — Uploadthing file upload
type: AFK
priority: normal
---

## Goal

Write and publish a blog post about Uploadthing as a file upload solution in Next.js, based on experience building the Recipe App. The tone is honest and developer-to-developer: here's what I tried, what worked, what didn't, and why I'd reach for it again.

## Post spec

| Field | Value |
|---|---|
| Title | Uploadthing is the file upload I stopped building myself |
| Slug | `uploadthing-file-upload-nextjs` |
| Excerpt | File uploads are one of those things that seem simple until you're debugging S3 presigned URLs at midnight. Uploadthing is the abstraction I didn't know I needed. |
| Tags | Next.js, Web App, Full Stack |
| Author | reference `465cfecb-034a-4f5c-8717-8fd37e61b172` |
| publishedAt | `2025-03-01T00:00:00Z` |

## Content brief

**Opening (~150 words):** Start with the problem. Rolling your own file upload in Next.js means: S3 bucket setup, IAM policies, presigned URL generation, client-side multipart logic, progress tracking, and validation on both ends. It's doable but it's not the interesting part of your app. Hook the reader with the specific pain point before introducing Uploadthing.

**What Uploadthing actually does (~200 words):** Explain the abstraction. You define a file router on the server — which routes exist, which file types they accept, max sizes, auth middleware. The client gets a typed uploader hook. Under the hood it handles the CDN, the presigned URLs, chunking, retries. Cover these key points:
- File router definition with type safety
- `auth` callback on each route for per-user authorization
- The client hook `useUploadThing` — progress, error, completion callbacks
- Files land on Uploadthing's CDN and you get back a URL to store

Include a code block showing a minimal file router:
```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next";
const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const user = await auth(); // Clerk or your auth
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.insert(images).values({ url: file.url, userId: metadata.userId });
    }),
} satisfies FileRouter;
```

**The security footgun (~150 words):** Client-side validation (file type, size) is UX, not security. Uploadthing validates on the server in the middleware, but the most important security boundary is the `auth` check in `.middleware()`. If you don't check authentication there, anyone with your endpoint URL can upload. Also: the URL Uploadthing returns is public by default — if you need private files, that's a separate concern Uploadthing doesn't solve for you. Be direct about this, not alarmist.

**Compared to the DIY approach (~200 words):** Briefly lay out what rolling your own on S3 looks like: `@aws-sdk/client-s3`, `getSignedUrl`, a POST endpoint to generate the URL, client-side fetch to PUT the file, a second call to confirm completion and store the URL. Total: ~100 lines across 3 files, plus IAM config. Uploadthing is ~40 lines total. The tradeoff: you're on their CDN, not your own infrastructure. For a side project or startup, that's fine. For enterprise with compliance requirements, you'd reconsider.

**When I'd skip it (~100 words):** Be honest. If you already have S3 in your stack and devops to manage it, Uploadthing adds a new vendor dependency for no gain. If you need private files with signed URLs, you'll want more control. If file storage cost is a concern at scale, you'll want to own the infrastructure. It's a great default for new projects; a harder sell if you're already set up.

**Closing (~100 words):** Short. Did it solve the problem? Yes. Would you use it again? Yes. What would make you switch away? Link to the Recipe App repo.

## Sanity document format

Use PortableText blocks for body. Check the `blogPost` schema first with `get_schema` to confirm the code block type (`code` or `codeBlock`). Use the correct type for code snippets.

Standard text block:
```json
{ "_type": "block", "_key": "unique-key", "style": "normal", "children": [{ "_type": "span", "_key": "unique-key-s", "text": "..." }] }
```

For headings use `"style": "h2"`.

## Tag IDs to use

Query `*[_type == "tag"]{ _id, name, "slug": slug.current }` to find the `_id` for Next.js, Web App, Full Stack. Use references: `{ "_type": "reference", "_ref": "<id>" }`.

## Acceptance criteria

- [ ] blogPost document created with correct slug, title, excerpt, tags, author ref
- [ ] Body contains: intro, what Uploadthing does (with code block), security footgun section, DIY comparison, when to skip it, closing
- [ ] At least one code block with the file router example
- [ ] Document published (not just draft)
- [ ] Move issue to `issues/done/`

## Notes

No code changes to the portfolio. Sanity MCP only. The Recipe App GitHub is https://github.com/Kizza00232Jera/my-recipe-app — reference it in the closing as the project this was built for.
