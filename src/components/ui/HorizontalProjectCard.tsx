'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/image'
import type { Project } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'

interface HorizontalProjectCardProps {
  project: Project
  className?: string
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase()
}

export function HorizontalProjectCard({
  project,
  className,
}: HorizontalProjectCardProps) {
  const cursorRef = useRef<HTMLDivElement>(null)

  const thumbnailUrl = project.muxVideoId
    ? `https://image.mux.com/${project.muxVideoId}/thumbnail.png?width=900&height=1200&fit_mode=smartcrop`
    : project.coverImage
      ? urlFor(project.coverImage).width(900).height(1200).quality(80).url()
      : null

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cursorRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    cursorRef.current.style.left = `${e.clientX - rect.left}px`
    cursorRef.current.style.top = `${e.clientY - rect.top}px`
    cursorRef.current.style.opacity = '1'
    cursorRef.current.style.transform = 'translate(-50%, -50%) scale(1)'
  }

  const handleMouseLeave = () => {
    if (!cursorRef.current) return
    cursorRef.current.style.opacity = '0'
    cursorRef.current.style.transform = 'translate(-50%, -50%) scale(0.5)'
  }

  return (
    <Link
      href={`/projects/${project.slug.current}`}
      className={cn(
        'group block w-[75vw] shrink-0 border-l border-border pl-8 sm:w-[55vw] lg:w-[32vw]',
        className,
      )}
    >
      {/* Image area + vertical annotation strip */}
      {thumbnailUrl && (
        <div className="flex">
          {/* Main image with custom cursor */}
          <div
            className="relative flex-1 aspect-[3/4] cursor-none overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Image
              src={thumbnailUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 75vw, (max-width: 1024px) 55vw, 32vw"
            />

            {/* Custom "VIEW" cursor */}
            <div
              ref={cursorRef}
              className="pointer-events-none absolute z-10 opacity-0 transition-[opacity,transform] duration-200"
              style={{ transform: 'translate(-50%, -50%) scale(0.5)' }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-text/90 font-mono text-[10px] font-medium uppercase tracking-widest text-bg">
                View
              </div>
            </div>
          </div>

          {/* Right annotation column — date + tags (vertical text) */}
          <div className="flex w-10 shrink-0 flex-col items-center justify-between border-l border-border py-4">
            {project.publishedAt && (
              <span className="[writing-mode:vertical-rl] font-mono text-[10px] uppercase tracking-widest text-text-muted">
                {formatDate(project.publishedAt)}
              </span>
            )}
            {project.tags && project.tags.length > 0 && (
              <div className="[writing-mode:vertical-rl] flex gap-1.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                {project.tags.map((tag) => (
                  <span key={tag._id}>{tag.name}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mt-2 h-px bg-border" />

      {/* Title + links row */}
      <div className="flex items-start justify-between gap-4 py-2">
        <h2 className="font-heading text-lg font-bold leading-tight text-text md:text-xl">
          {project.title}
        </h2>
        <div className="flex shrink-0 gap-4 pt-0.5">
          {project.liveUrl && (
            <span
              className="font-mono text-[10px] uppercase tracking-wider text-text-muted underline underline-offset-4 transition-colors hover:text-accent"
              onClick={(e) => {
                e.preventDefault()
                window.open(project.liveUrl, '_blank', 'noopener,noreferrer')
              }}
            >
              Demo
            </span>
          )}
          {project.githubUrl && (
            <span
              className="font-mono text-[10px] uppercase tracking-wider text-text-muted underline underline-offset-4 transition-colors hover:text-accent"
              onClick={(e) => {
                e.preventDefault()
                window.open(project.githubUrl, '_blank', 'noopener,noreferrer')
              }}
            >
              GitHub
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {project.tagline && (
        <p className="text-xs leading-relaxed text-text-muted line-clamp-2">
          {project.tagline}
        </p>
      )}

      {/* Tech stack */}
      {project.techStackRefs && project.techStackRefs.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {project.techStackRefs.map((tech) => (
            <span
              key={tech._id}
              className="flex items-center gap-1 font-mono text-[10px] text-text-muted"
            >
              {tech.icon && (
                <Image
                  src={urlFor(tech.icon).width(16).height(16).url()}
                  alt={tech.name}
                  width={16}
                  height={16}
                  className="h-3 w-3 object-contain"
                />
              )}
              {tech.name}
            </span>
          ))}
        </div>
      ) : project.techStack && project.techStack.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {project.techStack.map((name) => (
            <span key={name} className="font-mono text-[10px] text-text-muted">
              {name}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  )
}
