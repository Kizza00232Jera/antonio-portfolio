'use client'

import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/image'
import type { BlogPost } from '@/lib/sanity/types'

gsap.registerPlugin(ScrambleTextPlugin)

interface BlogListClientProps {
  posts: BlogPost[]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function BlogListClient({ posts }: BlogListClientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([])


  const bgImageRefs = useRef<(HTMLDivElement | null)[]>([])
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTlRef = useRef<gsap.core.Timeline | null>(null)
  const activeIndexRef = useRef<number>(-1)

  const stopIdleAnimation = useCallback(() => {
    if (idleTlRef.current) {
      idleTlRef.current.kill()
      idleTlRef.current = null
      // Restore all data cells and counters to full opacity
      const container = containerRef.current
      if (container) {
        gsap.set(container.querySelectorAll('[data-cell]'), { opacity: 1 })
        gsap.set(container.querySelectorAll('[data-counter]'), { opacity: 0.6 })
      }
    }
  }, [])

  const startIdleAnimation = useCallback(() => {
    const container = containerRef.current
    if (!container || activeIndexRef.current !== -1) return

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 })
    idleTlRef.current = tl

    const rows = container.querySelectorAll('[data-row]')
    const totalRows = rows.length
    if (totalRows === 0) return

    const rowDelay = 0.05
    const hideShowGap = totalRows * rowDelay * 0.5

    // Counter column wave
    rows.forEach((row, i) => {
      const counter = row.querySelector('[data-counter]')
      if (!counter) return
      tl.to(counter, { opacity: 0.05, duration: 0.1, ease: 'power2.inOut' }, i * rowDelay)
      tl.to(counter, { opacity: 0.6, duration: 0.1, ease: 'power2.inOut' }, hideShowGap + i * rowDelay)
    })

    // Data columns wave (date, title, tags, author)
    const columnSelectors = ['[data-date]', '[data-title]', '[data-category]', '[data-author]']
    columnSelectors.forEach((sel, colIdx) => {
      const colStart = (colIdx + 1) * 0.25
      rows.forEach((row, i) => {
        const el = row.querySelector(sel)
        if (!el) return
        tl.to(el, { opacity: 0.05, duration: 0.1, ease: 'power2.inOut' }, colStart + i * rowDelay)
        tl.to(el, { opacity: 1, duration: 0.1, ease: 'power2.inOut' }, colStart + hideShowGap + i * rowDelay)
      })
    })
  }, [])

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      if (activeIndexRef.current === -1) {
        startIdleAnimation()
      }
    }, 3000)
  }, [startIdleAnimation])

  const handleEnter = useCallback((index: number) => {
    if (activeIndexRef.current === index) return
    activeIndexRef.current = index

    stopIdleAnimation()
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Reset ALL cells first (clear previous hover)
    rowRefs.current.forEach((row) => {
      if (!row) return
      const cells = row.querySelectorAll('[data-cell]')
      cells.forEach((cell) => {
        gsap.killTweensOf(cell)
        const orig = cell.getAttribute('data-text')
        if (orig) cell.textContent = orig
      })
      gsap.set(cells, { backgroundColor: 'transparent', color: '' })
    })

    // Dim all rows, highlight active
    rowRefs.current.forEach((row, i) => {
      if (!row) return
      if (prefersReduced) {
        row.style.opacity = i === index ? '1' : '0.3'
      } else {
        gsap.to(row, { opacity: i === index ? 1 : 0.3, duration: 0.3, overwrite: true })
      }
    })

    // Highlight active row — use gsap.set so there's no tween to conflict with scramble
    const activeRow = rowRefs.current[index]
    if (activeRow) {
      const cells = activeRow.querySelectorAll('[data-cell]')
      gsap.set(cells, { backgroundColor: '#3b82f6', color: '#080c18' })

      // Scramble ALL cells
      if (!prefersReduced) {
        cells.forEach((cell) => {
          const originalText = cell.getAttribute('data-text') || ''
          if (!originalText) return
          gsap.to(cell, {
            duration: 0.8,
            scrambleText: {
              text: originalText,
              chars: 'abcdefghijklmnopqrstuvwxyz0123456789!@#',
              revealDelay: 0.3,
              speed: 0.4,
            },
          })
        })
      }
    }

    // Show background image
    const bgImg = bgImageRefs.current[index]
    if (bgImg) {
      // Hide all other images first
      bgImageRefs.current.forEach((img, i) => {
        if (img && i !== index) gsap.set(img, { opacity: 0 })
      })
      if (prefersReduced) {
        bgImg.style.opacity = '0.4'
        bgImg.style.transform = 'scale(1)'
      } else {
        gsap.set(bgImg, { scale: 1.2 })
        gsap.to(bgImg, { opacity: 0.4, scale: 1, duration: 0.6, ease: 'power2.out', overwrite: true })
      }
    }
  }, [stopIdleAnimation])

  const handleLeave = useCallback(() => {
    activeIndexRef.current = -1

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Restore all rows
    rowRefs.current.forEach((row) => {
      if (!row) return
      if (prefersReduced) {
        row.style.opacity = '1'
      } else {
        gsap.to(row, { opacity: 1, duration: 0.3, overwrite: true })
      }
      // Restore text color and background
      const cells = row.querySelectorAll('[data-cell]')
      cells.forEach((cell) => {
        gsap.killTweensOf(cell)
        gsap.to(cell, { backgroundColor: 'transparent', color: '', duration: 0.3, overwrite: true })
        const originalText = cell.getAttribute('data-text')
        if (originalText) cell.textContent = originalText
      })
    })

    // Hide all background images
    bgImageRefs.current.forEach((img) => {
      if (!img) return
      if (prefersReduced) {
        img.style.opacity = '0'
      } else {
        gsap.to(img, { opacity: 0, duration: 0.4, overwrite: true })
      }
    })

    startIdleTimer()
  }, [startIdleTimer])

  // Start idle timer on mount, clean up on unmount
  useEffect(() => {
    startIdleTimer()
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      stopIdleAnimation()
    }
  }, [startIdleTimer, stopIdleAnimation])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseLeave={handleLeave}
    >
      {/* Background images — rendered FIRST so list paints on top (DOM order stacking) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {posts.map((post, i) =>
          post.heroImage ? (
            <div
              key={`bg-${post._id}`}
              ref={(el) => { bgImageRefs.current[i] = el }}
              className="absolute opacity-0"
              style={{ width: 800, height: 600 }}
            >
              <Image
                src={urlFor(post.heroImage).width(800).height(600).quality(80).url()}
                alt=""
                width={800}
                height={600}
                className="object-cover"
                sizes="800px"
                loading={i < 3 ? 'eager' : 'lazy'}
              />
            </div>
          ) : null,
        )}
      </div>

      {/* List rows — rendered SECOND, stacks above images */}
      <ol className="relative list-none m-0 p-0">
        {posts.map((post, i) => (
          <li key={post._id}>
            <Link
              ref={(el) => { rowRefs.current[i] = el }}
              href={`/blog/${post.slug.current}`}
              data-row
              className="relative grid overflow-hidden items-center py-3 px-2 no-underline transition-opacity grid-cols-[2rem_5rem_1fr] md:grid-cols-[2.5rem_5.5rem_1fr_9rem_9rem] gap-x-4 md:gap-x-8 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              onMouseEnter={() => handleEnter(i)}
            >
              {/* Counter */}
              <span
                data-counter
                data-cell
                data-text={String(posts.length - i).padStart(2, '0')}
                className="relative font-mono text-xs opacity-60 leading-none px-1"
              >
                {String(posts.length - i).padStart(2, '0')}
              </span>

              {/* Date */}
              <span
                data-date
                data-cell
                data-text={formatDate(post.publishedAt)}
                className="relative text-xs opacity-60 leading-none px-1"
              >
                {formatDate(post.publishedAt)}
              </span>

              {/* Title */}
              <span
                data-title
                data-cell
                data-text={post.title}
                className="relative font-heading font-semibold truncate leading-none px-1"
                style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
              >
                {post.title}
              </span>

              {/* Tags — hidden on mobile */}
              <span
                data-category
                data-cell
                data-text={post.tags?.filter((t): t is string => typeof t === 'string').join(', ') ?? ''}
                className="relative hidden md:block text-xs uppercase tracking-wider opacity-60 truncate leading-none px-1"
              >
                {post.tags?.filter((t): t is string => typeof t === 'string').join(', ') ?? ''}
              </span>

              {/* Author — hidden on mobile */}
              <span
                data-author
                data-cell
                data-text={post.author ?? 'Antonio Jerkovic'}
                className="relative hidden md:block text-xs opacity-60 truncate leading-none px-1"
              >
                {post.author ?? 'Antonio Jerkovic'}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
