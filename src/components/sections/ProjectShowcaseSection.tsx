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

const ANIM_DURATION = 0.7

const ARC_MOBILE = { radius: 2000, angleStep: 18, maxVisible: 2, scaleStep: 0.12 }
const ARC_DESKTOP = { radius: 2000, angleStep: 28, maxVisible: 1, scaleStep: 0.12 }

interface ArcConfig {
  radius: number
  angleStep: number
  maxVisible: number
  scaleStep: number
}

function getSlotProps(offset: number, arc: ArcConfig) {
  const angleDeg = offset * arc.angleStep
  const angleRad = angleDeg * (Math.PI / 180)
  const absOffset = Math.abs(offset)

  return {
    x: arc.radius * Math.sin(angleRad),
    y: arc.radius * (1 - Math.cos(angleRad)),
    rotation: angleDeg,
    scale: Math.max(0.5, 1 - absOffset * arc.scaleStep),
    opacity: absOffset <= arc.maxVisible ? 1 : 0,
  }
}

/* ── Intro text letters ──────────────────────────────────── */

const INTRO_LETTERS = "Things I've built.".split('')

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
  const [isDesktop, setIsDesktop] = useState(true)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const animatingRef = useRef(false)
  const initialRenderRef = useRef(true)
  const draggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragOffsetRef = useRef(0)
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
  const introLettersRef = useRef<(HTMLSpanElement | null)[]>([])
  const bottomPanelRef = useRef<HTMLDivElement>(null)
  const hasPlayedEntranceRef = useRef(false)

  const arc = isDesktop ? ARC_DESKTOP : ARC_MOBILE

  /* ── Track screen size ── */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

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
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const currentArc = isMobile ? ARC_MOBILE : ARC_DESKTOP

    /* Set initial hidden state */
    const hiddenProps = getSlotProps(-5, currentArc)
    cardRefs.current.forEach((card) => {
      if (!card) return
      gsap.set(card, {
        x: hiddenProps.x,
        y: hiddenProps.y,
        rotation: hiddenProps.rotation,
        scale: hiddenProps.scale,
        opacity: 0,
      })
    })
    if (bottomPanelRef.current) gsap.set(bottomPanelRef.current, { opacity: 0, y: 40 })
    const letters = introLettersRef.current.filter(Boolean) as HTMLSpanElement[]
    gsap.set(letters, { opacity: 0, y: 20 })

    if (prefersReduced) {
      const total = projects.length
      cardRefs.current.forEach((card, i) => {
        if (!card) return
        let offset = i
        if (offset > total / 2) offset -= total
        if (offset < -total / 2) offset += total
        const props = getSlotProps(offset, currentArc)
        gsap.set(card, { x: props.x, y: props.y, rotation: props.rotation, scale: props.scale, opacity: props.opacity })
        card.style.pointerEvents = offset === 0 ? 'auto' : 'none'
      })
      if (bottomPanelRef.current) gsap.set(bottomPanelRef.current, { opacity: 1, y: 0 })
      hasPlayedEntranceRef.current = true
      populateInitialWordMorphs()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasPlayedEntranceRef.current) return
        hasPlayedEntranceRef.current = true
        observer.disconnect()
        animatingRef.current = true

        const total = projects.length
        const tl = gsap.timeline({
          onComplete: () => {
            animatingRef.current = false
            populateInitialWordMorphs()
          },
        })

        /* 1. Letter-by-letter reveal */
        tl.to(letters, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.03,
          ease: 'power2.out',
        })

        /* 2. Pause, then fade out */
        tl.to(letters, {
          opacity: 0,
          y: -30,
          duration: 0.4,
          ease: 'power2.inOut',
        }, '+=0.3')

        /* Cards start while text is fading */
        tl.addLabel('cards', '-=0.2')

        /* 3. Cards fan in from left — sorted left-to-right for stagger */
        const cardData: { card: HTMLDivElement; offset: number }[] = []
        cardRefs.current.forEach((card, i) => {
          if (!card) return
          let offset = i
          if (offset > total / 2) offset -= total
          if (offset < -total / 2) offset += total
          cardData.push({ card, offset })
        })
        cardData.sort((a, b) => a.offset - b.offset)

        cardData.forEach(({ card, offset }, sortIndex) => {
          const props = getSlotProps(offset, currentArc)
          const isCenter = offset === 0
          tl.to(card, {
            x: props.x,
            y: props.y,
            rotation: props.rotation,
            scale: props.scale,
            opacity: props.opacity,
            duration: ANIM_DURATION,
            ease: 'power3.inOut',
            onComplete: () => {
              card.style.pointerEvents = isCenter ? 'auto' : 'none'
            },
          }, `cards+=${sortIndex * 0.08}`)
        })

        /* 4. Bottom panel slides up */
        tl.to(bottomPanelRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }, '-=0.3')
      },
      { threshold: 0.3 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [projects, populateInitialWordMorphs])

  /* ── Position all cards based on activeIndex ── */
  useEffect(() => {
    /* Skip until entrance has played */
    if (!hasPlayedEntranceRef.current) {
      initialRenderRef.current = false
      return
    }

    const animate = !initialRenderRef.current
    initialRenderRef.current = false

    const total = projects.length

    cardRefs.current.forEach((card, i) => {
      if (!card) return
      let offset = i - activeIndex
      if (offset > total / 2) offset -= total
      if (offset < -total / 2) offset += total
      const props = getSlotProps(offset, arc)
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

    /* ── Word morph on tags, title, and tagline ── */
    const newTags = projects[activeIndex]?.tags?.map((t) => t.name).join(' / ') || ''
    const newTitle = projects[activeIndex]?.title || ''
    const newTagline = projects[activeIndex]?.tagline || ''

    if (animate) {
      if (prevTagsRef.current && newTags && prevTagsRef.current !== newTags && tagsFromRef.current && tagsToRef.current) {
        runWordMorph(tagsFromRef.current, tagsToRef.current, prevTagsRef.current, newTags)
      }
      if (prevTitleRef.current && newTitle && prevTitleRef.current !== newTitle && titleFromRef.current && titleToRef.current) {
        runWordMorph(titleFromRef.current, titleToRef.current, prevTitleRef.current, newTitle)
      }
      if (prevTaglineRef.current && newTagline && prevTaglineRef.current !== newTagline && paraFromRef.current && paraToRef.current) {
        runWordMorph(paraFromRef.current, paraToRef.current, prevTaglineRef.current, newTagline)
      }
    } else {
      if (tagsFromRef.current) populateWordSpans(tagsFromRef.current, newTags)
      if (tagsToRef.current) gsap.set(tagsToRef.current, { autoAlpha: 0 })
      if (titleFromRef.current) populateWordSpans(titleFromRef.current, newTitle)
      if (titleToRef.current) gsap.set(titleToRef.current, { autoAlpha: 0 })
      if (paraFromRef.current) populateWordSpans(paraFromRef.current, newTagline)
      if (paraToRef.current) gsap.set(paraToRef.current, { autoAlpha: 0 })
    }
    prevTagsRef.current = newTags
    prevTitleRef.current = newTitle
    prevTaglineRef.current = newTagline

    if (animate) {
      animatingRef.current = true
      setTimeout(() => {
        animatingRef.current = false
      }, ANIM_DURATION * 1000)
    }
  }, [activeIndex, projects, arc])

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

  /* ── Drag-to-snap (mobile touch) ── */
  const oneCardPx = arc.radius * Math.sin(arc.angleStep * (Math.PI / 180))

  const positionCards = useCallback(
    (fractionalIndex: number) => {
      const total = projects.length
      cardRefs.current.forEach((card, i) => {
        if (!card) return
        let offset = i - fractionalIndex
        if (offset > total / 2) offset -= total
        if (offset < -total / 2) offset += total
        const props = getSlotProps(offset, arc)
        gsap.set(card, {
          x: props.x,
          y: props.y,
          rotation: props.rotation,
          scale: props.scale,
          opacity: props.opacity,
        })
      })
    },
    [projects.length, arc],
  )

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (animatingRef.current) return
      draggingRef.current = true
      dragStartXRef.current = e.touches[0].clientX
      dragOffsetRef.current = 0
    },
    [],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!draggingRef.current) return
      const delta = e.touches[0].clientX - dragStartXRef.current
      dragOffsetRef.current = -delta / oneCardPx
      positionCards(activeIndex + dragOffsetRef.current)
    },
    [activeIndex, oneCardPx, positionCards],
  )

  const onTouchEnd = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false

    const offset = dragOffsetRef.current
    let snapped = 0
    if (offset > 0.3) snapped = 1
    else if (offset < -0.3) snapped = -1

    const total = projects.length
    let newIndex = activeIndex + snapped
    if (newIndex < 0) newIndex = total - 1
    if (newIndex >= total) newIndex = 0

    if (newIndex === activeIndex) {
      /* Snap back with animation */
      cardRefs.current.forEach((card, i) => {
        if (!card) return
        let off = i - activeIndex
        if (off > total / 2) off -= total
        if (off < -total / 2) off += total
        const props = getSlotProps(off, arc)
        gsap.to(card, {
          x: props.x,
          y: props.y,
          rotation: props.rotation,
          scale: props.scale,
          opacity: props.opacity,
          duration: 0.4,
          ease: 'power3.out',
        })
      })
    } else {
      setActiveIndex(newIndex)
    }

    dragOffsetRef.current = 0
  }, [activeIndex, projects.length, positionCards, arc])

  /* ── Center card click → project transition ── */
  const handleCardClick = useCallback(
    (e: React.MouseEvent, project: Project, index: number) => {
      if (index !== activeIndex) return
      e.preventDefault()

      const card = cardRefs.current[index]
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
      data-theme="light"
      className="sticky top-0 relative overflow-hidden"
      style={{ height: '100vh' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Intro text — "Things I've built." ── */}
      <h2
        className="absolute inset-0 flex items-center justify-center text-center font-heading font-bold leading-[1.1] text-text pointer-events-none"
        style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)' }}
      >
        {INTRO_LETTERS.map((char, i) => (
          <span
            key={i}
            ref={(el) => { introLettersRef.current[i] = el }}
            className="inline-block will-change-transform"
            style={char === ' ' ? { width: '0.3em' } : undefined}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h2>

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
              width: isDesktop ? 600 : 300,
              height: isDesktop ? 800 : 400,
              left: '50%',
              top: isDesktop ? '35%' : '28%',
              marginLeft: isDesktop ? -300 : -150,
              marginTop: isDesktop ? -400 : -200,
            }}
          >
            <Link
              href={`/projects/${project.slug.current}`}
              onClick={(e) => handleCardClick(e, project, i)}
              className="relative block h-full w-full overflow-hidden rounded-xl"
            >
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={project.title}
                  fill
                  sizes="620px"
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

      {/* ── Bottom: project info + navigation ─────────────── */}
      <div
        ref={bottomPanelRef}
        className="absolute inset-x-0 bottom-0 flex flex-col text-center px-6"
        style={{ height: isDesktop ? '30%' : '40%' }}
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

          <Link
            href="/projects"
            className="font-ui text-sm text-text-muted underline underline-offset-4 decoration-border transition-colors hover:text-text hover:decoration-accent"
          >
            See all projects
          </Link>

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

        {/* Bottom spacing */}
        <div className="pb-6" />
      </div>
    </section>
  )
}
