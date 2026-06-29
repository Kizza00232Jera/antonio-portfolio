import { client } from '@/lib/sanity/client'
import { formatDateMedium } from '@/utils/format'

// Live Sanity read; CDN-cached via the header below.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Layout ───────────────────────────────────────────────────────────────────
const W = 600
const PAD = 24
const CW = W - PAD * 2 // content width
const MAX_POSTS = 5

const ACCENT = '#3b82f6'
const TEXT = '#eef0f6'
const MUTED = '#8a93a8'
const BORDER = '#1a2035'

// Deterministic chip colors so a given tag always reads the same.
const TAG_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']

const QUERY = `{
  "posts": *[_type == "blogPost"] | order(publishedAt desc)[0...$count]{
    _id, title, "slug": slug.current, publishedAt, excerpt, "tags": tags[]->name
  },
  "total": count(*[_type == "blogPost"])
}`

type Post = {
  _id: string
  title?: string
  slug?: string
  publishedAt?: string
  excerpt?: string
  tags?: (string | null)[]
}
type Data = { posts: Post[]; total: number }

// ── Helpers ──────────────────────────────────────────────────────────────────

function escapeXml(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Greedy word-wrap. maxWidth in px, fontSize in px, factor ≈ avg glyph/em.
 *  Conservative factor so titles wrap slightly early rather than overflow. */
function wrapLines(text: string, maxWidth: number, fontSize: number, factor: number): string[] {
  const maxChars = Math.max(8, Math.floor(maxWidth / (fontSize * factor)))
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if (!cur) cur = w
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w
    else { lines.push(cur); cur = w }
  }
  if (cur) lines.push(cur)
  return lines
}

function tagColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return TAG_COLORS[h % TAG_COLORS.length]
}

/** A colored tag pill; returns its markup and rendered width. */
function chip(label: string, x: number, y: number): { svg: string; w: number } {
  const color = tagColor(label)
  const w = Math.round(label.length * 6.6 + 18)
  const svg = `<g transform="translate(${x} ${y})">
    <rect width="${w}" height="22" rx="11" fill="${color}" fill-opacity="0.16"/>
    <text x="${w / 2}" y="15" text-anchor="middle" class="mono" font-size="11" fill="${color}">${escapeXml(label)}</text>
  </g>`
  return { svg, w }
}

// ── Sections ─────────────────────────────────────────────────────────────────

/** Featured (newest) post. Returns markup and the y where the next block starts. */
function renderFeatured(p: Post, startY: number): { svg: string; y: number } {
  const out: string[] = []
  const title = p.title ?? 'Untitled'
  const date = escapeXml(formatDateMedium(p.publishedAt))
  let y = startY

  // label + date row
  out.push(`<rect x="${PAD}" y="${y - 9}" width="3" height="13" rx="1.5" fill="${ACCENT}"/>`)
  out.push(`<text x="${PAD + 10}" y="${y + 2}" class="mono label">LATEST</text>`)
  out.push(`<text x="${W - PAD}" y="${y + 2}" text-anchor="end" class="mono meta">${date}</text>`)
  y += 22

  // title (full, wrapped)
  const tLines = wrapLines(title, CW, 22, 0.58)
  tLines.forEach((ln, i) => out.push(`<text x="${PAD}" y="${y + 21 + i * 29}" class="ftitle">${escapeXml(ln)}</text>`))
  y += tLines.length * 29 + 6

  // excerpt (max 2 lines)
  if (p.excerpt) {
    const eAll = wrapLines(p.excerpt, CW, 13, 0.54)
    const eLines = eAll.slice(0, 2)
    if (eAll.length > 2) eLines[1] = eLines[1].replace(/[.,;:]?\s*\S*$/, '') + ' …'
    eLines.forEach((ln, i) => out.push(`<text x="${PAD}" y="${y + 12 + i * 19}" class="excerpt">${escapeXml(ln)}</text>`))
    y += eLines.length * 19 + 12
  }

  // tag chips
  const tags = (p.tags ?? []).filter(Boolean).slice(0, 3) as string[]
  if (tags.length) {
    let cx = PAD
    for (const t of tags) {
      const c = chip(t, cx, y)
      out.push(c.svg)
      cx += c.w + 8
    }
    y += 22 + 16
  } else {
    y += 8
  }

  // divider
  out.push(`<line x1="${PAD}" y1="${y}" x2="${W - PAD}" y2="${y}" stroke="${BORDER}"/>`)
  y += 18

  return { svg: out.join('\n'), y }
}

