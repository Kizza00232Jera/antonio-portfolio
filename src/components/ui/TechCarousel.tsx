'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { urlFor } from '@/lib/sanity/image'
import type { TechStackItem } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'

interface TechCarouselProps {
  items: TechStackItem[]
  className?: string
}

// Target width per tech cell — columns auto-fit to the container so the
// grid stays aligned and responsive on every screen size.
const CELL_MIN_WIDTH = 150
const ROWS = 2
const AUTO_MS = 5000

export function TechCarousel({ items, className }: TechCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const [cols, setCols] = useState(1)
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)

  // Measure how many columns fit and recompute on resize.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const fit = Math.floor(el.clientWidth / CELL_MIN_WIDTH)
      setCols(Math.max(1, Math.min(fit, items.length)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [items.length])

  const perPage = Math.max(1, cols * ROWS)
  const pageCount = Math.max(1, Math.ceil(items.length / perPage))

  // Keep the active page in range as the layout reflows.
  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1))
  }, [pageCount])

  // Auto-advance; pauses after any manual interaction.
  useEffect(() => {
    if (pageCount <= 1 || paused) return
    const timer = setTimeout(() => setPage((p) => (p + 1) % pageCount), AUTO_MS)
    return () => clearTimeout(timer)
  }, [page, paused, pageCount])

  if (items.length === 0) return null

  const navigate = (dir: 1 | -1) => {
    setPaused(true)
    setPage((p) => (p + dir + pageCount) % pageCount)
  }
  const goTo = (i: number) => {
    setPaused(true)
    setPage(i)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) navigate(dx < 0 ? 1 : -1)
    touchStartX.current = null
  }

  const start = page * perPage
  const visible = items.slice(start, start + perPage)

  return (
    <div
      className={cn('w-full select-none border-y border-border py-8', className)}
      onTouchStart={pageCount > 1 ? onTouchStart : undefined}
      onTouchEnd={pageCount > 1 ? onTouchEnd : undefined}
    >
      <div ref={containerRef}>
        <div
          key={page}
          className="carousel-fade-in grid gap-x-6 gap-y-8"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            // Reserve height for a full page so dots never jump between pages.
            minHeight: `calc(${ROWS} * 5rem)`,
          }}
        >
          {visible.map((item, i) => (
            <div
              key={`${item._id}-${i}`}
              className="flex flex-col items-center justify-start gap-3 text-center"
            >
              {item.icon && (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#eef0f6] p-2">
                  <Image
                    src={urlFor(item.icon).width(48).height(48).url()}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="h-8 w-8 object-contain"
                  />
                </span>
              )}
              <span className="font-ui text-xs uppercase tracking-wider text-text-muted">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Previous"
            className="flex h-7 w-7 items-center justify-center text-text-muted transition-colors hover:text-text"
          >
            ←
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Page ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === page ? 'w-5 bg-text' : 'w-1.5 bg-text/30 hover:bg-text/60',
                )}
              />
            ))}
          </div>
          <button
            onClick={() => navigate(1)}
            aria-label="Next"
            className="flex h-7 w-7 items-center justify-center text-text-muted transition-colors hover:text-text"
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
