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
    <div
      className={cn(
        'h-full max-w-full shrink-0 border-l border-border p-5 last:border-r md:px-10 md:pb-5 md:pt-4',
        className,
      )}
      style={{ aspectRatio: '49 / 72' }}
    >
      <Link
        href={`/projects/${project.slug.current}`}
        className="group flex h-full flex-col justify-center"
      >
        {/* Image + annotation row — top 50% */}
        {thumbnailUrl && (
          <div className="flex h-[72%] min-h-0">
            {/* Image — Next.js fill needs a relative parent with dimensions */}
            <div
              className="relative min-w-0 flex-1 cursor-none overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <Image
                src={thumbnailUrl}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 80vw, 40vw"
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

            {/* Right annotation column */}
            <div className="ml-3 flex shrink-0 flex-col [writing-mode:vertical-rl]">
              {project.publishedAt && (
                <span className="inline-block font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {formatDate(project.publishedAt)}
                </span>
              )}
              {project.tags && project.tags.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {project.tags.map((tag) => (
                    <span key={tag._id}>{tag.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text area — natural height, centered with image by justify-center */}
        <div className="mt-4 shrink-0">
          <h2 className="overflow-hidden text-ellipsis whitespace-normal font-body text-base font-medium leading-snug text-text md:text-lg">
            {project.title}
          </h2>

          {project.tagline && (
            <p className="mt-2 line-clamp-2 whitespace-normal text-xs leading-relaxed text-text-muted">
              {project.tagline}
            </p>
          )}

          {project.tags && project.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {project.tags.map((tag) => (
                <span key={tag._id}>{tag.name}</span>
              ))}
            </div>
          )}

          {project.techStackRefs && project.techStackRefs.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
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
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {project.techStack.join('  ·  ')}
            </p>
          ) : null}
        </div>
      </Link>
    </div>
  )
}