/** A slim list row with a fully-wrapped title. */
function renderRow(p: Post, startY: number): { svg: string; y: number } {
  const out: string[] = []
  const title = p.title ?? 'Untitled'
  const date = escapeXml(formatDateMedium(p.publishedAt))
  const titleW = CW - 96 // leave room for the date on the right

  const lines = wrapLines(title, titleW, 15, 0.56)
  const rowH = Math.max(lines.length * 20, 20) + 14

  lines.forEach((ln, i) => out.push(`<text x="${PAD}" y="${startY + 15 + i * 20}" class="rtitle">${escapeXml(ln)}</text>`))
  out.push(`<text x="${W - PAD}" y="${startY + 15}" text-anchor="end" class="mono meta">${date}</text>`)
  out.push(`<line x1="${PAD}" y1="${startY + rowH - 4}" x2="${W - PAD}" y2="${startY + rowH - 4}" stroke="${BORDER}"/>`)

  return { svg: out.join('\n'), y: startY + rowH }
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function GET() {
  let data: Data = { posts: [], total: 0 }
  try {
    data = (await client.fetch(QUERY, { count: MAX_POSTS }, { stega: false })) as Data
  } catch {
    data = { posts: [], total: 0 }
  }

  const posts = (data.posts ?? []).slice(0, MAX_POSTS)

  if (!posts.length) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="120" viewBox="0 0 ${W} 120">
      <rect width="${W}" height="120" rx="16" fill="#0f1629" stroke="${BORDER}"/>
      <text x="${W / 2}" y="66" text-anchor="middle" fill="${MUTED}" font-family="ui-monospace,monospace" font-size="14">No posts yet</text>
    </svg>`
    return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=120' } })
  }

  const body: string[] = []
  let y = 34

  const feat = renderFeatured(posts[0], y)
  body.push(feat.svg)
  y = feat.y

  for (const p of posts.slice(1)) {
    const r = renderRow(p, y)
    body.push(r.svg)
    y = r.y
  }

  // footer stat line: total count + a few topics pulled from the latest posts
  const topics = Array.from(
    new Set(posts.flatMap((p) => (p.tags ?? []).filter(Boolean) as string[])),
  ).slice(0, 3)
  const footer = `${data.total} post${data.total === 1 ? '' : 's'}${topics.length ? ' · ' + topics.join(' · ') : ''}`
  y += 12
  body.push(`<text x="${PAD}" y="${y + 4}" class="mono foot">${escapeXml(footer)}</text>`)
  body.push(`<text x="${W - PAD}" y="${y + 4}" text-anchor="end" class="mono foot">read more →</text>`)
  y += 22

  const H = y

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Latest writing">
  <defs>
    <style>
      text{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
      .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
      .label{fill:${ACCENT};font-size:11px;font-weight:600;letter-spacing:1.5px}
      .meta{fill:${MUTED};font-size:11px}
      .ftitle{fill:${TEXT};font-size:22px;font-weight:700}
      .excerpt{fill:${MUTED};font-size:13px}
      .rtitle{fill:${TEXT};font-size:15px;font-weight:600}
      .foot{fill:${MUTED};font-size:11px}
    </style>
  </defs>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="#0f1629" stroke="${BORDER}"/>
  ${body.join('\n')}
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  })
}
