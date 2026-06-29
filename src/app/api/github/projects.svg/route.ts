import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import type { SanityImage } from '@/lib/sanity/types'

// Live status pings + inlined images make this render genuinely dynamic, so it
// can't be statically cached at build. The Cache-Control header below keeps it
// cheap (Vercel CDN + GitHub's camo proxy both honor it).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Tunables ───────────────────────────────────────────────────────────────
const CARD_W = 600
const CARD_H = 360
const PER_SLIDE_S = 3.4 // seconds each project is on screen
const PING_TIMEOUT_MS = 4500

// ── Data ─────────────────────────────────────────────────────────────────────

// The gate: a project shows up only when it carries BOTH a public repo and a
// live URL. Fill both in Sanity and it appears here automatically; drop either
// and it disappears. No second list to maintain.
const QUERY = `*[_type == "project"
  && defined(githubUrl) && defined(liveUrl) && defined(coverImage)]
  | order(order asc) {
    _id, title, tagline, coverImage,
    "tech": techStackRefs[]->name,
    githubUrl, liveUrl, publishedAt
  }`

type ProjectRow = {
  _id: string
  title?: string
  tagline?: string
  coverImage?: SanityImage
  tech?: (string | null)[]
  githubUrl?: string
  liveUrl?: string
  publishedAt?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

/** Strip protocol + www + trailing slash so a live URL reads as a clean domain. */
function prettyHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

function prettyRepo(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\/+|\/+$/g, '') || prettyHost(url)
  } catch {
    return url
  }
}

/** Is the live site reachable right now? Network error or timeout ⇒ down. */
async function isUp(url: string): Promise<boolean> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), PING_TIMEOUT_MS)
  try {
    // Some hosts reject HEAD; fall back to a lightweight GET on failure.
    let res: Response
    try {
      res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, redirect: 'follow', cache: 'no-store' })
    } catch {
      res = await fetch(url, { method: 'GET', signal: ctrl.signal, redirect: 'follow', cache: 'no-store' })
    }
    // 401/403 = alive but gated; anything below 500 means the server answered.
    return res.status < 500
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

/** Fetch a Sanity cover and inline it as a data URI (SVG-as-<img> blocks
 *  external image loads, so embedding is the only way it renders on GitHub). */
