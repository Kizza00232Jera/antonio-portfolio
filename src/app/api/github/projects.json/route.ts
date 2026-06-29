import { client } from '@/lib/sanity/client'

// Lists the projects that qualify for the profile README (both a live URL and a
// public repo), so the clickable per-project link row under the showcase image
// can be generated and kept in sync.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const QUERY = `*[_type == "project"
  && defined(githubUrl) && defined(liveUrl) && defined(coverImage)]
  | order(order asc) {
    "slug": slug.current, title
  }`

type Row = { slug?: string; title?: string }

export async function GET() {
  let rows: Row[] = []
  try {
    rows = (await client.fetch(QUERY, {}, { stega: false })) as Row[]
  } catch {
    rows = []
  }
  const projects = rows.filter((r) => r.slug && r.title)
  return Response.json(
    { projects },
    { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400' } },
  )
}
