'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/image'
import type { BlogPost } from '@/lib/sanity/types'
import { BlogFilterBar } from './BlogFilterBar'
import { formatDateMedium } from '@/utils/format'
import { filterByTag } from '@/utils/tags'

const CHARS = 'abcdefghijklmnopqrstuvwxyz!@#$%^&*-_+=;:<>,'.split('')

/* ── Tag rotator — auto-cycles tags with char-reveal slide ── */

function TagRotator({ tags }: { tags: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (tags.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % tags.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [tags.length])

  if (tags.length === 0) return null

  return (
    <span ref={containerRef} className="tag-rotator">
      {tags.map((tag, i) => (
        <span
          key={tag}
          className={`tag-rotator-item${i === activeIndex ? ' is-active' : ''}`}
        >
          {Array.from(tag).map((char, ci) => (
            <span
              key={ci}
              className="tag-rotator-char"
              style={{ '--index': ci } as React.CSSProperties}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}

interface BlogListClientProps {
  posts: BlogPost[]
  showFilter?: boolean
  mobileLimit?: number
  /** Fit the visible row count to the section height (homepage 100vh card).
   *  SSR renders the defaults (6 desktop / mobileLimit), then the client
   *  measures and adjusts. */
  fitHeight?: boolean
  /** Denser desktop rows — single-line titles, smaller font, tighter padding.
   *  Used on the homepage so more posts fit in the viewport. */
  compact?: boolean
}

/** Desktop row count rendered during SSR before the client measures */
const DESKTOP_DEFAULT_COUNT = 6

/** Delay before a hovered row commits to its (expensive) scramble + image swap.
 *  Sweeping the cursor fast reschedules this timer, so only the row the cursor
 *  actually settles on does the work — transient pass-through rows are skipped. */
const HOVER_DEBOUNCE_MS = 70

// ── V4 char-level text splitting & animation ──────────

interface CellData {
  chars: HTMLSpanElement[]
  originals: string[]
}

function splitIntoChars(el: HTMLElement): CellData {
  const text = el.textContent || ''
  el.innerHTML = ''
  const chars: HTMLSpanElement[] = []
  const words = text.split(/(\s+)/)
  for (const word of words) {
    if (/^\s+$/.test(word)) {
      el.appendChild(document.createTextNode(word))
      continue
    }
    const wordEl = document.createElement('span')
    wordEl.className = 'word'
    wordEl.style.display = 'inline-block'
    for (const ch of word) {
      const charEl = document.createElement('span')
      charEl.className = 'char'
      charEl.textContent = ch
      wordEl.appendChild(charEl)
      chars.push(charEl)
    }
    el.appendChild(wordEl)
  }
  return { chars, originals: chars.map((c) => c.textContent || '') }
}

function scrambleChars(data: CellData) {
  data.chars.forEach((char, pos) => {
    const orig = data.originals[pos]
    const rnd = () => CHARS[Math.floor(Math.random() * CHARS.length)]
    gsap.fromTo(char, { opacity: 0 }, {
      duration: 0.025,
      opacity: 1,
      repeat: 2,
      repeatDelay: 0.043,
      delay: (pos + 1) * 0.051,
      onStart: () => { char.textContent = rnd() },
      onRepeat: () => { char.textContent = rnd() },
      onComplete: () => { gsap.delayedCall(0.085, () => { char.textContent = orig }) },
    })
  })
}

function resetCellChars(data: CellData) {
  data.chars.forEach((char, i) => {
    gsap.killTweensOf(char)
    char.textContent = data.originals[i]
    gsap.set(char, { opacity: 1 })
  })
}

// ── Component ─────────────────────────────────────────

export function BlogListClient({ posts, showFilter = true, mobileLimit, fitHeight = false, compact = false }: BlogListClientProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const mobileListRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const activeRef = useRef(-1)
  // Last row that actually ran its scramble — the only one needing a reset.
  const prevActiveRef = useRef(-1)
  // Pending debounced hover commit; cleared on re-hover, leave, and unmount.
  const enterTimerRef = useRef<number | null>(null)
  const cellMapRef = useRef(new Map<Element, CellData>())
  const followerRef = useRef<HTMLDivElement>(null)
  const followerImgRef = useRef<HTMLImageElement>(null)

  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [fitCount, setFitCount] = useState<number | null>(null)

  const allTags = useMemo<Array<{ name: string; slug: string }>>(() => {
    const seen = new Set<string>()
    const result: Array<{ name: string; slug: string }> = []
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        if (!tag) continue
        if (!seen.has(tag.slug)) {
          seen.add(tag.slug)
          result.push({ name: tag.name, slug: tag.slug })
        }
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name))
  }, [posts])

  const filtered = useMemo(
    () => filterByTag(posts, activeTag, (p) => p.tags?.filter(Boolean).map((t) => t.slug) ?? []),
    [posts, activeTag],
  )

  const filterKey = filtered.map((p) => p._id).join(',')

  /* ── Fit row count to the section height ── */
  const desktopShown = fitHeight
    ? filtered.slice(0, fitCount ?? DESKTOP_DEFAULT_COUNT)
    : filtered
  const mobileShown = fitHeight
    ? filtered.slice(0, fitCount ?? mobileLimit ?? filtered.length)
    : mobileLimit
      ? filtered.slice(0, mobileLimit)
      : filtered

  // Hover-preview image URLs for the cursor follower (one per shown post).
  const previewUrls = useMemo(
    () => desktopShown.map((p) => (p.heroImage ? urlFor(p.heroImage).width(320).height(200).quality(80).url() : null)),
    // desktopShown is derived from these; recompute only when the shown set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey, fitCount],
  )

  // Warm the browser cache so swapping the follower image on hover is instant,
  // without mounting all of them as composited layers.
  useEffect(() => {
    if (typeof window === 'undefined') return
    for (const u of previewUrls) {
      if (u) {
        const img = new window.Image()
        img.src = u
      }
    }
  }, [previewUrls])

  useEffect(() => {
    if (!fitHeight) return

    const measure = () => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches
      const container = isMobile
        ? mobileListRef.current
        : listRef.current?.querySelector('ol')
      const section = container?.closest('section')
      if (!container || !section || container.children.length === 0) return

      const rows = container.children
      const firstRect = rows[0].getBoundingClientRect()
      // row pitch incl. gap/margin when two rows exist; bare height otherwise
      const rowH =
        rows.length > 1
          ? rows[1].getBoundingClientRect().top - firstRect.top
          : firstRect.height
      if (rowH <= 0) return

      const pad =
        parseFloat(getComputedStyle(section.firstElementChild as Element).paddingBottom) || 0
      const available = section.getBoundingClientRect().bottom - pad - firstRect.top
      setFitCount(Math.max(1, Math.floor(available / rowH)))
    }

    // after paint, then again once webfonts land (row height changes with them)
    const raf = requestAnimationFrame(measure)
    document.fonts?.ready.then(measure).catch(() => {})

    let lastW = window.innerWidth
    let lastH = window.innerHeight
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      // ignore mobile URL-bar collapse/expand so cards don't pop while scrolling
      if (w === lastW && Math.abs(h - lastH) < 120) return
      lastW = w
      lastH = h
      measure()
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [fitHeight])

  // Self-correction: the estimate divides available space by the pitch of the
  // first two rows, which drifts when fonts swap late or a title wraps. After
  // each render, shrink the count until the last row genuinely fits.
  useEffect(() => {
    if (!fitHeight || fitCount == null || fitCount <= 1) return
    const raf = requestAnimationFrame(() => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches
      const container = isMobile
        ? mobileListRef.current
        : listRef.current?.querySelector('ol')
      const section = container?.closest('section')
      if (!container || !section || container.children.length === 0) return
      const rows = container.children
      const lastBottom = rows[rows.length - 1].getBoundingClientRect().bottom
      if (lastBottom > section.getBoundingClientRect().bottom) {
        setFitCount(fitCount - 1)
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [fitHeight, fitCount, filterKey])

  // Eager-split cells after paint. handleEnter has a lazy fallback if this races.
  useEffect(() => {
    cellMapRef.current.clear()
    activeRef.current = -1
    prevActiveRef.current = -1

    const raf = requestAnimationFrame(() => {
      const container = listRef.current
      if (!container) return
      if (window.matchMedia('(max-width: 767px)').matches) return

      container.querySelectorAll<HTMLElement>('.blog-cell').forEach((cell) => {
        cellMapRef.current.set(cell, splitIntoChars(cell))
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [filterKey, desktopShown.length])

  // Cursor-follow the Hover Preview Image
  useEffect(() => {
    const el = followerRef.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduced ? 0 : 0.25

    const xTo = gsap.quickTo(el, 'x', { duration, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration, ease: 'power3.out' })

    const OFFSET_X = 24
    const HALF_H = 100

    // Coalesce raw mousemove events to one update per frame — the browser can
    // fire mousemove 100+ times/sec, far more often than it can paint.
    let rafId: number | null = null
    let lastX = 0
    let lastY = 0

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX
      lastY = e.clientY
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        xTo(lastX + OFFSET_X)
        yTo(lastY - HALF_H)
      })
    }

    document.addEventListener('mousemove', onMove)
    return () => {
      document.removeEventListener('mousemove', onMove)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  const runEnter = useCallback((index: number) => {
    activeRef.current = index
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Reset only the previously-animated row — it's the only one ever scrambled.
    const prev = prevActiveRef.current
    if (prev !== -1 && prev !== index) {
      rowRefs.current[prev]?.querySelectorAll<HTMLElement>('.blog-cell').forEach((cell) => {
        const d = cellMapRef.current.get(cell)
        if (d) resetCellChars(d)
        gsap.killTweensOf(cell)
        gsap.set(cell, { '--anim': 0 })
      })
    }

    // Dim all rows
    rowRefs.current.forEach((row, i) => {
      if (!row) return
      if (reduced) {
        row.style.opacity = i === index ? '1' : '0.3'
      } else {
        gsap.to(row, { opacity: i === index ? 1 : 0.3, duration: 0.3, overwrite: true })
      }
    })

    // Animate active — lazy-split cells if eager split was missed (router cache, strict mode, etc.)
    const activeRow = rowRefs.current[index]
    if (activeRow) {
      activeRow.querySelectorAll<HTMLElement>('.blog-cell').forEach((cell) => {
        if (!cellMapRef.current.has(cell)) {
          cellMapRef.current.set(cell, splitIntoChars(cell))
        }
        if (reduced) {
          gsap.set(cell, { '--anim': 1 })
        } else {
          gsap.fromTo(cell, { '--anim': 0 }, { '--anim': 1, duration: 1, ease: 'expo.out' })
          const d = cellMapRef.current.get(cell)
          if (d) scrambleChars(d)
        }
      })
    }

    // Swap the single hover-preview image to the active post and fade it in.
    // One image element (not 20 stacked) keeps the cursor-following layer cheap.
    const previewImg = followerImgRef.current
    if (previewImg) {
      const url = previewUrls[index]
      gsap.killTweensOf(previewImg)
      if (url) {
        if (previewImg.getAttribute('src') !== url) previewImg.src = url
        if (reduced) {
          previewImg.style.opacity = '1'
        } else {
          gsap.to(previewImg, { opacity: 1, duration: 0.3, ease: 'power2.out', overwrite: true })
        }
      } else {
        previewImg.style.opacity = '0'
      }
    }

    prevActiveRef.current = index
  }, [previewUrls])

  // Debounce the commit: a fast sweep reschedules the timer so only the row the
  // cursor lands on runs the work, instead of every row it passes through.
  const handleEnter = useCallback((index: number) => {
    if (enterTimerRef.current !== null) clearTimeout(enterTimerRef.current)
    enterTimerRef.current = window.setTimeout(() => {
      enterTimerRef.current = null
      runEnter(index)
    }, HOVER_DEBOUNCE_MS)
  }, [runEnter])

  // Clear any pending hover commit when the component unmounts.
  useEffect(() => () => {
    if (enterTimerRef.current !== null) clearTimeout(enterTimerRef.current)
  }, [])

  const handleLeave = useCallback(() => {
    if (enterTimerRef.current !== null) {
      clearTimeout(enterTimerRef.current)
      enterTimerRef.current = null
    }
    activeRef.current = -1
    prevActiveRef.current = -1
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    rowRefs.current.forEach((row) => {
      if (!row) return
      if (reduced) { row.style.opacity = '1' } else {
        gsap.to(row, { opacity: 1, duration: 0.3, overwrite: true })
      }
      row.querySelectorAll<HTMLElement>('.blog-cell').forEach((cell) => {
        const d = cellMapRef.current.get(cell)
        if (d) resetCellChars(d)
        gsap.killTweensOf(cell)
        if (reduced) { gsap.set(cell, { '--anim': 0 }) } else {
          gsap.to(cell, { '--anim': 0, duration: 0.6, ease: 'power4.out' })
        }
      })
    })

    const previewImg = followerImgRef.current
    if (previewImg) {
      if (reduced) { previewImg.style.opacity = '0' } else {
        gsap.to(previewImg, { opacity: 0, duration: 0.4, overwrite: true })
      }
    }
  }, [])

  return (
    <div>
      {showFilter && (
        <BlogFilterBar
          tags={allTags}
          activeTag={activeTag}
          onTagChange={setActiveTag}
          totalCount={filtered.length}
        />
      )}

      {/* ── Desktop list ── */}
      <div
        ref={listRef}
        className={`relative hidden md:block${compact ? ' blog-list--compact' : ''}`}
        onMouseLeave={handleLeave}
      >
        {/* Column headers */}
        <div className="blog-list-header">
          <span />
          <span>Title</span>
          <span>Tags</span>
          <span>Date</span>
        </div>

        <ol className="blog-list list-none m-0 p-0">
          {desktopShown.map((post, i) => (
            <li key={post._id}>
              <Link
                ref={(el) => { rowRefs.current[i] = el }}
                href={`/blog/${post.slug.current}`}
                data-row
                className="blog-row"
                onMouseEnter={() => handleEnter(i)}
              >
                <span className="flex flex-col gap-1">
                  <span className="blog-cell blog-cell--title">{post.title}</span>
                  {post.author && (
                    <span className="font-ui text-xs text-text-muted">By {post.author.name}</span>
                  )}
                </span>
                <span className="blog-cell blog-cell--tags">{post.tags?.filter(Boolean).map((t) => t.name).join(', ') ?? ''}</span>
                <span className="blog-cell blog-cell--end">{formatDateMedium(post.publishedAt)}</span>
              </Link>
            </li>
          ))}
        </ol>

      </div>

      {/* Hover Preview Image — fixed follower, anchored to cursor. A single
          <img> whose src swaps to the hovered post, so the cursor-following
          layer holds one image instead of 20 stacked ones (paint/composite fix). */}
      <div
        ref={followerRef}
        className="pointer-events-none fixed top-0 left-0 z-40 hidden md:block"
        style={{ width: 320, height: 200, willChange: 'transform' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={followerImgRef}
          alt=""
          width={320}
          height={200}
          className="absolute inset-0 h-full w-full rounded-sm object-cover opacity-0 shadow-2xl"
        />
      </div>

      {/* ── Mobile cards ── */}
      <div ref={mobileListRef} className="blog-mobile-list">
        {mobileShown.map((post, i) => (
          <Link
            key={`m-${post._id}`}
            href={`/blog/${post.slug.current}`}
            className="blog-mobile-row"
          >
            {post.heroImage && (
              <div className="blog-mobile-img">
                <Image
                  src={urlFor(post.heroImage).width(200).height(200).quality(80).url()}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
              </div>
            )}
            <div className="blog-mobile-info">
              <h3 className="blog-mobile-title">{post.title}</h3>
              {post.author && (
                <p className="font-ui text-xs text-text-muted mt-0.5">By {post.author.name}</p>
              )}
              <div className="blog-mobile-meta">
                {post.tags && post.tags.filter(Boolean).length > 0 && (
                  <TagRotator tags={post.tags.filter(Boolean).map((t) => t.name)} />
                )}
                <span className="blog-mobile-date">{formatDateMedium(post.publishedAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
