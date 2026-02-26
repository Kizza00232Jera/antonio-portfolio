'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useProjectTransition } from '@/contexts/ProjectTransitionContext'
import { urlFor } from '@/lib/sanity/image'
import type { Project } from '@/lib/sanity/types'

const MuxVideoPlayer = dynamic(
  () =>
    import('@/components/ui/MuxVideoPlayer').then((m) => m.MuxVideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video w-full animate-pulse bg-bg-alt" />
    ),
  },
)

const TechMarquee = dynamic(
  () => import('@/components/ui/TechMarquee').then((m) => m.TechMarquee),
  { ssr: false },
)

const ProjectAccordion = dynamic(
  () =>
    import('@/components/ui/ProjectAccordion').then((m) => m.ProjectAccordion),
  { ssr: false },
)

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

interface ProjectDetailPageProps {
  project: Project
  posterUrl?: string
}

export function ProjectDetailPage({ project, posterUrl }: ProjectDetailPageProps) {
  const { isTransitioning, startExitTransition } = useProjectTransition()
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)

  const handleClose = () => {
    startExitTransition()
  }

  // Entrance animation for direct URL access (no transition)
  useEffect(() => {
    if (isTransitioning) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      const elements = contentRef.current?.querySelectorAll('[data-animate]')
      if (!elements || elements.length === 0) return

      gsap.fromTo(
        elements,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.1,
        },
      )
    }, contentRef)

    return () => ctx.revert()
  }, [isTransitioning])

  return (
    <div ref={contentRef} className="min-h-screen">
      {/* Close button — top left, below header */}
      <button
        onClick={handleClose}
        className="fixed left-6 top-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border text-lg text-text-muted transition-colors hover:text-text"
        aria-label="Back to projects"
        data-animate
      >
        &times;
      </button>

      {/* Metadata row */}
      <div className="px-6 pt-24 pb-4" data-animate>
        <div className="flex items-baseline gap-8 text-sm text-text-muted">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-widest underline underline-offset-4 transition-colors hover:text-accent"
            >
              GitHub
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-widest underline underline-offset-4 transition-colors hover:text-accent"
            >
              Live Demo
            </a>
          )}
          {project.publishedAt && (
            <span className="font-mono text-xs uppercase tracking-widest">
              {formatDate(project.publishedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Huge title */}
      <div className="px-6 pb-8" data-animate>
        <h1
          className="font-heading font-bold uppercase leading-none text-text"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)' }}
        >
          {project.title}
        </h1>
        {project.tagline && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">
            {project.tagline}
          </p>
        )}
      </div>

      {/* Hero video or cover image — full width */}
      <div className="w-full" data-animate>
        {project.muxVideoId ? (
          <MuxVideoPlayer
            playbackId={project.muxVideoId}
            poster={posterUrl}
            title={project.title}
          />
        ) : project.coverImage ? (
          <Image
            src={urlFor(project.coverImage).width(1920).quality(85).url()}
            alt={project.title}
            width={1920}
            height={1080}
            className="w-full object-cover"
            sizes="100vw"
            priority
          />
        ) : null}
      </div>

      {/* Tech marquee + accordion sections */}
      <div className="mx-auto max-w-[var(--max-width)] px-6 py-12">
        {project.techStackRefs && project.techStackRefs.length > 0 && (
          <div data-animate>
            <TechMarquee items={project.techStackRefs} className="mb-12" />
          </div>
        )}
        {project.sections && project.sections.length > 0 && (
          <div data-animate>
            <ProjectAccordion sections={project.sections} className="mb-12" />
          </div>
        )}
      </div>
    </div>
  )
}
