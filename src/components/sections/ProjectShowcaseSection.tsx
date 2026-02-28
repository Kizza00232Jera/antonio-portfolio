'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { urlFor } from '@/lib/sanity/image'
import type { Project } from '@/lib/sanity/types'

/* ── Helpers ─────────────────────────────────────────────── */

function getThumbnailUrl(project: Project): string | null {
  if (project.muxVideoId) {
    return `https://image.mux.com/${project.muxVideoId}/thumbnail.png?width=500&height=670&fit_mode=smartcrop`
  }
  if (project.coverImage) {
    return urlFor(project.coverImage).width(500).height(670).quality(80).url()
  }
  return null
}

/* ── Arc configuration ───────────────────────────────────── *
 *
 * Cards are arranged along an invisible circular arc.
 * The arc center is far below the viewport, so only
 * the top portion of the circle is visible — creating
 * a gentle upward curve.
 *
 * Each card position ("slot") is defined by its offset
 * from the center (active) card:
 *   offset  0 = center (biggest, no rotation)
 *   offset ±1 = first neighbors (slight rotation + drop)
 *   offset ±2 = second neighbors (more rotation + drop)
 *   ...etc
 *
 * The math:
 *   x = R × sin(offset × angleStep)
 *   y = R × (1 − cos(offset × angleStep))
 *   rotation = offset × angleStep
 *
 * "y" is positive downward, so side cards sit lower
 * than the center — following the arc curve naturally.
 * ──────────────────────────────────────────────────────── */

const ARC_RADIUS = 2000
const ANGLE_STEP = 18
const MAX_VISIBLE = 2
const SCALE_STEP = 0.12
const ANIM_DURATION = 0.7

function getSlotProps(offset: number) {
  const angleDeg = offset * ANGLE_STEP
  const angleRad = angleDeg * (Math.PI / 180)
  const absOffset = Math.abs(offset)

  return {
    x: ARC_RADIUS * Math.sin(angleRad),
    y: ARC_RADIUS * (1 - Math.cos(angleRad)),
    rotation: angleDeg,
    scale: Math.max(0.5, 1 - absOffset * SCALE_STEP),
    opacity: absOffset <= MAX_VISIBLE ? 1 : 0,
  }
}

/* ── Component ────────────────────────────────────────────── */

interface ProjectShowcaseSectionProps {
  projects: Project[]
}

export default function ProjectShowcaseSection({
  projects,
}: ProjectShowcaseSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const animatingRef = useRef(false)
  const initialRenderRef = useRef(true)
  const touchStartRef = useRef(0)

  const activeProject = projects[activeIndex]

  /* ── Position all cards based on activeIndex ── */
  useEffect(() => {
    const animate = !initialRenderRef.current
    initialRenderRef.current = false

    const total = projects.length

    cardRefs.current.forEach((card, i) => {
      if (!card) return
      let offset = i - activeIndex
      if (offset > total / 2) offset -= total
      if (offset < -total / 2) offset += total
      const props = getSlotProps(offset)
      const isCenter = offset === 0

      if (animate) {
        gsap.to(card, {
          x: props.x,
          y: props.y,
          rotation: props.rotation,
          scale: props.scale,
          opacity: props.opacity,
          duration: ANIM_DURATION,
          ease: 'power3.inOut',
        })
      } else {
        gsap.set(card, {
          x: props.x,
          y: props.y,
          rotation: props.rotation,
          scale: props.scale,
          opacity: props.opacity,
        })
      }

      card.style.pointerEvents = isCenter ? 'auto' : 'none'
    })

    if (animate) {
      animatingRef.current = true
      setTimeout(() => {
        animatingRef.current = false
      }, ANIM_DURATION * 1000)
    }
  }, [activeIndex, projects])

  /* ── Navigate left / right ── */
  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (animatingRef.current) return
      setActiveIndex((prev) => {
        const next = prev + dir
        if (next < 0) return projects.length - 1
        if (next >= projects.length) return 0
        return next
      })
    },
    [projects.length],
  )

  /* ── Keyboard arrows ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  /* ── Touch / swipe ── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = e.changedTouches[0].clientX - touchStartRef.current
      if (Math.abs(delta) > 50) {
        navigate(delta > 0 ? -1 : 1)
      }
    },
    [navigate],
  )

  /* ── Kill GSAP tweens on unmount ── */
  useEffect(() => {
    return () => {
      cardRefs.current.forEach((card) => {
        if (card) gsap.killTweensOf(card)
      })
    }
  }, [])

  if (projects.length === 0) return null

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: '100vh' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Cards — absolute in section, no wrapper ───────── */}
      {projects.map((project, i) => {
        const thumbnailUrl = getThumbnailUrl(project)

        return (
          <div
            key={project._id}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="absolute will-change-transform"
            style={{
              width: 300,
              height: 400,
              left: '50%',
              top: '28%',
              marginLeft: -150,
              marginTop: -200,
            }}
          >
            <Link
              href={`/projects/${project.slug.current}`}
              className="relative block h-full w-full overflow-hidden rounded-xl"
            >
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={project.title}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-bg-alt text-sm text-text-muted">
                  No image
                </div>
              )}
            </Link>
          </div>
        )
      })}

      {/* ── Bottom: project info + navigation ─────────────── *
       * Pinned to bottom of section. Uses percentage height
       * so there's plenty of room for the paragraph.
       * Title stays at a fixed position; paragraph grows
       * downward; arrows stay at the very bottom.
       * ───────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col text-center px-6"
        style={{ height: '40%' }}
      >
        {activeProject?.tags && activeProject.tags.length > 0 && (
          <p className="mb-2 font-ui text-sm uppercase tracking-widest text-text-muted">
            {activeProject.tags.map((tag) => tag.name).join(' / ')}
          </p>
        )}

        <h2 className="font-heading font-bold leading-tight text-text text-[length:var(--text-display)]">
          {activeProject?.title}
        </h2>

        {/* Paragraph — flex-1 fills all remaining space between title and arrows */}
        <div className="mt-3 flex-1 max-w-lg mx-auto overflow-hidden">
          {activeProject?.tagline && (
            <p className="text-text-muted leading-relaxed text-[length:var(--text-body)]">
              {activeProject.tagline}
            </p>
          )}
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-border text-text transition-colors hover:bg-text hover:text-bg"
            aria-label="Previous project"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <span className="font-ui text-xs text-text-muted tabular-nums">
            {activeIndex + 1} / {projects.length}
          </span>

          <button
            onClick={() => navigate(1)}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-border text-text transition-colors hover:bg-text hover:text-bg"
            aria-label="Next project"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* View all projects link */}
        <Link
          href="/projects"
          className="mt-4 pb-6 inline-block text-sm font-medium text-text-muted underline underline-offset-4 decoration-border transition-colors hover:text-text hover:decoration-accent"
        >
          See all projects &rarr;
        </Link>
      </div>
    </section>
  )
}
