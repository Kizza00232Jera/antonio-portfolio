'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { urlFor } from '@/lib/sanity/image'
import { useProjectTransition } from '@/contexts/ProjectTransitionContext'
import type { Project } from '@/lib/sanity/types'

/* ── Helpers ─────────────────────────────────────────────── */

function getThumbnailUrl(project: Project): string | null {
  if (project.muxVideoId) {
    return `https://image.mux.com/${project.muxVideoId}/thumbnail.png?width=900&height=1200&fit_mode=smartcrop`
  }
  if (project.coverImage) {
    return urlFor(project.coverImage).width(900).height(1200).quality(80).url()
  }
  return null
}

const ANIM_DURATION = 0.6
const SLIDE_DISTANCE = 120 // px to slide in/out

/* ── Word-morph helpers ──────────────────────────────────── */

function populateWordSpans(container: HTMLDivElement, text: string) {
  while (container.firstChild) container.removeChild(container.firstChild)
  text.split(' ').filter(Boolean).forEach((word) => {
    const span = document.createElement('span')
    span.setAttribute('data-word', '')
    span.style.display = 'inline-block'
    span.style.marginRight = '0.25em'
    span.textContent = word
    container.appendChild(span)
  })
}

function runWordMorph(
  fromEl: HTMLDivElement,
  toEl: HTMLDivElement,
  oldText: string,
  newText: string,
) {
  populateWordSpans(fromEl, oldText)
  populateWordSpans(toEl, newText)

  const fromWords = fromEl.querySelectorAll<HTMLSpanElement>('[data-word]')
  const toWords = toEl.querySelectorAll<HTMLSpanElement>('[data-word]')

  gsap.set(fromWords, { x: 0, y: 0, autoAlpha: 1, color: '' })
  gsap.set(toWords, { x: 0, y: 0, autoAlpha: 0, color: '' })
  gsap.set(fromEl, { autoAlpha: 1 })
  gsap.set(toEl, { autoAlpha: 1 })

  const fromData = Array.from(fromWords).map((el) => ({
    el, text: el.textContent?.trim() || '', rect: el.getBoundingClientRect(),
  }))
  const toData = Array.from(toWords).map((el) => ({
    el, text: el.textContent?.trim() || '', rect: el.getBoundingClientRect(),
  }))

  const available = [...fromData]
  const matches: { from: (typeof fromData)[0]; to: (typeof toData)[0] }[] = []
  const unmatchedTo: typeof toData = []

  for (const tw of toData) {
    const idx = available.findIndex((fw) => fw.text === tw.text)
    if (idx !== -1) {
      matches.push({ from: available[idx], to: tw })
      available.splice(idx, 1)
    } else {
      unmatchedTo.push(tw)
    }
  }
  const unmatchedFrom = available

  const tl = gsap.timeline()
  matches.forEach((m, mi) => {
    tl.to(m.from.el, {
      x: m.to.rect.left - m.from.rect.left,
      y: m.to.rect.top - m.from.rect.top,
      duration: 0.8,
      ease: 'power3.inOut',
    }, mi * 0.03)
  })
  if (unmatchedFrom.length) {
    tl.to(unmatchedFrom.map((w) => w.el), { autoAlpha: 0, duration: 0.3 }, 0)
  }
  if (unmatchedTo.length) {
    const els = unmatchedTo.map((w) => w.el)
    tl.fromTo(els, { autoAlpha: 0, y: 20 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      stagger: { each: 0.03, from: 'random' },
      ease: 'power2.out',
    })
  }
  tl.add(() => {
    gsap.set(toWords, { autoAlpha: 1 })
    gsap.set(fromEl, { autoAlpha: 0 })
    populateWordSpans(fromEl, newText)
    gsap.set(fromEl, { autoAlpha: 1 })
    gsap.set(toEl, { autoAlpha: 0 })
  })
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
  const directionRef = useRef<1 | -1>(1)
  const { startTransition } = useProjectTransition()

  const prevTagsRef = useRef('')
  const tagsFromRef = useRef<HTMLDivElement>(null)
  const tagsToRef = useRef<HTMLDivElement>(null)
  const prevTitleRef = useRef('')
  const titleFromRef = useRef<HTMLDivElement>(null)
  const titleToRef = useRef<HTMLDivElement>(null)
  const prevTaglineRef = useRef('')
  const paraFromRef = useRef<HTMLDivElement>(null)
  const paraToRef = useRef<HTMLDivElement>(null)

  const sectionRef = useRef<HTMLElement>(null)
  const bottomPanelRef = useRef<HTMLDivElement>(null)
  const hasPlayedEntranceRef = useRef(false)

  /* ── Touch swipe state ── */
  const touchStartXRef = useRef(0)

  /* ── Populate word-morph containers after entrance ── */
  const populateInitialWordMorphs = useCallback(() => {
    const newTags = projects[0]?.tags?.map((t) => t.name).join(' / ') || ''
    const newTitle = projects[0]?.title || ''
    const newTagline = projects[0]?.tagline || ''

    if (tagsFromRef.current) populateWordSpans(tagsFromRef.current, newTags)
    if (tagsToRef.current) gsap.set(tagsToRef.current, { autoAlpha: 0 })
    if (titleFromRef.current) populateWordSpans(titleFromRef.current, newTitle)
    if (titleToRef.current) gsap.set(titleToRef.current, { autoAlpha: 0 })
    if (paraFromRef.current) populateWordSpans(paraFromRef.current, newTagline)
    if (paraToRef.current) gsap.set(paraToRef.current, { autoAlpha: 0 })

    prevTagsRef.current = newTags
    prevTitleRef.current = newTitle
    prevTaglineRef.current = newTagline
  }, [projects])

  /* ── Entrance animation ── */
  useEffect(() => {
    if (hasPlayedEntranceRef.current || projects.length === 0) return
    const section = sectionRef.current
    if (!section) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* Hide all cards initially, show only the first */
    cardRefs.current.forEach((card, i) => {
      if (!card) return
      if (i === 0) {
        gsap.set(card, { opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 40, scale: 1 })
      } else {
        gsap.set(card, { opacity: 0, scale: 1 })
      }
    })
    if (bottomPanelRef.current) gsap.set(bottomPanelRef.current, { opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 40 })

    if (prefersReduced) {
      hasPlayedEntranceRef.current = true
      populateInitialWordMorphs()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasPlayedEntranceRef.current) return
        hasPlayedEntranceRef.current = true
        observer.disconnect()

        const firstCard = cardRefs.current[0]
        const tl = gsap.timeline({
          onComplete: () => populateInitialWordMorphs(),
        })

        if (firstCard) {
          tl.to(firstCard, {
            opacity: 1,
            y: 0,
            duration: ANIM_DURATION,
            ease: 'power3.out',
          }, 0)
        }

        tl.to(bottomPanelRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }, 0.15)
      },
      { threshold: 0.3 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [projects, populateInitialWordMorphs])

  /* ── Animate card transitions on activeIndex change ── */
  useEffect(() => {
    if (!hasPlayedEntranceRef.current) return

    const total = projects.length
    const dir = directionRef.current

    cardRefs.current.forEach((card, i) => {
      if (!card) return

      if (i === activeIndex) {
        /* Incoming card: start off-screen in the direction of navigation, slide to center */
        gsap.set(card, { opacity: 0, x: dir * SLIDE_DISTANCE, scale: 0.95 })
        gsap.to(card, {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: ANIM_DURATION,
          ease: 'power3.out',
        })
      } else {
        /* All other cards: ensure hidden */
        gsap.to(card, {
          opacity: 0,
          duration: ANIM_DURATION * 0.4,
          ease: 'power2.in',
        })
      }
    })

    /* ── Word morph on tags, title, and tagline ── */
    const newTags = projects[activeIndex]?.tags?.map((t) => t.name).join(' / ') || ''
    const newTitle = projects[activeIndex]?.title || ''
    const newTagline = projects[activeIndex]?.tagline || ''

    if (prevTagsRef.current && newTags && prevTagsRef.current !== newTags && tagsFromRef.current && tagsToRef.current) {
      runWordMorph(tagsFromRef.current, tagsToRef.current, prevTagsRef.current, newTags)
    }
    if (prevTitleRef.current && newTitle && prevTitleRef.current !== newTitle && titleFromRef.current && titleToRef.current) {
      runWordMorph(titleFromRef.current, titleToRef.current, prevTitleRef.current, newTitle)
    }
    if (prevTaglineRef.current && newTagline && prevTaglineRef.current !== newTagline && paraFromRef.current && paraToRef.current) {
      runWordMorph(paraFromRef.current, paraToRef.current, prevTaglineRef.current, newTagline)
    }

    prevTagsRef.current = newTags
    prevTitleRef.current = newTitle
    prevTaglineRef.current = newTagline

    animatingRef.current = true
    const timeout = setTimeout(() => {
      animatingRef.current = false
    }, ANIM_DURATION * 1000)

    return () => clearTimeout(timeout)
  }, [activeIndex, projects])

  /* ── Navigate left / right ── */
  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (animatingRef.current) return
      directionRef.current = dir
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

  /* ── Touch swipe (simplified) ── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartXRef.current
    if (Math.abs(delta) > 50) {
      navigate(delta < 0 ? 1 : -1)
    }
  }, [navigate])

  /* ── Center card click → project transition ── */
  const handleCardClick = useCallback(
    (e: React.MouseEvent, project: Project) => {
      e.preventDefault()

      const card = cardRefs.current[activeIndex]
      if (!card) return

      const thumbnailUrl = getThumbnailUrl(project)
      if (!thumbnailUrl) return

      const rect = card.getBoundingClientRect()

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
    [activeIndex, startTransition],
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
      ref={sectionRef}
      data-theme="dark"
      className="sticky top-0 relative overflow-hidden"
      style={{ height: '100vh' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Cards — only active one visible ───────── */}
      <div className="absolute inset-x-0 top-[8%] md:top-[5%] flex items-start justify-center" style={{ height: '55%' }}>
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
                width: 'min(75vw, 500px)',
                aspectRatio: '3 / 4',
              }}
            >
              <Link
                href={`/projects/${project.slug.current}`}
                onClick={(e) => handleCardClick(e, project)}
                className="relative block h-full w-full overflow-hidden rounded-xl"
              >
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 75vw, 500px"
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
      </div>

      {/* ── Bottom: project info + navigation ─────────────── */}
      <div
        ref={bottomPanelRef}
        className="absolute inset-x-0 bottom-0 flex flex-col text-center px-6"
        style={{ height: '35%' }}
      >
        {/* Tags — word morph */}
        <div className="mb-2 relative">
          <div
            ref={tagsFromRef}
            className="font-ui text-sm uppercase tracking-widest text-text-muted"
          />
          <div
            ref={tagsToRef}
            className="absolute inset-0 font-ui text-sm uppercase tracking-widest text-text-muted"
          />
        </div>

        {/* Title — word morph */}
        <h3 className="relative">
          <div
            ref={titleFromRef}
            className="font-heading font-bold leading-tight text-text text-[length:var(--text-display)]"
          />
          <div
            ref={titleToRef}
            className="absolute inset-0 font-heading font-bold leading-tight text-text text-[length:var(--text-display)]"
          />
        </h3>

        {/* Paragraph — word morph between projects */}
        <div className="mt-3 flex-1 max-w-lg mx-auto relative">
          <div
            ref={paraFromRef}
            className="text-text-muted leading-relaxed text-[length:var(--text-body)]"
          />
          <div
            ref={paraToRef}
            className="absolute inset-0 text-text-muted leading-relaxed text-[length:var(--text-body)]"
          />
        </div>

        {/* Navigation arrows + counter */}
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

          <span className="font-ui text-sm tabular-nums text-text-muted">
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

        {/* See all projects link */}
        <Link
          href="/projects"
          className="mt-3 font-ui text-sm text-text-muted underline underline-offset-4 decoration-border transition-colors hover:text-text hover:decoration-accent"
        >
          See all projects
        </Link>

        {/* Bottom spacing */}
        <div className="pb-6" />
      </div>
    </section>
  )
}
