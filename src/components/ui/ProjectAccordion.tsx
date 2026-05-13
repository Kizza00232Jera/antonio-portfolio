'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
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

/* ── Image cell (fills its parent, which must be relative + sized) ── */
function ProjectImg({ image, sizes = '(max-width: 768px) 100vw, 800px' }: { image: SanityImage; sizes?: string }) {
  return (
    <Image
      src={urlFor(image).width(1400).quality(85).url()}
      alt=""
      fill
      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      sizes={sizes}
    />
  )
}

/* ── Adaptive editorial image grid ─────────────────── */
function SectionImageGrid({ images, className }: { images: SanityImage[]; className?: string }) {
  const imgs = images.filter(img => img?.asset)
  const n = imgs.length
  if (n === 0) return null

  /* 1 image */
  if (n === 1) {
    return (
      <div
        className={cn('group relative w-full overflow-hidden', className)}
        style={{ aspectRatio: '16/10' }}
      >
        <ProjectImg image={imgs[0]} sizes="(max-width: 768px) 100vw, 60vw" />
      </div>
    )
  }

  /* 2 images — side by side */
  if (n === 2) {
    return (
      <div className={cn('grid grid-cols-1 gap-2 sm:grid-cols-2', className)}>
        {imgs.map((img, i) => (
          <div key={i} className="group relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
            <ProjectImg image={img} sizes="(max-width: 640px) 100vw, 50vw" />
          </div>
        ))}
      </div>
    )
  }

  /* 3 images — hero 2/3 + two stacked 1/3 (collapses to stacked on mobile) */
  if (n === 3) {
    return (
      <div className={cn('block sm:flex sm:gap-2', className)}>
        {/* Hero */}
        <div
          className="group relative w-full overflow-hidden sm:flex-[2]"
          style={{ aspectRatio: '16/10' }}
        >
          <ProjectImg image={imgs[0]} sizes="(max-width: 640px) 100vw, 65vw" />
        </div>
        {/* Side stack */}
        <div className="mt-2 flex gap-2 sm:mt-0 sm:flex-1 sm:flex-col">
          {[imgs[1], imgs[2]].map((img, i) => (
            <div
              key={i}
              className="group relative flex-1 overflow-hidden"
              style={{ aspectRatio: '16/10' }}
            >
              <ProjectImg image={img} sizes="(max-width: 640px) 50vw, 33vw" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* 4 images — 2×2 grid */
  if (n === 4) {
    return (
      <div className={cn('grid grid-cols-2 gap-2', className)}>
        {imgs.map((img, i) => (
          <div key={i} className="group relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
            <ProjectImg image={img} sizes="(max-width: 768px) 50vw, 40vw" />
          </div>
        ))}
      </div>
    )
  }

  /* 5+ images — wide hero + remaining row (max 2 cols mobile, up to 4 desktop) */
  const [hero, ...rest] = imgs
  const cols = Math.min(rest.length, 4)
  const gridCols =
    cols <= 2 ? 'grid-cols-2' :
    cols === 3 ? 'grid-cols-2 sm:grid-cols-3' :
    'grid-cols-2 sm:grid-cols-4'
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="group relative w-full overflow-hidden" style={{ aspectRatio: '21/9' }}>
        <ProjectImg image={hero} sizes="100vw" />
      </div>
      <div className={cn('grid gap-2', gridCols)}>
        {rest.map((img, i) => (
          <div key={i} className="group relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <ProjectImg image={img} sizes="(max-width: 640px) 50vw, 25vw" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Section content ────────────────────────────────── */
function SectionContent({ section }: { section: ProjectSection }) {
  const hasContent = !!(section.content && section.content.length > 0)
  const hasImages = !!(section.images && section.images.length > 0)
  const imgCount = section.images?.filter(img => img?.asset).length ?? 0

  const textBlock = hasContent && (
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
  )

  /* Layout C:
     - No images   → text at comfortable reading width (max-w-prose)
     - 1 image     → text left 42% | image right (side by side)
     - 2+ images   → text full width above, grid below
  */

  if (!hasImages) {
    return <div className="max-w-prose">{textBlock}</div>
  }

  if (imgCount === 1) {
    return (
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        {hasContent && <div className="lg:w-[42%]">{textBlock}</div>}
        <SectionImageGrid
          images={section.images!}
          className={hasContent ? 'lg:flex-1' : 'w-full'}
        />
      </div>
    )
  }

  /* 2+ images */
  return (
    <div className="flex flex-col gap-8">
      {hasContent && <div className="max-w-prose">{textBlock}</div>}
      <SectionImageGrid images={section.images!} />
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
            {/* Header */}
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

            {/* Expandable content */}
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
