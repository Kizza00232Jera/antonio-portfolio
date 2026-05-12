'use client'

import { useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/image'
import type { Project } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'
import { useProjectTransition } from '@/contexts/ProjectTransitionContext'
import { formatDateCompact } from '@/utils/format'
import { getThumbnailUrl } from '@/utils/project'

interface HorizontalProjectCardProps {
  project: Project
  className?: string
}

export function HorizontalProjectCard({
  project,
  className,
}: HorizontalProjectCardProps) {
  const cursorRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const { startTransition } = useProjectTransition()

  const thumbnailUrl = getThumbnailUrl(project)

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

  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      const imageEl = imageContainerRef.current
      if (!imageEl || !thumbnailUrl) return

      const rect = imageEl.getBoundingClientRect()

      startTransition({
        slug: project.slug.current,
        thumbnailUrl,
        imageRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        projectTitle: project.title,
        publishedAt: project.publishedAt,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        muxVideoId: project.muxVideoId,
      })
    },
    [project, thumbnailUrl, startTransition],
  )

  return (
    <div
      className={cn(
        'h-full max-w-full shrink-0 border-l border-border p-5 last:border-r md:px-10 md:pb-5 md:pt-4',
        className,
      )}
      style={{ aspectRatio: '49 / 72' }}
    >
      <div className="flex h-full flex-col justify-center">
        {/* Image + annotation row — only the image links to the project */}
        {thumbnailUrl && (
          <div className="flex min-h-0 w-full" style={{ aspectRatio: '4 / 3' }}>
            {/* Image — clickable, triggers transition */}
            <Link
              href={`/projects/${project.slug.current}`}
              onClick={handleImageClick}
              className="group relative block min-w-0 flex-1 cursor-none overflow-hidden"
              data-cursor-hide
            >
              <div
                ref={imageContainerRef}
                className="relative h-full w-full"
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

                {/* Custom cursor — beige circle with arrow + "View Project" label */}
                <div
                  ref={cursorRef}
                  className="pointer-events-none absolute opacity-0 transition-[opacity,transform] duration-200"
                  style={{ transform: 'translate(-50%, -50%) scale(0.5)' }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg">
                      <span className="text-xl text-text">&rarr;</span>
                    </div>
                    <span className="whitespace-nowrap text-[0.625rem] tracking-wide text-text-muted">
                      View Project
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Right annotation column */}
            <div className="ml-3 flex shrink-0 flex-col [writing-mode:vertical-rl]">
              {project.publishedAt && (
                <span className="inline-block font-ui text-[0.625rem] uppercase tracking-widest text-text-muted">
                  {formatDateCompact(project.publishedAt)}
                </span>
              )}
              {project.tags && project.tags.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-4 font-ui text-[0.625rem] uppercase tracking-widest text-text-muted">
                  {project.tags.map((tag) => (
                    <span key={tag._id}>{tag.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text area — not clickable, normal cursor */}
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
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-ui text-[0.625rem] uppercase tracking-wider text-text-muted">
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
                  className="flex items-center gap-1 font-ui text-[0.625rem] text-text-muted"
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
            <p className="mt-1.5 font-ui text-[0.625rem] uppercase tracking-wider text-text-muted">
              {project.techStack.join('  ·  ')}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
