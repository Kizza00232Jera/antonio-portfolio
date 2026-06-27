'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ── Data ─────────────────────────────────────────────── */

interface JourneyStop {
  id: string
  number: string
  label: string
  title: string
  location: string
  period: string
  description: string
  skills: string[]
  image: string
  flag: string
  accent: string
}

const stops: JourneyStop[] = [
  {
    id: 'multimedia',
    number: '01',
    label: 'Bachelor programme',
    title: 'Multimedia Design',
    location: 'Aalborg, Denmark',
    period: '2020 – 2023',
    description:
      'Three years studying interaction design, front-end fundamentals, and user-centred thinking at Aalborg University. Built my first real understanding of how design and code work together — from UX research and prototyping, to building products with HTML, CSS and JavaScript.',
    skills: ['Prototyping', 'UX Research', 'Interactive Design', 'HTML', 'CSS', 'JavaScript'],
    image: '/images/multimedia_design.webp',
    flag: '/images/flags/denmark.svg',
    accent: '#fafaf8',
  },
  {
    id: 'mono',
    number: '02',
    label: 'UI/UX placement',
    title: 'Internship — Mono',
    location: 'Osijek, Croatia',
    period: '2022',
    description:
      'Designed a marketing website and internal dashboard for a gas company repositioning itself as a green, innovative brand — starting with research, sitemaps, and user flows before a single screen was drawn. Translated that foundation into a strong visual identity across both products.',
    skills: ['UX Research', 'Information Architecture', 'UI Design', 'Figma'],
    image: '/images/mono2.jpg',
    flag: '/images/flags/croatia.svg',
    accent: '#fafaf8',
  },
  {
    id: 'webdev',
    number: '03',
    label: 'Top-up degree',
    title: 'Web Development',
    location: 'Aalborg, Denmark',
    period: '2023 – 2024',
    description:
      'One-year top-up degree deepening the technical side: JavaScript, TypeScript, React, Next.js, databases, and APIs. Bridging design thinking and engineering craft.',
    skills: ['React', 'TypeScript', 'Next.js'],
    image: '/images/web_development.webp',
    flag: '/images/flags/denmark.svg',
    accent: '#fafaf8',
  },
  {
    id: 'decode',
    number: '04',
    label: 'Developer placement',
    title: 'Internship — Decode',
    location: 'Zagreb, Croatia',
    period: '2024',
    description:
      'Designed an internal educational platform for Decode employees — building the full design system from scratch, including colour palette, typography, and components across iOS, Android, and desktop. Delivered every component with written documentation in Storybook.',
    skills: ['Design Systems', 'Storybook', 'UI Design', 'iOS', 'Android'],
    image: '/images/decode.webp',
    flag: '/images/flags/croatia.svg',
    accent: '#fafaf8',
  },
  {
    id: 'stockholm',
    number: '05',
    label: 'Master programme',
    title: 'Creative & Immersive Tech',
    location: 'Stockholm, Sweden',
    period: '2024 – 2026',
    description:
      "Master's degree at Stockholm University exploring the intersection of design, emerging technology, and immersive experiences. Pushing into XR, creative coding, and human-centred innovation.",
    skills: ['Unity', 'IoT', 'VR & MR', 'Immersive Technology'],
    image: '/images/stockholm_university.webp',
    flag: '/images/flags/sweden.svg',
    accent: '#fafaf8',
  },
]

const N = stops.length

/* ── Timeline ruler data ─────────────────────────────── */

const START_YEAR = 2020
const END_YEAR = 2026
const YEAR_SPAN = END_YEAR - START_YEAR
const RULER_PAD = 10 // % padding top/bottom
const RULER_RANGE = 80 // % usable range (100 - 2*PAD)

const years = Array.from({ length: YEAR_SPAN + 1 }, (_, i) => START_YEAR + i)

// Position a year on the ruler as a percentage
const yearPos = (year: number) =>
  RULER_PAD + ((year - START_YEAR) / YEAR_SPAN) * RULER_RANGE

// Generate tick marks: 4 ticks between each year pair
const ticks: number[] = []
for (let y = START_YEAR; y < END_YEAR; y++) {
  for (let t = 1; t <= 3; t++) {
    ticks.push(yearPos(y + t / 4))
  }
}

