'use client'

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { cn } from '@/utils/cn'

/* ── Data ─────────────────────────────────────────────────── */

interface PanelItem {
  id: string
  number: string
  title: string
  label: string
  location: string
  period: string
  description: string
  skills: string[]
}

interface PanelTheme {
  bg: string
  textColor: 'light' | 'dark'
  numberColor: string
  locationColor: string
  flag: string
}

const items: PanelItem[] = [
  {
    id: 'multimedia',
    number: '1',
    title: 'Multimedia Design',
    label: 'Bachelor programme',
    location: 'Aalborg, Denmark',
    period: '2020 – 2023',
    description:
      'Moved from Croatia to Aalborg to study Medialogy — a bachelor programme at the intersection of design, code, and human experience. Learned to prototype, test, and iterate on digital products. Built everything from interactive installations to web applications.',
    skills: ['Prototyping', 'UX Research', 'Interactive Design'],
  },
  {
    id: 'mono',
    number: '2',
    title: 'Internship — Mono',
    label: 'UI/UX placement',
    location: 'Osijek, Croatia',
    period: '2022',
    description:
      'Three-month placement as a UI/UX Designer at Mono. Worked on client-facing design projects — wireframing, prototyping in Figma, and collaborating with developers to bring interfaces to life.',
    skills: ['Figma', 'Wireframing', 'UI Design'],
  },
  {
    id: 'webdev',
    number: '3',
    title: 'Web Development Top-up',
    label: 'Top-up degree',
    location: 'Aalborg, Denmark',
    period: '2023 – 2024',
    description:
      'One-year top-up degree deepening the technical side: JavaScript, TypeScript, React, Next.js, databases, and APIs. Bridging the gap between design thinking and engineering craft.',
    skills: ['React', 'TypeScript', 'Next.js'],
  },
  {
    id: 'decode',
    number: '4',
    title: 'Internship — Decode',
    label: 'Developer placement',
    location: 'Zagreb, Croatia',
    period: '2024',
    description:
      'Three-month placement as a Web Developer at Decode. Shipped production features, worked in a team codebase, and built the habit of writing code that others can read and maintain.',
    skills: ['Production Code', 'Team Workflow', 'Code Review'],
  },
  {
    id: 'stockholm',
    number: '5',
    title: 'Design for Creative & Immersive Technology',
    label: 'Master programme',
    location: 'Stockholm, Sweden',
    period: '2024 – 2026',
    description:
      'Master\'s degree at Stockholm University exploring the intersection of design, emerging technology, and immersive experiences. Pushing into XR, creative coding, and human-centred innovation.',
    skills: ['XR Design', 'Creative Coding', 'Immersive Tech'],
  },
]

const themes: PanelTheme[] = [
  { bg: '#F5EDE0', textColor: 'dark', numberColor: '#5D3136', locationColor: 'text-[#F97316]', flag: '/images/flags/denmark.svg' },
  { bg: '#020617', textColor: 'light', numberColor: 'rgba(255,255,255,0.35)', locationColor: 'text-[#F97316]', flag: '/images/flags/croatia.svg' },
  { bg: '#FFFFFF', textColor: 'dark', numberColor: '#5D3136', locationColor: 'text-[#F97316]', flag: '/images/flags/denmark.svg' },
  { bg: '#F97316', textColor: 'dark', numberColor: 'rgba(0,0,0,0.2)', locationColor: 'text-white', flag: '/images/flags/croatia.svg' },
  { bg: '#172554', textColor: 'light', numberColor: 'rgba(255,255,255,0.25)', locationColor: 'text-[#F97316]', flag: '/images/flags/sweden.svg' },
]

function textClasses(theme: PanelTheme) {
  const light = theme.textColor === 'light'
  return {
    title: light ? 'text-white' : 'text-[#020617]',
    body: light ? 'text-white/70' : 'text-[#020617]/70',
    label: light ? 'text-white/50' : 'text-[#020617]/50',
    location: theme.locationColor,
  }
}

/* ── Layout ───────────────────────────────────────────────── */

