'use client'

import { useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'
import { useProjectTransition } from '@/contexts/ProjectTransitionContext'
import { formatDateCompact } from '@/utils/format'
import { getThumbnailUrl } from '@/utils/project'
import { TechStackStrip } from '@/components/ui/TechStackStrip'
import { CornerTagRotator } from '@/components/ui/CornerTagRotator'

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
      // Width normally follows the portrait aspect ratio (driven by viewport
      // height), but a vw-based floor keeps cards from going narrow and
      // cramped on short laptop screens — so fewer, larger cards are visible.
      // On tall/large screens the aspect width already exceeds the floor, so
      // those layouts are unchanged.
      style={{ aspectRatio: '49 / 72', minWidth: 'min(86vw, 38rem)' }}
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
                    <span className="whitespace-nowrap text-xs tracking-wide text-text-muted">
                      View Project
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Right annotation column — date pinned to the top corner, tags
                to the bottom corner, each as a single vertical line. A normal
                flex column with per-item vertical writing-mode keeps the
                corners predictable at any image height; the previous
                writing-mode-on-the-flex-container approach collapsed into two
                side-by-side columns on short (laptop) screens. */}
            <div className="ml-3 flex shrink-0 flex-col items-center justify-between">
              {project.publishedAt && (
                <span className="[writing-mode:vertical-rl] font-ui text-xs uppercase tracking-widest text-text-muted">
                  {formatDateCompact(project.publishedAt)}
                </span>
              )}
              {project.tags && project.tags.length > 0 && (
                <CornerTagRotator
                  tags={project.tags.map((tag) => tag.name)}
                  className="font-ui text-xs uppercase tracking-widest text-text-muted"
                />
              )}
            </div>
          </div>
        )}

        {/* Text area — not clickable, normal cursor */}
        <div className="mt-4 shrink-0">
          <h2 className="overflow-hidden text-ellipsis whitespace-normal font-body text-xl font-medium leading-snug text-text md:text-2xl lg:text-3xl">
            {project.title}
          </h2>

          {project.tagline && (
            <p className="mt-3 line-clamp-3 whitespace-normal text-sm leading-relaxed text-text-muted md:text-base">
              {project.tagline}
            </p>
          )}

          {project.techStackRefs && project.techStackRefs.length > 0 ? (
            <TechStackStrip items={project.techStackRefs} className="mt-4" />
          ) : project.techStack && project.techStack.length > 0 ? (
            <p className="mt-2 truncate font-ui text-xs uppercase tracking-wider text-text-muted md:text-sm">
              {project.techStack.join('  ·  ')}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