// Dot travels from START_YEAR to END_YEAR across the full scroll
const DOT_START = yearPos(START_YEAR)
const DOT_END = yearPos(END_YEAR)

/* ── Component ────────────────────────────────────────── */

export default function JourneyScrollSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const rulerRef = useRef<HTMLDivElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    )
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const section = sectionRef.current
    const ruler = rulerRef.current
    if (!section || !ruler) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      /* ── Desktop ─────────────────────────────────── */
      mm.add('(min-width: 769px)', () => {
        const scrollDistance = N * window.innerHeight
        // Extra pinned viewport after the last stop: the section stays frozen
        // while the next section slides up over it (curtain effect)
        const pinDistance = scrollDistance + window.innerHeight

        // Images are in reverse DOM order (stop5 first, stop1 last = on top)
        // Reverse so imgs[0] = stop1 (top of stack), imgs[4] = stop5 (bottom)
        const rawImgs = gsap.utils.toArray<HTMLElement>(
          '.j-arch .j-img-wrap img',
        )
        const imgs = [...rawImgs].reverse()

        // Text blocks in DOM order (stop1 first)
        const textBlocks = gsap.utils.toArray<HTMLElement>('.j-arch-info')

        // Initial state
        gsap.set(imgs, { clipPath: 'inset(0)', objectPosition: '0px 0%' })
        gsap.set(textBlocks, { opacity: 0 })
        gsap.set(textBlocks[0], { opacity: 1 })

        // Pin the entire section — this creates the freeze effect
        const mainTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: `+=${pinDistance}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
          },
        })

        const bgColors = stops.slice(1).map((s) => s.accent)

        imgs.forEach((currentImage, index) => {
          const nextImage = imgs[index + 1] ?? null
          const currentText = textBlocks[index] ?? null
          const nextText = textBlocks[index + 1] ?? null

          const tl = gsap.timeline()

          if (nextImage) {
            // Fade out current text, fade in next
            tl.to(currentText, { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 0)
              .to(nextText, { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 0.5)
              // Background color shift
              .to(section, { backgroundColor: bgColors[index], duration: 1.5, ease: 'power2.inOut' }, 0)
              // Image clip reveal
              .to(currentImage, { clipPath: 'inset(0px 0px 100%)', objectPosition: '0px 60%', duration: 1.5, ease: 'none' }, 0)
              .to(nextImage, { objectPosition: '0px 40%', duration: 1.5, ease: 'none' }, 0)
          }

          mainTl.add(tl)
        })

        // Dead window at the end: stop transitions finish within the first
        // N viewports of scroll, leaving the final viewport frozen
        mainTl.to({}, { duration: mainTl.duration() / N })

        // Pin the ruler (no extra scroll space — section already pins)
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: `+=${pinDistance}`,
          pin: ruler,
          pinSpacing: false,
        })

        // Animate progress dot from 2020 to 2026
        const dotStart = DOT_START
        const dotEnd = DOT_END
        const dot = ruler.querySelector<HTMLElement>('.j-ruler-dot')
        const yearEls = ruler.querySelectorAll<HTMLElement>('.j-ruler-year')

        if (dot) {
          gsap.set(dot, { top: `${dotStart}%` })

          gsap.to(dot, {
            top: `${dotEnd}%`,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: `+=${scrollDistance}`,
              scrub: true,
              onUpdate: (self) => {
                const currentPos = dotStart + (dotEnd - dotStart) * self.progress
                yearEls.forEach((el) => {
                  const y = parseInt(el.dataset.year ?? '0', 10)
                  const pos = yearPos(y)
                  const isActive = Math.abs(currentPos - pos) < (RULER_RANGE / YEAR_SPAN) * 0.6
                  el.classList.toggle('is-active', isActive)
                })
              },
            },
          })
        }
      })

      /* ── Mobile ──────────────────────────────────── */
      mm.add('(max-width: 768px)', () => {
        // Order text blocks correctly (images hidden via CSS)
        const textBlocks = gsap.utils.toArray<HTMLElement>('.j-arch .j-arch-info')
        textBlocks.forEach((el, i) => {
          el.style.order = String(i)
        })

        // Initial state: cards hidden, shifted down
        gsap.set(textBlocks, { opacity: 0, y: 40 })

        // Staggered reveal as each card enters viewport
        textBlocks.forEach((card, i) => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          })

          // Background color transition per card
          if (i < N - 1) {
            ScrollTrigger.create({
              trigger: card,
              start: 'bottom 60%',
              onEnter: () => {
                gsap.to(section, {
                  backgroundColor: stops[i + 1].accent,
                  duration: 0.5,
                  ease: 'power2.inOut',
                  overwrite: true,
                })
              },
              onLeaveBack: () => {
                gsap.to(section, {
                  backgroundColor: stops[i].accent,
                  duration: 0.5,
                  ease: 'power2.inOut',
                  overwrite: true,
                })
              },
            })
          }
        })

        // Cleanup
        return () => {
          textBlocks.forEach((el) => {
            el.style.order = ''
          })
        }
      })
    }, section)

    return () => ctx.revert()
  }, [reducedMotion])

  /* ── Reduced motion: static layout ───────────────── */

  if (reducedMotion) {
    return (
      <section
        data-theme="light"
        className="py-[var(--section-gap)]"
        style={{ backgroundColor: '#fafaf8' }}
      >
        <div className="mx-auto max-w-[var(--max-width)] px-6">
          <div className="flex flex-col gap-16">
            {stops.map((stop) => (
              <div key={stop.id} className="flex flex-col gap-4">
                <p className="j-label">{stop.number} &mdash; {stop.label}</p>
                <h3 className="j-title">{stop.title}</h3>
                <p className="j-desc">{stop.description}</p>
                <div className="j-meta">
                  <Image
                    src={stop.flag}
                    alt={`${stop.location.split(', ').pop()} flag`}
                    width={32}
                    height={20}
                    className="j-flag-sm"
                  />
                  <span className="j-location">{stop.location}</span>
                  <span className="j-period">{stop.period}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  /* ── Main render ────────────────────────────────────── */

  return (
    <section
      ref={sectionRef}
      data-theme="light"
      className="j-section"
      style={{ backgroundColor: stops[0].accent }}
    >
      {/* ── Timeline ruler (pinned, desktop only) ── */}
      <div ref={rulerRef} className="j-ruler">
        <div className="j-ruler-line" />
        <div className="j-ruler-dot" />
        {ticks.map((pos, i) => (
          <div
            key={`tick-${i}`}
            className="j-ruler-tick"
            style={{ top: `${pos}%` }}
          />
        ))}
        {years.map((year) => (
          <span
            key={year}
            className="j-ruler-year"
            data-year={year}
            style={{ top: `${yearPos(year)}%` }}
          >
            {year}
          </span>
        ))}
      </div>

      <div className="j-arch">
        {/* ── LEFT: text blocks, each 100vh, scroll naturally ── */}
        <div className="j-arch-left">
          {stops.map((stop) => (
            <div key={stop.id} className="j-arch-info">
              <span className="j-step-badge">{stop.number}</span>
              <div className="j-content">
                <div className="j-card-img-mobile">
                  <Image
                    src={stop.image}
                    alt={`${stop.title}, ${stop.location}`}
                    fill
                    quality={90}
                    className="object-cover"
                    sizes="90vw"
                  />
                </div>
                <p className="j-label">
                  {stop.number} &mdash; {stop.label}
                </p>
                <h2 className="j-title">{stop.title}</h2>
                <p className="j-desc">{stop.description}</p>
                <div className="j-meta">
                  <Image
                    src={stop.flag}
                    alt={`${stop.location.split(', ').pop()} flag`}
                    width={32}
                    height={20}
                    className="j-flag-sm"
                  />
                  <span className="j-location">{stop.location}</span>
                  <span className="j-period">{stop.period}</span>
                </div>
                <ul className="j-skills">
                  {stop.skills.map((skill) => (
                    <li key={skill} className="j-skill">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* ── RIGHT: pinned image stack ── */}
        {/* Reverse DOM order: stop5 first (bottom), stop1 last (top) */}
        {/* Later DOM elements paint on top — no z-index needed */}
        <div ref={rightRef} className="j-arch-right">
          {[...stops].reverse().map((stop) => (
            <div key={`img-${stop.id}`} className="j-img-wrap">
              <Image
                src={stop.image}
                alt={`${stop.title}, ${stop.location}`}
                fill
                quality={90}
                className="j-img object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
