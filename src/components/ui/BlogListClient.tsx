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
}

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
      duration: 0.03,
      opacity: 1,
      repeat: 2,
      repeatDelay: 0.05,
      delay: (pos + 1) * 0.06,
      onStart: () => { char.textContent = rnd() },
      onRepeat: () => { char.textContent = rnd() },
      onComplete: () => { gsap.delayedCall(0.1, () => { char.textContent = orig }) },
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

export function BlogListClient({ posts, showFilter = true, mobileLimit }: BlogListClientProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])
  const activeRef = useRef(-1)
  const cellMapRef = useRef(new Map<Element, CellData>())
  const splitKeyRef = useRef('')

  const [activeTag, setActiveTag] = useState<string | null>(null)

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

  // Split text into chars after DOM paints
  useEffect(() => {
    if (splitKeyRef.current === filterKey) return
    splitKeyRef.current = filterKey
    cellMapRef.current.clear()
    activeRef.current = -1

    const raf = requestAnimationFrame(() => {
      const container = listRef.current
      if (!container) return
      if (window.matchMedia('(max-width: 767px)').matches) return

      container.querySelectorAll<HTMLElement>('.blog-cell').forEach((cell) => {
        cellMapRef.current.set(cell, splitIntoChars(cell))
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [filterKey])

  const handleEnter = useCallback((index: number) => {
    if (activeRef.current === index) return
    activeRef.current = index
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Reset all cells
    rowRefs.current.forEach((row) => {
      if (!row) return
      row.querySelectorAll<HTMLElement>('.blog-cell').forEach((cell) => {
        const d = cellMapRef.current.get(cell)
        if (d) resetCellChars(d)
        gsap.killTweensOf(cell)
        gsap.set(cell, { '--anim': 0 })
      })
    })

    // Dim all rows
    rowRefs.current.forEach((row, i) => {
      if (!row) return
      if (reduced) {
        row.style.opacity = i === index ? '1' : '0.3'
      } else {
        gsap.to(row, { opacity: i === index ? 1 : 0.3, duration: 0.3, overwrite: true })
      }
    })

    // Animate active
    const activeRow = rowRefs.current[index]
    if (activeRow) {
      activeRow.querySelectorAll<HTMLElement>('.blog-cell').forEach((cell) => {
        if (reduced) {
          gsap.set(cell, { '--anim': 1 })
        } else {
          gsap.fromTo(cell, { '--anim': 0 }, { '--anim': 1, duration: 1, ease: 'expo.out' })
        }
        if (!reduced) {
          const d = cellMapRef.current.get(cell)
          if (d) scrambleChars(d)
        }
      })
    }

    // Show hover image
    imageRefs.current.forEach((im, i) => {
      if (!im) return
      if (i === index) {
        if (reduced) { im.style.opacity = '1' } else {
          gsap.set(im, { scale: 1.05 })
          gsap.to(im, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', overwrite: true })
        }
      } else {
        gsap.set(im, { opacity: 0 })
      }
    })
  }, [])

  const handleLeave = useCallback(() => {
    activeRef.current = -1
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

    imageRefs.current.forEach((im) => {
      if (!im) return
      if (reduced) { im.style.opacity = '0' } else {
        gsap.to(im, { opacity: 0, duration: 0.4, overwrite: true })
      }
    })
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
      <div ref={listRef} className="relative hidden md:block" onMouseLeave={handleLeave}>
        {/* Column headers */}
        <div className="blog-list-header">
          <span />
          <span>Title</span>
          <span>Tags</span>
          <span>Date</span>
        </div>

        <ol className="blog-list list-none m-0 p-0">
          {filtered.map((post, i) => (
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

        {/* Hover images — float over the active row, anchored to the right edge */}
        <div className="pointer-events-none absolute inset-y-0 right-[8%] flex items-center justify-end z-10">
          {filtered.map((post, i) =>
            post.heroImage ? (
              <div
                key={`img-${post._id}`}
                ref={(el) => { imageRefs.current[i] = el }}
                className="absolute opacity-0"
              >
                <Image
                  src={urlFor(post.heroImage).width(320).height(200).quality(80).url()}
                  alt=""
                  width={320}
                  height={200}
                  className="object-cover rounded-sm shadow-2xl"
                  sizes="280px"
                  loading={i < 3 ? 'eager' : 'lazy'}
                />
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* ── Mobile cards ── */}
      <div className="blog-mobile-list">
        {(mobileLimit ? filtered.slice(0, mobileLimit) : filtered).map((post, i) => (
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
