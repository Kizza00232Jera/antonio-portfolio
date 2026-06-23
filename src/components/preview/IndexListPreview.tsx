'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getThumbnailUrl, padIndex } from '@/utils/project'
import { formatDateCompact } from '@/utils/format'
import { useProjectZoom } from './useProjectZoom'
import { MobileProjectCard } from '@/components/ui/MobileProjectCard'
import type { Project } from '@/lib/sanity/types'

export function IndexListPreview({ projects }: { projects: Project[] }) {
  const previewRef = useRef<HTMLDivElement>(null)
  const previewInnerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const zoom = useProjectZoom()

  // Move the floating preview to follow the cursor (transform = cheap, no reflow)
  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = previewRef.current
    if (!el) return
    el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
  }, [])

  return (
    <>
      {/* ── Mobile (< 768px): reuse existing stacked cards ── */}
      <div className="flex flex-col border-t border-border md:hidden">
        {projects.map((p, i) => (
          <MobileProjectCard key={p._id} project={p} index={i} />
        ))}
      </div>

      {/* ── Desktop interactive index ── */}
      <div
        className="relative hidden md:block"
        onMouseMove={handleMove}
        onMouseLeave={() => setActive(null)}
      >
        <ul className="border-t border-border">
          {projects.map((project, i) => {
            const isActive = active === i
            const isDimmed = active !== null && !isActive
            return (
              <li key={project._id} className="border-b border-border">
                <Link
                  href={`/projects/${project.slug.current}`}
                  onClick={(e) => {
                    e.preventDefault()
                    zoom(project, previewInnerRef.current)
                  }}
                  onMouseEnter={() => setActive(i)}
                  className="group flex cursor-none items-center gap-6 py-6 transition-opacity duration-300 md:py-7"
                  style={{ opacity: isDimmed ? 0.35 : 1 }}
                  data-cursor-hide
                >
                  <span className="w-10 shrink-0 font-ui text-xs tabular-nums text-text-muted">
                    {padIndex(i)}
                  </span>

                  <span
                    className="flex-1 font-heading font-bold uppercase leading-none text-text transition-transform duration-300 ease-out group-hover:translate-x-3"
                    style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.5rem)' }}
                  >
                    {project.title}
                  </span>

                  {project.tags?.[0] && (
                    <span className="hidden shrink-0 font-ui text-[0.7rem] uppercase tracking-widest text-text-muted lg:block">
                      {project.tags[0].name}
                    </span>
                  )}

                  {project.publishedAt && (
                    <span className="w-16 shrink-0 text-right font-ui text-[0.7rem] uppercase tracking-widest text-text-muted">
                      {formatDateCompact(project.publishedAt)}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Floating preview — follows cursor, fades in on hover */}
        <div
          ref={previewRef}
          className="pointer-events-none fixed left-0 top-0 z-20 -ml-[11rem] -mt-[7.5rem] hidden md:block"
          style={{ willChange: 'transform' }}
        >
          <div
            ref={previewInnerRef}
            className="relative h-[15rem] w-[22rem] overflow-hidden rounded-lg shadow-2xl transition-[opacity,transform] duration-300 ease-out"
            style={{
              opacity: active !== null ? 1 : 0,
              transform: active !== null ? 'scale(1)' : 'scale(0.92)',
            }}
          >
            {projects.map((project, i) => {
              const thumb = getThumbnailUrl(project)
              if (!thumb) return null
              return (
                <Image
                  key={project._id}
                  src={thumb}
                  alt={project.title}
                  fill
                  sizes="22rem"
                  className="object-cover transition-opacity duration-200"
                  style={{ opacity: active === i ? 1 : 0 }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
