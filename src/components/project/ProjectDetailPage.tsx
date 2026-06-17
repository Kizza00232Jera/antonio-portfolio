'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useProjectTransition } from '@/contexts/ProjectTransitionContext'
import { urlFor } from '@/lib/sanity/image'
import type { Project } from '@/lib/sanity/types'
import type { RelatedPost } from '@/lib/sanity/queries'
import { formatDateShort } from '@/utils/format'

gsap.registerPlugin(ScrollTrigger)

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

interface ProjectDetailPageProps {
  project: Project
  posterUrl?: string
  relatedPosts?: RelatedPost[]
}

export function ProjectDetailPage({ project, posterUrl, relatedPosts }: ProjectDetailPageProps) {
  const router = useRouter()
  const { isTransitioning } = useProjectTransition()
  const contentRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const videoWrapperRef = useRef<HTMLDivElement>(null)
  const focusListRef = useRef<HTMLDivElement>(null)
  const titleBlockRef = useRef<HTMLDivElement>(null)
  const arrivedViaTransition = useRef(false)
  const [focusCount, setFocusCount] = useState<number | null>(null)

  // Fit the focus-area count to the hero: SSR renders all, then the client
  // shows only as many rows as leave breathing room above the title.
  // Mobile keeps a simple cap so the grid stays short.
  useEffect(() => {
    const total = project.focusAreas?.length ?? 0
    if (total === 0) return

    const measure = () => {
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        setFocusCount(Math.min(4, total))
        return
      }
      const hero = heroRef.current
      const item = focusListRef.current?.querySelector('p')
      const titleBlock = titleBlockRef.current
      if (!hero || !item || !titleBlock) return
      const rowH = item.getBoundingClientRect().height
      if (rowH <= 0) return
      // first row's offset inside the hero is scroll-independent
      const itemsTop = item.getBoundingClientRect().top - hero.getBoundingClientRect().top
      const heroH = window.innerHeight * 0.75 // hero min-height (75dvh)
      // titleBlock.offsetHeight already includes its pt-10 gap above the title
      const reserved = titleBlock.offsetHeight + 32 /* hero pb-8 */ + 8 /* buffer */
      const budget = heroH - itemsTop - reserved
      setFocusCount(Math.min(total, Math.max(2, Math.floor(budget / rowH))))
    }

    const raf = requestAnimationFrame(measure)
    document.fonts?.ready.then(measure).catch(() => {})
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [project.focusAreas])

  const focusShown = project.focusAreas?.slice(0, focusCount ?? project.focusAreas.length)

  // Track if we ever entered via transition — prevents the entrance
  // animation from re-firing when isTransitioning flips back to false
  useEffect(() => {
    if (isTransitioning) {
      arrivedViaTransition.current = true
    }
  }, [isTransitioning])

  // Entrance animation — only for direct URL access (no transition)
  // When arriving via transition, the TransitionOverlay handles the stagger
  useEffect(() => {
    if (isTransitioning || arrivedViaTransition.current) return

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

  // Scroll-driven video shrink — desktop only
  // Video starts full-width and shrinks to match the hero content padding
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const hero = heroRef.current
    const videoWrapper = videoWrapperRef.current
    if (!hero || !videoWrapper) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px)', () => {
      gsap.fromTo(videoWrapper,
        { paddingInline: 0 },
        {
          paddingInline: () => parseFloat(getComputedStyle(hero).paddingLeft),
          ease: 'none',
          scrollTrigger: {
            trigger: videoWrapper,
            start: 'top 75%',
            end: 'top 25%',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        },
      )
    })

    return () => mm.revert()
  }, [])

  const closeButtonClass =
    'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-text/25 text-lg text-text transition-colors hover:border-text/60'
  const metaLabelClass =
    'block font-ui text-xs uppercase tracking-widest text-text-muted'
  const metaValueClass = 'text-sm text-text md:text-2xl'

  return (
    <div ref={contentRef} className="overflow-x-hidden">
      {/* Hero section — min 75dvh so the video peeks in below; grows with
          content (e.g. two live links) instead of overflowing onto the video */}
      <div
        ref={heroRef}
        className="flex flex-col"
        style={{ minHeight: '75dvh', paddingInline: 'clamp(1.5rem, 8vw, 12rem)' }}
      >

        {/* ===== MOBILE LAYOUT (< lg): 2-col grid matching reference ===== */}
        <div className="flex grow flex-col pt-24 pb-8 lg:hidden">
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2" data-animate>
            {/* Row 1, col 1: X close button */}
            <button
              onClick={() => { router.push('/projects') }}
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
                    {formatDateShort(project.publishedAt)}
                  </span>
                </>
              )}
            </div>

            {/* Row 2, col 2: Focus Areas */}
            <div>
              {focusShown && focusShown.length > 0 && (
                <>
                  <span className={metaLabelClass}>Focus Areas</span>
                  {focusShown.map((area) => (
                    <p key={area} className="text-sm text-text">
                      {area}
                    </p>
                  ))}
                </>
              )}
            </div>

            {/* Row 3, col 1: empty spacer (2-col layout only) */}
            <div className="hidden md:block" />

            {/* Row 3, col 2: Live Website */}
            <div className="mt-2 flex flex-col gap-1">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-text underline underline-offset-4 transition-colors hover:text-accent"
                >
                  Live Website &rarr;
                </a>
              )}
              {project.liveUrl2 && (
                <a
                  href={project.liveUrl2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-text underline underline-offset-4 transition-colors hover:text-accent"
                >
                  View Process &rarr;
                </a>
              )}
            </div>
          </div>

          {/* Title — pushed to bottom; pt keeps a gap from the links above
              even when the hero is full and mt-auto collapses to zero */}
          <div className="mt-auto pt-10" data-animate>
            <h1
              className="font-heading font-bold uppercase leading-[0.9] text-text"
              style={{ fontSize: 'clamp(2rem, min(8vw, 9vh), 6.5rem)' }}
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
        <div className="hidden grow lg:flex">
          {/* Left column — X close button top, "Scroll for more" bottom */}
          <div className="flex w-[25%] shrink-0 flex-col justify-between pt-28 pb-8">
            <button
              onClick={() => { router.push('/projects') }}
              className={closeButtonClass}
              aria-label="Back to projects"
              data-animate
            >
              &times;
            </button>
            <span
              className="font-ui text-xs uppercase tracking-widest text-text-muted"
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
                {focusShown && focusShown.length > 0 && (
                  <div ref={focusListRef}>
                    <span className={metaLabelClass}>Focus Areas</span>
                    {focusShown.map((area) => (
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
                      {formatDateShort(project.publishedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Live website links on far right */}
              <div className="flex flex-col items-end gap-1">
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
                {project.liveUrl2 && (
                  <a
                    href={project.liveUrl2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${metaValueClass} inline-flex items-center gap-2 underline underline-offset-4 transition-colors hover:text-accent`}
                  >
                    View Process &rarr;
                  </a>
                )}
              </div>
            </div>

            {/* Huge title — pushed to bottom; vh term keeps it from towering
                on short laptop screens */}
            <div ref={titleBlockRef} className="pt-10" data-animate>
              <h1
                className="font-heading font-bold uppercase leading-[0.9] text-text"
                style={{ fontSize: 'clamp(2.25rem, min(6vw, 11vh), 6.5rem)' }}
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

      {/* Hero video or cover image — full width, shrinks on scroll (desktop) */}
      <div ref={videoWrapperRef} className="w-full">
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
      <div className="py-12" style={{ paddingInline: 'clamp(1.5rem, 8vw, 12rem)' }}>
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

        {/* Blogs linked to this project via the blogPost.project reference */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div data-animate>
            <h2 className="mb-6 font-ui text-[0.625rem] uppercase tracking-widest text-text-muted">
              Related blogs
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {relatedPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug.current}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border transition-colors hover:border-accent"
                >
                  <div className="relative aspect-video overflow-hidden bg-surface">
                    {post.heroImage ? (
                      <Image
                        src={urlFor(post.heroImage).width(600).height(338).quality(80).url()}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-surface-raised" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <p className="font-ui text-sm font-medium leading-snug text-text line-clamp-2">
                      {post.title}
                    </p>
                    {post.publishedAt && (
                      <time className="font-ui text-xs text-text-muted" dateTime={post.publishedAt}>
                        {formatDateShort(post.publishedAt)}
                      </time>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
