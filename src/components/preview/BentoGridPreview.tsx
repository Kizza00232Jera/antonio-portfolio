'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/image'
import { getThumbnailUrl } from '@/utils/project'
import { formatDateCompact } from '@/utils/format'
import { useProjectZoom } from './useProjectZoom'
import { MobileProjectCard } from '@/components/ui/MobileProjectCard'
import type { Project } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'

const MAX_TECH = 4

function BentoCard({ project, wide }: { project: Project; wide: boolean }) {
  const imageRef = useRef<HTMLDivElement>(null)
  const zoom = useProjectZoom()
  const thumb = getThumbnailUrl(project)
  const tech = project.techStackRefs ?? []
  const shown = tech.slice(0, MAX_TECH)
  const extra = tech.length - shown.length

  return (
    <article
      className={cn(
        'group flex flex-col',
        wide ? 'lg:col-span-2' : 'lg:col-span-1',
      )}
    >
      <Link
        href={`/projects/${project.slug.current}`}
        onClick={(e) => {
          e.preventDefault()
          zoom(project, imageRef.current)
        }}
        className={cn(
          'relative block w-full overflow-hidden rounded-xl bg-bg-alt',
          wide ? 'aspect-[16/9]' : 'aspect-[4/3]',
        )}
      >
        <div ref={imageRef} className="relative h-full w-full">
          {thumb && (
            <Image
              src={thumb}
              alt={project.title}
              fill
              sizes={wide ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          )}
          {/* subtle dark wash on hover so the title chip is legible */}
          <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
        </div>
      </Link>

      <div className="mt-4 flex flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            className={cn(
              'font-body font-medium leading-snug text-text',
              wide ? 'text-xl md:text-2xl' : 'text-lg',
            )}
          >
            {project.title}
          </h2>
          {project.publishedAt && (
            <span className="shrink-0 font-ui text-[0.625rem] uppercase tracking-widest text-text-muted">
              {formatDateCompact(project.publishedAt)}
            </span>
          )}
        </div>

        {project.tagline && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
            {project.tagline}
          </p>
        )}

        {tech.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            {shown.map((t) => (
              <span
                key={t._id}
                className="flex items-center gap-1.5 font-ui text-[0.7rem] text-text-muted"
                title={t.name}
              >
                {t.icon && (
                  <Image
                    src={urlFor(t.icon).width(20).height(20).url()}
                    alt={t.name}
                    width={16}
                    height={16}
                    className="h-4 w-4 object-contain"
                  />
                )}
                {t.name}
              </span>
            ))}
            {extra > 0 && (
              <span className="font-ui text-[0.7rem] text-text-muted">+{extra}</span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export function BentoGridPreview({ projects }: { projects: Project[] }) {
  const gridRef = useRef<HTMLDivElement>(null)

  // Scroll-reveal stagger via IntersectionObserver (no GSAP plugin needed)
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((i) => i.classList.add('is-revealed'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    items.forEach((i) => io.observe(i))
    return () => io.disconnect()
  }, [projects])

  return (
    <>
      {/* ── Mobile (< 768px): reuse existing stacked cards ── */}
      <div className="flex flex-col border-t border-border md:hidden">
        {projects.map((p, i) => (
          <MobileProjectCard key={p._id} project={p} index={i} />
        ))}
      </div>

      {/* ── Desktop bento ── */}
      <div
        ref={gridRef}
        className="hidden grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 md:grid lg:grid-cols-3"
      >
        {projects.map((p, i) => (
          <div
            key={p._id}
            data-reveal
            className="reveal-item"
            style={{ transitionDelay: `${(i % 3) * 90}ms` }}
          >
            <BentoCard project={p} wide={!!p.featured} />
          </div>
        ))}
      </div>
    </>
  )
}