async function inlineCover(img: SanityImage): Promise<string | null> {
  try {
    const url = urlFor(img).width(560).height(300).fit('crop').format('jpg').quality(78).url()
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return `data:image/jpeg;base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

// ── Slide rendering ──────────────────────────────────────────────────────────

type Slide = ProjectRow & { up: boolean; cover: string | null }

function renderSlide(p: Slide, i: number, total: number): string {
  const PAD = 24
  const title = escapeXml(truncate(p.title ?? 'Untitled', 30))
  const tagline = p.tagline ? escapeXml(truncate(p.tagline, 58)) : ''
  const host = escapeXml(prettyHost(p.liveUrl ?? ''))
  const repo = escapeXml(truncate(prettyRepo(p.githubUrl ?? ''), 28))
  const tech = (p.tech ?? []).filter(Boolean).slice(0, 4) as string[]

  const dot = p.up ? '#34d399' : '#f87171'
  const statusLabel = p.up ? 'LIVE' : 'OFFLINE'

  // Tech pills laid out left-to-right, width estimated from glyph count.
  let tx = PAD
  const pills = tech
    .map((t) => {
      const label = escapeXml(t)
      const w = label.length * 7.2 + 18
      const pill = `<g transform="translate(${tx} 300)">
        <rect width="${w.toFixed(0)}" height="22" rx="11" fill="#0b1020" stroke="#1a2035"/>
        <text x="${(w / 2).toFixed(0)}" y="15" text-anchor="middle" class="mono pill">${label}</text>
      </g>`
      tx += w + 8
      return pill
    })
    .join('')

  const coverEl = p.cover
    ? `<image href="${p.cover}" x="20" y="20" width="560" height="190"
         preserveAspectRatio="xMidYMid meet" clip-path="url(#imgClip)"/>`
    : `<text x="${CARD_W / 2}" y="120" text-anchor="middle" class="mono muted" font-size="13">no preview</text>`

  return `<g class="slide s${i}">
    <!-- cover -->
    ${coverEl}
    <!-- status pill (top-right over image) -->
    <g transform="translate(${CARD_W - 96} 30)">
      <rect width="72" height="24" rx="12" fill="#080c18" fill-opacity="0.72" stroke="#1a2035"/>
      <circle cx="15" cy="12" r="4" fill="${dot}"/>
      <text x="42" y="16" text-anchor="middle" class="mono status">${statusLabel}</text>
    </g>
    <!-- counter (top-left) -->
    <text x="24" y="40" class="mono muted" font-size="11">${i + 1} / ${total}</text>
    <!-- divider -->
    <line x1="${PAD}" y1="226" x2="${CARD_W - PAD}" y2="226" stroke="#1a2035"/>
    <!-- title + tagline -->
    <text x="${PAD}" y="258" class="title">${title}</text>
    ${tagline ? `<text x="${PAD}" y="282" class="tagline">${tagline}</text>` : ''}
    <!-- tech -->
    ${pills}
    <!-- footer: live host + repo -->
    <text x="${PAD}" y="342" class="mono link">↗ ${host}</text>
    <text x="${CARD_W - PAD}" y="342" text-anchor="end" class="mono link">&lt;/&gt; ${repo}</text>
  </g>`
}

/** Stagger each slide's fade so exactly one is visible at a time, looping. */
function carouselCss(n: number): string {
  if (n <= 1) return `.slide{opacity:1}`
  const cycle = (n * PER_SLIDE_S).toFixed(2)
  const vis = (100 / n) // % of the cycle each slide owns
  const fade = Math.min(4, vis * 0.18) // % spent fading in/out
  const k = `@keyframes fade {
    0%{opacity:0}
    ${fade.toFixed(2)}%{opacity:1}
    ${(vis - fade).toFixed(2)}%{opacity:1}
    ${vis.toFixed(2)}%{opacity:0}
    100%{opacity:0}
  }`
  const delays = Array.from({ length: n }, (_, i) =>
    `.s${i}{animation-delay:${(-(i * PER_SLIDE_S)).toFixed(2)}s}`,
  ).join('')
  return `${k}
  .slide{opacity:0;animation:fade ${cycle}s infinite}
  ${delays}`
}

function emptyCard(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">
    <rect width="${CARD_W}" height="${CARD_H}" rx="16" fill="#0f1629" stroke="#1a2035"/>
    <text x="${CARD_W / 2}" y="${CARD_H / 2}" text-anchor="middle" fill="#8a93a8"
      font-family="ui-monospace, monospace" font-size="14">No live projects yet</text>
  </svg>`
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function GET() {
  let rows: ProjectRow[] = []
  try {
    rows = (await client.fetch(QUERY, {}, { stega: false })) as ProjectRow[]
  } catch {
    rows = []
  }

  if (!rows.length) {
    return new Response(emptyCard(), {
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=120' },
    })
  }

  // Ping + inline covers in parallel.
  const enriched: Slide[] = await Promise.all(
    rows.map(async (p) => ({
      ...p,
      up: p.liveUrl ? await isUp(p.liveUrl) : false,
      cover: p.coverImage ? await inlineCover(p.coverImage) : null,
    })),
  )

  // Green (up) first, then red; keep Sanity `order` within each group.
  enriched.sort((a, b) => Number(b.up) - Number(a.up))

  const slides = enriched.map((p, i) => renderSlide(p, i, enriched.length)).join('\n')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}" role="img" aria-label="Featured live projects">
  <defs>
    <clipPath id="imgClip"><rect x="20" y="20" width="560" height="190" rx="10"/></clipPath>
    <style>
      text{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
      .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
      .title{fill:#eef0f6;font-size:22px;font-weight:700}
      .tagline{fill:#8a93a8;font-size:13px}
      .muted{fill:#8a93a8}
      .pill{fill:#8a93a8;font-size:11px}
      .status{fill:#eef0f6;font-size:10px;font-weight:600;letter-spacing:0.5px}
      .link{fill:#3b82f6;font-size:12px}
      ${carouselCss(enriched.length)}
    </style>
  </defs>
  <rect width="${CARD_W}" height="${CARD_H}" rx="16" fill="#0f1629" stroke="#1a2035"/>
  ${slides}
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // ~10 min fresh, serve-stale for a day while revalidating. Keeps the live
      // dot reasonably current without hammering every project on each profile load.
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  })
}
