'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import PortableTextRenderer from '@/components/sanity/PortableTextRenderer'
import type { ProjectSection, SanityImage } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'

interface ProjectAccordionProps {
  sections: ProjectSection[]
  className?: string
}

/* ── Draggable horizontal image gallery ─────────────── */
function DraggableGallery({ images }: { images: SanityImage[] }) {
  const galleryRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollStart = useRef(0)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const el = galleryRef.current
    if (!el) return
    isDragging.current = true
    startX.current = e.pageX
    scrollStart.current = el.scrollLeft
    el.style.cursor = 'grabbing'
    el.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const el = galleryRef.current
    if (!el) return
    e.preventDefault()
    const walk = (e.pageX - startX.current) * 1.5
    el.scrollLeft = scrollStart.current - walk
  }, [])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
    if (galleryRef.current) {
      galleryRef.current.style.cursor = 'grab'
    }
  }, [])

  return (
    <div
      ref={galleryRef}
      className="scrollbar-hide flex cursor-grab gap-4 overflow-x-auto"
      style={{ scrollSnapType: 'x mandatory' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {images.map((img, idx) => (
        <div
          key={idx}
          className="w-[260px] shrink-0 md:w-[300px]"
          style={{ scrollSnapAlign: 'start' }}
        >
          <Image
            src={urlFor(img).width(640).quality(80).url()}
            alt=""
            width={640}
            height={400}
            className="pointer-events-none w-full select-none rounded-lg"
            draggable={false}
          />
        </div>
      ))}
    </div>
  )
}

/* ── Accordion component ────────────────────────────── */
export function ProjectAccordion({
  sections,
  className,
}: ProjectAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const prefersReduced = useRef(false)

  useEffect(() => {
    prefersReduced.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
  }, [])

  const toggle = useCallback(
    (index: number) => {
      const nextOpen = openIndex === index ? null : index

      // Close the currently open section
      if (openIndex !== null && contentRefs.current[openIndex]) {
        const el = contentRefs.current[openIndex]!
        if (prefersReduced.current) {
          el.style.height = '0px'
          el.style.opacity = '0'
        } else {
          gsap.to(el, {
            height: 0,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut',
          })
        }
      }

      // Open the new section
      if (nextOpen !== null && contentRefs.current[nextOpen]) {
        const el = contentRefs.current[nextOpen]!
        if (prefersReduced.current) {
          el.style.height = 'auto'
          el.style.opacity = '1'
        } else {
          gsap.to(el, {
            height: 'auto',
            opacity: 1,
            duration: 0.4,
            ease: 'power2.inOut',
          })
        }
      }

      setOpenIndex(nextOpen)
    },
    [openIndex],
  )

  if (sections.length === 0) return null

  return (
    <div className={cn('divide-y divide-border', className)}>
      {sections.map((section, i) => {
        const isOpen = openIndex === i
        const hasImages = section.images && section.images.length > 0
        const hasContent = section.content && section.content.length > 0

        return (
          <div key={section._key}>
            {/* Header row */}
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-accent"
            >
              <span className="font-heading text-lg font-semibold uppercase tracking-wide text-text md:text-xl">
                {section.title}
              </span>
              <span className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-lg text-text-muted transition-transform">
                {isOpen ? '\u00d7' : '+'}
              </span>
            </button>

            {/* Expandable content */}
            <div
              ref={(el) => {
                contentRefs.current[i] = el
              }}
              className="overflow-hidden"
              style={{ height: 0, opacity: 0 }}
            >
              <div className="pb-8">
                {/* Two-column layout: text left, images right */}
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                  {/* Left column: text content + links */}
                  {hasContent && (
                    <div className={cn(hasImages ? 'lg:w-[45%]' : 'w-full')}>
                      <PortableTextRenderer value={section.content!} />

                      {section.links && section.links.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-4">
                          {section.links.map((link) =>
                            link.url ? (
                              <a
                                key={link._key}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-accent"
                              >
                                {link.label ?? link.url}
                                <span aria-hidden>→</span>
                              </a>
                            ) : null,
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Right column: draggable image gallery */}
                  {hasImages && (
                    <div className={cn(hasContent ? 'lg:w-[55%]' : 'w-full')}>
                      <DraggableGallery images={section.images!} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
