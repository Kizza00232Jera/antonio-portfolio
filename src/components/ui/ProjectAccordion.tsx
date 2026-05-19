'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import Image from 'next/image'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { urlFor } from '@/lib/sanity/image'
import type { ProjectSection, SanityImage } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'

/* ── Portable text components ───────────────────────── */
const clientPortableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-12 mb-4 font-heading font-bold text-text leading-tight text-[length:var(--text-heading)]">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 font-heading font-semibold text-text leading-snug text-lg">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-accent pl-4 italic text-text-muted leading-relaxed">{children}</blockquote>
    ),
    normal: ({ children }) => (
      <p className="mb-5 text-text leading-relaxed text-[length:var(--text-body)]">{children}</p>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-sm text-accent">{children}</code>
    ),
    link: ({ children, value }) => {
      const href = value?.href ?? '#'
      const isExternal = href.startsWith('http')
      return (
        <a
          href={href}
          className="text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition-colors"
          {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        >{children}</a>
      )
    },
  },
}

/* ── Full-screen modal ──────────────────────────────── */
function ImageModal({ img, onClose }: { img: SanityImage; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const dims = img.dimensions
  const w = dims?.width ?? 1600
  const h = dims?.height ?? 900

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8 md:p-16"
      onClick={onClose}
    >
      <div
        className="relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-8 right-0 text-white/50 hover:text-white text-xs uppercase tracking-widest transition-colors"
        >
          close ×
        </button>
        <Image
          src={urlFor(img).width(2400).quality(90).url()}
          alt=""
          width={w}
          height={h}
          style={{ maxWidth: 'min(90vw, 1200px)', maxHeight: '80vh', width: 'auto', height: 'auto' }}
          className="block rounded-sm shadow-2xl"
        />
      </div>
    </div>,
    document.body,
  )
}

/* ── Carousel ───────────────────────────────────────── */
function SectionCarousel({ images }: { images: SanityImage[] }) {
  const imgs = images.filter(img => img?.asset)
  const n = imgs.length
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [modalImg, setModalImg] = useState<SanityImage | null>(null)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (n <= 1 || paused) return
    const timer = setTimeout(() => {
      setCurrent(c => (c + 1) % n)
    }, 5000)
    return () => clearTimeout(timer)
  }, [current, paused, n])

  const navigate = (dir: 1 | -1) => {
    setPaused(true)
    setCurrent(c => (c + dir + n) % n)
  }

  const goTo = (i: number) => {
    setPaused(true)
    setCurrent(i)
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

  if (n === 0) return null

  const img = imgs[current]

  return (
    <>
      {modalImg && <ImageModal img={modalImg} onClose={() => setModalImg(null)} />}
      <div
        className="w-full select-none"
        onTouchStart={n > 1 ? onTouchStart : undefined}
        onTouchEnd={n > 1 ? onTouchEnd : undefined}
      >
        <div
          className="relative h-[450px] md:h-[600px] overflow-hidden rounded-sm bg-bg cursor-zoom-in"
          onClick={() => setModalImg(img)}
        >
          <Image
            key={current}
            src={urlFor(img).width(1600).quality(85).url()}
            alt=""
            fill
            className="carousel-fade-in object-contain"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>

        {n > 1 && (
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="Previous image"
              className="flex h-7 w-7 items-center justify-center text-text-muted transition-colors hover:text-text"
            >
              ←
            </button>
            <div className="flex items-center gap-1.5">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Image ${i + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === current ? 'w-5 bg-text' : 'w-1.5 bg-text/30 hover:bg-text/60'
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => navigate(1)}
              aria-label="Next image"
              className="flex h-7 w-7 items-center justify-center text-text-muted transition-colors hover:text-text"
            >
              →
            </button>
          </div>
        )}
      </div>
    </>
  )
}

/* ── Section content ────────────────────────────────── */
function SectionContent({ section }: { section: ProjectSection }) {
  const hasContent = !!(section.content && section.content.length > 0)
  const hasImages = !!(section.images && section.images.filter(img => img?.asset).length > 0)

  return (
    <div className="flex flex-col gap-8">
      {hasContent && (
        <div>
          <PortableText value={section.content!} components={clientPortableTextComponents} />
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
      {hasImages && <SectionCarousel images={section.images!} />}
    </div>
  )
}

/* ── Accordion ──────────────────────────────────────── */
interface ProjectAccordionProps {
  sections: ProjectSection[]
  className?: string
}

export function ProjectAccordion({ sections, className }: ProjectAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const prefersReduced = useRef(false)

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const toggle = useCallback(
    (index: number) => {
      const nextOpen = openIndex === index ? null : index

      if (openIndex !== null && contentRefs.current[openIndex]) {
        const el = contentRefs.current[openIndex]!
        if (prefersReduced.current) {
          el.style.height = '0px'
          el.style.opacity = '0'
        } else {
          gsap.to(el, { height: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut' })
        }
      }

      if (nextOpen !== null && contentRefs.current[nextOpen]) {
        const el = contentRefs.current[nextOpen]!
        if (prefersReduced.current) {
          el.style.height = 'auto'
          el.style.opacity = '1'
        } else {
          gsap.to(el, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.inOut' })
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
        return (
          <div key={section._key}>
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-accent"
            >
              <span className="font-heading text-lg font-semibold uppercase tracking-wide text-text md:text-xl">
                {section.title}
              </span>
              <span className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-lg text-text-muted transition-transform">
                {isOpen ? '×' : '+'}
              </span>
            </button>

            <div
              ref={(el) => { contentRefs.current[i] = el }}
              className="overflow-hidden"
              style={{ height: 0, opacity: 0 }}
            >
              <div className="pb-10">
                <SectionContent section={section} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
