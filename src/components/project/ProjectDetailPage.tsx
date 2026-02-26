'use client'

import { useRef, useEffect } from 'react'
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
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

interface ProjectDetailPageProps {
  project: Project
  posterUrl?: string
}

export function ProjectDetailPage({ project, posterUrl }: ProjectDetailPageProps) {
  const { isTransitioning, startExitTransition } = useProjectTransition()
  const contentRef = useRef<HTMLDivElement>(null)

  // Entrance animation — only for direct URL access (no transition)
  // When arriving via transition, the TransitionOverlay handles the stagger
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
          delay: 0.2,
        },
      )
    }, contentRef)

    return () => ctx.revert()
  }, [isTransitioning])

  const closeButtonClass =
    'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border text-lg text-text-muted transition-colors hover:text-text'
  const metaLabelClass =
    'block font-mono text-[0.625rem] uppercase tracking-widest text-text-muted/60'
  const metaValueClass = 'text-sm text-text md:text-2xl'

  return (
    <div ref={contentRef} className="overflow-x-hidden">
      {/* Hero section — 75dvh so the video peeks in below */}
      <div style={{ height: '75dvh', paddingInline: 'clamp(1.5rem, 8vw, 12rem)' }}>

        {/* ===== MOBILE LAYOUT (< lg): 2-col grid matching reference ===== */}
        <div className="flex h-full flex-col pt-24 pb-8 lg:hidden">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4" data-animate>
            {/* Row 1, col 1: X close button */}
            <button
              onClick={() => startExitTransition()}
              className={closeButtonClass}
              aria-label="Back to projects"
            >
              &times;
            </button>

            {/* Row 1, col 2: GitHub */}
            <div>
              {project.githubUrl ? (
                <>
                  <span className={metaLabelClass}>GitHub</span>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text transition-colors hover:text-accent"
                  >
                    View Repo
                  </a>
                </>
              ) : (
                <span />
              )}
            </div>

            {/* Row 2, col 1: Date */}
            <div>
              {project.publishedAt && (
                <>
                  <span className={metaLabelClass}>Date</span>
                  <span className="text-sm text-text">
                    {formatDate(project.publishedAt)}
                  </span>
                </>
              )}
            </div>

            {/* Row 2, col 2: Focus Areas */}
            <div>
              {project.focusAreas && project.focusAreas.length > 0 && (
                <>
                  <span className={metaLabelClass}>Focus Areas</span>
                  {project.focusAreas.map((area) => (
                    <p key={area} className="text-sm text-text">
                      {area}
                    </p>
                  ))}
                </>
              )}
            </div>

            {/* Row 3, col 1: empty spacer */}
            <div />

            {/* Row 3, col 2: Live Website */}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm text-text underline underline-offset-4 transition-colors hover:text-accent"
              >
                Live Website &rarr;
              </a>
            )}
          </div>

          {/* Title — pushed to bottom */}
          <div className="mt-auto" data-animate>
            <h1
              className="font-heading font-bold uppercase leading-[0.9] text-text"
              style={{ fontSize: 'clamp(2rem, 8vw, 7rem)' }}
            >
              {project.title}
            </h1>
            {project.tagline && (
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {project.tagline}
              </p>
            )}
          </div>
        </div>

        {/* ===== DESKTOP LAYOUT (lg+): two-column flex ===== */}
        <div className="hidden h-full lg:flex">
          {/* Left column — X close button top, "Scroll for more" bottom */}
          <div className="flex w-[25%] shrink-0 flex-col justify-between pt-28 pb-8">
            <button
              onClick={() => startExitTransition()}
              className={closeButtonClass}
              aria-label="Back to projects"
              data-animate
            >
              &times;
            </button>
            <span
              className="font-mono text-[0.625rem] uppercase tracking-widest text-text-muted"
              data-animate
            >
              &darr; Scroll for more
            </span>
          </div>

          {/* Right column — metadata top, huge title bottom */}
          <div className="flex min-w-0 flex-1 flex-col justify-between pt-28 pb-8">
            {/* Metadata row */}
            <div className="flex items-baseline justify-between" data-animate>
              <div className="flex items-baseline gap-8">
                {project.githubUrl && (
                  <div>
                    <span className={metaLabelClass}>GitHub</span>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${metaValueClass} transition-colors hover:text-accent`}
                    >
                      View Repo
                    </a>
                  </div>
                )}
                {project.focusAreas && project.focusAreas.length > 0 && (
                  <div>
                    <span className={metaLabelClass}>Focus Areas</span>
                    {project.focusAreas.map((area) => (
                      <p key={area} className={metaValueClass}>
                        {area}
                      </p>
                    ))}
                  </div>
                )}
                {project.publishedAt && (
                  <div>
                    <span className={metaLabelClass}>Date</span>
                    <span className={metaValueClass}>
                      {formatDate(project.publishedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Live website link on far right */}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${metaValueClass} inline-flex items-center gap-2 underline underline-offset-4 transition-colors hover:text-accent`}
                >
                  Live Website &rarr;
                </a>
              )}
            </div>

            {/* Huge title — pushed to bottom */}
            <div data-animate>
              <h1
                className="font-heading font-bold uppercase leading-[0.9] text-text"
                style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)' }}
              >
                {project.title}
              </h1>
              {project.tagline && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted md:text-2xl">
                  {project.tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero video or cover image — full width, no data-animate so it's
         visible immediately under the fading overlay for seamless handoff */}
      <div className="w-full">
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
