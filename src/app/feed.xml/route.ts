import { client } from '@/lib/sanity/client'
import { ALL_BLOG_POSTS_QUERY } from '@/lib/sanity/queries.defined'
import { SITE } from '@/lib/seo'

// Revalidate hourly; the publish webhook also revalidates on demand.
export const revalidate = 3600

type FeedPost = {
  title?: string
  slug?: { current?: string }
  publishedAt?: string
  excerpt?: string
  author?: { name?: string } | null
}

/** Minimal XML-escaping for values placed inside CDATA-free positions. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const posts = (await client.fetch(
    ALL_BLOG_POSTS_QUERY,
    {},
    { stega: false },
  )) as FeedPost[]

  const items = (posts ?? [])
    .filter((p) => p.slug?.current)
    .map((p) => {
      const url = `${SITE.url}/blog/${p.slug!.current}`
      const pubDate = p.publishedAt
        ? new Date(p.publishedAt).toUTCString()
        : new Date(0).toUTCString()
      return `    <item>
      <title><![CDATA[${p.title ?? 'Untitled'}]]></title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      ${p.author?.name ? `<dc:creator><![CDATA[${p.author.name}]]></dc:creator>` : ''}
      <description><![CDATA[${p.excerpt ?? ''}]]></description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE.name)} — Blog</title>
    <link>${SITE.url}/blog</link>
    <description>${escapeXml(SITE.defaultDescription)}</description>
    <language>en</language>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