const N = items.length
const EXPANDED_FRAC = 0.5
const STRIP_FRAC = (1 - EXPANDED_FRAC) / (N - 1)
const RADIUS = '1rem'

/*
  How it works:
  - Every card is position:absolute, left:0, with an animated width.
  - Card 1 has the HIGHEST z-index (sits on top), Card 5 the lowest.
  - Each card covers from x=0 to x=width. Later cards (lower z) are wider,
    so they peek out to the right behind earlier cards.
  - Border-radius on the RIGHT side of cards 1-3 creates the curved overlap,
    revealing the card behind.
  - Inside each card, a "viewport" div is pinned to the right edge and sized
    to match the visible strip (or expanded area). Content lives inside it.
*/

/** Card width (from left=0) for each panel given the active index. */
function calcWidth(i: number, activeIndex: number, cw: number): number {
  const strip = cw * STRIP_FRAC
  const expanded = cw * EXPANDED_FRAC
  if (i < activeIndex) return (i + 1) * strip
  if (i === activeIndex) return activeIndex * strip + expanded
  return activeIndex * strip + expanded + (i - activeIndex) * strip
}

/* ── Component ────────────────────────────────────────────── */

export default function JourneyAccordionSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<(HTMLButtonElement | null)[]>([])
  const viewportRefs = useRef<(HTMLDivElement | null)[]>([])
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeId, setActiveId] = useState('multimedia')
  const isFirstRender = useRef(true)

  /* ── Click: active → advance to next ── */

  const handlePanelClick = useCallback(
    (id: string) => {
      if (id === activeId) {
        const idx = items.findIndex((item) => item.id === id)
        setActiveId(items[(idx + 1) % N].id)
      } else {
        setActiveId(id)
      }
    },
    [activeId]
  )

  /* ── Position panels ── */

  const updatePositions = useCallback(
    (animate: boolean) => {
      const container = containerRef.current
      if (!container) return

      const cw = container.offsetWidth
      const strip = cw * STRIP_FRAC
      const expanded = cw * EXPANDED_FRAC
      const activeIndex = items.findIndex((item) => item.id === activeId)
      const dur = 0.7
      const ease = 'power3.inOut'

      panelRefs.current.forEach((panel, i) => {
        if (!panel) return
        const isActive = i === activeIndex
        const targetWidth = calcWidth(i, activeIndex, cw)
        const vpWidth = isActive ? expanded : strip

        if (animate) {
          gsap.to(panel, {
            width: targetWidth,
            duration: dur,
            ease,
            overwrite: true,
          })
        } else {
          gsap.set(panel, { width: targetWidth })
        }

        const viewport = viewportRefs.current[i]
        if (viewport) {
          if (animate) {
            gsap.to(viewport, {
              width: vpWidth,
              duration: dur,
              ease,
              overwrite: true,
            })
          } else {
            gsap.set(viewport, { width: vpWidth })
          }
        }

        const content = contentRefs.current[i]
        if (content) {
          if (animate) {
            if (isActive) {
              gsap.to(content, {
                opacity: 1,
                x: 0,
                duration: 0.5,
                ease: 'power2.out',
                delay: 0.6,
                overwrite: true,
              })
            } else {
              gsap.to(content, {
                opacity: 0,
                x: -15,
                duration: 0.2,
                ease: 'power2.in',
                overwrite: true,
              })
            }
          } else {
            gsap.set(content, { opacity: isActive ? 1 : 0, x: 0 })
          }
        }

      })
    },
    [activeId]
  )

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    const shouldAnimate = !isFirstRender.current && !prefersReduced
    isFirstRender.current = false
    updatePositions(shouldAnimate)
  }, [updatePositions])

  /* ── Resize ── */

  useEffect(() => {
    const onResize = () => updatePositions(false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [updatePositions])

  /* ── Keyboard ── */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = items.findIndex((item) => item.id === activeId)
      let next = idx

      if (e.key === 'ArrowRight') next = (idx + 1) % N
      else if (e.key === 'ArrowLeft') next = (idx - 1 + N) % N
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = N - 1
      else return

      e.preventDefault()
      setActiveId(items[next].id)
      panelRefs.current[next]?.focus()
    },
    [activeId]
  )

  /* ── Render ── */

  return (
    <section data-theme="light" className="sticky top-0 min-h-screen pb-[var(--section-gap)]">
      <div
        ref={containerRef}
        className="relative w-full h-screen min-h-[500px] overflow-hidden"
        role="tablist"
        aria-label="Journey timeline"
        onKeyDown={handleKeyDown}
      >
        {items.map((item, i) => {
          const theme = themes[i]
          const colors = textClasses(theme)
          const isActive = item.id === activeId
          const isLast = i === N - 1

          return (
            <button
              key={item.id}
              ref={(el) => {
                panelRefs.current[i] = el
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-content-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handlePanelClick(item.id)}
              className="absolute top-0 bottom-0 left-0 overflow-hidden text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
              style={{
                zIndex: N - i,
                backgroundColor: theme.bg,
                borderTopRightRadius: isLast ? 0 : RADIUS,
                borderBottomRightRadius: isLast ? 0 : RADIUS,
              }}
            >
              {/*
                Viewport div — pinned to the card's right edge.
                Width = STRIP when collapsed, EXPANDED when active.
                This always represents the VISIBLE portion of the card.
              */}
              <div
                ref={(el) => {
                  viewportRefs.current[i] = el
                }}
                id={`panel-content-${item.id}`}
                role="tabpanel"
                aria-labelledby={`panel-title-${item.id}`}
                className="absolute right-0 top-0 bottom-0 overflow-hidden p-4 md:p-8 lg:p-10"
              >
                {/* All text content — fades in/out together */}
                <div
                  ref={(el) => {
                    contentRefs.current[i] = el
                  }}
                  className="flex h-full flex-col justify-between md:min-w-[320px] lg:min-w-[400px]"
                  style={{ opacity: 0 }}
                >
                  {/* Top: label, title, description, location */}
                  <div>
                    <p
                      className={cn(
                        'mb-1 font-ui text-[0.625rem] uppercase tracking-widest sm:mb-2 sm:text-xs',
                        colors.label
                      )}
                    >
                      {item.label}
                    </p>
                    <h3
                      id={`panel-title-${item.id}`}
                      className={cn(
                        'mb-3 font-heading text-base font-bold leading-tight sm:text-xl md:mb-6 md:text-3xl lg:text-4xl',
                        colors.title
                      )}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={cn(
                        'mb-3 max-w-[45ch] font-body text-xs leading-relaxed sm:text-sm md:mb-6 md:text-base',
                        colors.body
                      )}
                    >
                      {item.description}
                    </p>
                    <div className="flex flex-col gap-1">
                      <p
                        className={cn(
                          'flex items-center gap-2 font-ui text-xs uppercase tracking-widest',
                          colors.location
                        )}
                      >
                        {item.location}
                        <Image
                          src={theme.flag}
                          alt=""
                          width={32}
                          height={20}
                          className="h-3 w-auto rounded-[2px] object-cover md:h-4"
                        />
                      </p>
                      <p className={cn('font-ui text-xs', colors.label)}>
                        {item.period}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: numbered skills list — fades in/out with content */}
                  <ul className="mb-15 flex flex-col gap-2 md:mb-0 md:gap-3">
                    {item.skills.map((skill, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2 md:gap-3"
                      >
                        <span
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-ui md:h-6 md:w-6 md:text-xs',
                            theme.textColor === 'light'
                              ? 'bg-white/20 text-white'
                              : 'bg-black/10 text-[#020617]'
                          )}
                        >
                          {j + 1}
                        </span>
                        <span
                          className={cn(
                            'font-body text-xs md:text-sm',
                            colors.body
                          )}
                        >
                          {skill}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Bottom-right number */}
              <span
                className="absolute bottom-3 right-3 block font-heading font-bold leading-none select-none md:bottom-8 md:right-8 lg:bottom-10 lg:right-10"
                aria-hidden="true"
                style={{
                  fontSize: 'clamp(2.5rem, 10vw, 8rem)',
                  color: theme.numberColor,
                }}
              >
                {item.number}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
