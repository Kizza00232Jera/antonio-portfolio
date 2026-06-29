import { client } from '@/lib/sanity/client'
import { LATEST_BLOG_POSTS_QUERY } from '@/lib/sanity/queries.defined'
import { formatDateMedium } from '@/utils/format'

// Live Sanity read; CDN-cached via the header below.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Tunables ───────────────────────────────────────────────────────────────
const W = 600
const ROW_H = 46
const HEAD_H = 44
const PAD_Y = 12
const ROW_DWELL_S = 1.8 // seconds the sweep highlight rests on each row
const MAX_ROWS = 5

// Three columns matching the portfolio blog list.
const COL_TITLE = 24
const COL_TAGS = 348
const COL_DATE = W - 24

type Post = {
  _id: string
  title?: string
  slug?: { current?: string }
  publishedAt?: string
  tags?: ({ name?: string } | null)[]
}

function escapeXml(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function truncate(v: string, max: number): string {
  return v.length > max ? v.slice(0, max - 1).trimEnd() + '…' : v
}

/** Each row brightens in turn, looping — the static echo of the site's hover dim. */
function sweepCss(n: number): string {
  if (n <= 1) return `.row{opacity:1}.tick{opacity:1}`
  const cycle = (n * ROW_DWELL_S).toFixed(2)
  const vis = 100 / n
  const fade = Math.min(3, vis * 0.25)
  const dim = `@keyframes rowSweep {
    0%{opacity:.45}
    ${fade.toFixed(2)}%{opacity:1}
    ${(vis - fade).toFixed(2)}%{opacity:1}
    ${vis.toFixed(2)}%{opacity:.45}
    100%{opacity:.45}
  }`
  const tick = `@keyframes tickSweep {
    0%{opacity:0}
    ${fade.toFixed(2)}%{opacity:1}
    ${(vis - fade).toFixed(2)}%{opacity:1}
    ${vis.toFixed(2)}%{opacity:0}
    100%{opacity:0}
  }`
  const delays = Array.from({ length: n }, (_, i) => {
    const d = (-(i * ROW_DWELL_S)).toFixed(2)
    return `.row.r${i}{animation-delay:${d}s}.tick.r${i}{animation-delay:${d}s}`
  }).join('')
  return `${dim}${tick}
  .row{opacity:.45;animation:rowSweep ${cycle}s infinite}
  .tick{opacity:0;animation:tickSweep ${cycle}s infinite}
  ${delays}`
}

function renderRow(p: Post, i: number): string {
  const y = HEAD_H + PAD_Y + i * ROW_H
  const baseline = y + ROW_H / 2 + 5
  const title = escapeXml(truncate(p.title ?? 'Untitled', 42))
  const tagNames = (p.tags ?? []).filter(Boolean).map((t) => t!.name).filter(Boolean) as string[]
  const tags = escapeXml(truncate(tagNames.join(', ') || '—', 26))
  const date = escapeXml(formatDateMedium(p.publishedAt))

  return `<g class="row r${i}">
    <rect class="tick r${i}" x="0" y="${y + 8}" width="3" height="${ROW_H - 16}" rx="1.5" fill="#3b82f6"/>
    <text x="${COL_TITLE}" y="${baseline}" class="rowtitle">${title}</text>
    <text x="${COL_TAGS}" y="${baseline}" class="mono rowtags">${tags}</text>
    <text x="${COL_DATE}" y="${baseline}" text-anchor="end" class="mono rowdate">${date}</text>
    <line x1="${COL_TITLE}" y1="${y + ROW_H}" x2="${W - 24}" y2="${y + ROW_H}" stroke="#1a2035"/>
  </g>`
}

export async function GET() {
  let posts: Post[] = []
  try {
    posts = (await client.fetch(LATEST_BLOG_POSTS_QUERY, { count: MAX_ROWS }, { stega: false })) as Post[]
  } catch {
    posts = []
  }

  const rows = posts.slice(0, MAX_ROWS)
  const H = HEAD_H + PAD_Y * 2 + Math.max(rows.length, 1) * ROW_H

  const body = rows.length
    ? rows.map((p, i) => renderRow(p, i)).join('\n')
    : `<text x="${W / 2}" y="${H / 2 + 20}" text-anchor="middle" class="mono rowtags">No posts yet</text>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Latest blog posts">
  <defs>
    <style>
      text{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
      .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
      .col{fill:#8a93a8;font-size:10px;letter-spacing:1.2px}
      .rowtitle{fill:#eef0f6;font-size:14px;font-weight:600}
      .rowtags{fill:#8a93a8;font-size:11px}
      .rowdate{fill:#8a93a8;font-size:11px}
      ${sweepCss(rows.length)}
    </style>
  </defs>
  <rect width="${W}" height="${H}" rx="16" fill="#0f1629" stroke="#1a2035"/>
  <!-- column headers -->
  <text x="${COL_TITLE}" y="28" class="mono col">TITLE</text>
  <text x="${COL_TAGS}" y="28" class="mono col">TAGS</text>
  <text x="${COL_DATE}" y="28" text-anchor="end" class="mono col">DATE</text>
  <line x1="${COL_TITLE}" y1="${HEAD_H}" x2="${W - 24}" y2="${HEAD_H}" stroke="#1a2035"/>
  ${body}
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  })
}
