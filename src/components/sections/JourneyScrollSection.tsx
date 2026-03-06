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
      'Moved from Croatia to Aalborg to study Medialogy — a bachelor programme at the intersection of design, code, and human experience. Learned to prototype, test, and iterate on digital products.',
    skills: ['Prototyping', 'UX Research', 'Interactive Design'],
    flag: '/images/flags/denmark.svg',
    accent: '#F5EDE0',
  },
  {
    id: 'mono',
    number: '02',
    label: 'UI/UX placement',
    title: 'Internship — Mono',
    location: 'Osijek, Croatia',
    period: '2022',
    description:
      'Three-month placement as a UI/UX Designer at Mono. Worked on client-facing design projects — wireframing, prototyping in Figma, and collaborating with developers.',
    skills: ['Figma', 'Wireframing', 'UI Design'],
    flag: '/images/flags/croatia.svg',
    accent: '#E8EDF5',
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
    flag: '/images/flags/denmark.svg',
    accent: '#EDF5E8',
  },
  {
    id: 'decode',
    number: '04',
    label: 'Developer placement',
    title: 'Internship — Decode',
    location: 'Zagreb, Croatia',
    period: '2024',
    description:
      'Three-month placement as a Web Developer at Decode. Shipped production features, worked in a team codebase, and built the habit of writing code others can maintain.',
    skills: ['Production Code', 'Team Workflow', 'Code Review'],
    flag: '/images/flags/croatia.svg',
    accent: '#F0E8F5',
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
    skills: ['XR Design', 'Creative Coding', 'Immersive Tech'],
    flag: '/images/flags/sweden.svg',
    accent: '#E8F0F5',
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
    const right = rightRef.current
    const ruler = rulerRef.current
    if (!section || !right || !ruler) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      /* ── Desktop ─────────────────────────────────── */
      mm.add('(min-width: 769px)', () => {
        // Images are in reverse DOM order (stop5 first, stop1 last = on top)
        // Reverse the array so imgs[0] = stop1 (top), imgs[4] = stop5 (bottom)
        const rawImgs = gsap.utils.toArray<HTMLElement>(
          '.j-arch .j-img-wrap img',
        )
        const imgs = [...rawImgs].reverse()

        gsap.set(imgs, {
          clipPath: 'inset(0)',
          objectPosition: '0px 0%',
        })

        const mainTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.j-arch',
            start: 'top top',
            end: 'bottom bottom',
            pin: right,
            scrub: true,
          },
        })

        // Transition bg colors (after each clip reveal)
        const bgColors = stops.slice(1).map((s) => s.accent)

        imgs.forEach((currentImage, index) => {
          const nextImage = imgs[index + 1] ?? null

          const tl = gsap.timeline()

          if (nextImage) {
            tl.to(
              section,
              {
                backgroundColor: bgColors[index],
                duration: 1.5,
                ease: 'power2.inOut',
              },
              0,
            )
              .to(
                currentImage,
                {
                  clipPath: 'inset(0px 0px 100%)',
                  objectPosition: '0px 60%',
                  duration: 1.5,
                  ease: 'none',
                },
                0,
              )
              .to(
                nextImage,
                {
                  objectPosition: '0px 40%',
                  duration: 1.5,
                  ease: 'none',
                },
                0,
              )
          }

          mainTl.add(tl)
        })

        // Pin the ruler alongside the images
        ScrollTrigger.create({
          trigger: '.j-arch',
          start: 'top top',
          end: 'bottom bottom',
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
              trigger: '.j-arch',
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
              onUpdate: (self) => {
                // Calculate which year the dot is closest to
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
        // Set interleave order
        const textBlocks = gsap.utils.toArray<HTMLElement>(
          '.j-arch .j-arch-info',
        )
        const imgWraps = gsap.utils.toArray<HTMLElement>(
          '.j-arch .j-img-wrap',
        )

        // Text blocks are in normal order (stop1 first)
        textBlocks.forEach((el, i) => {
          el.style.order = String(i * 2)
        })

        // Image wrappers are in reverse DOM order (stop5 first, stop1 last)
        // Map each to the correct visual position
        imgWraps.forEach((el, i) => {
          const stopIndex = N - 1 - i
          el.style.order = String(stopIndex * 2 + 1)
        })

        // Parallax on images
        const mobileImgs = gsap.utils.toArray<HTMLElement>(
          '.j-arch .j-img-wrap img',
        )

        gsap.set(mobileImgs, { objectPosition: '0px 60%' })

        mobileImgs.forEach((image, i) => {
          const stopIndex = N - 1 - i
          const nextAccent = stops[Math.min(stopIndex + 1, N - 1)].accent

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: image,
              start: 'top-=70% top+=50%',
              end: 'bottom+=200% bottom',
              scrub: true,
            },
          })

          tl.to(
            image,
            { objectPosition: '0px 30%', duration: 5, ease: 'none' },
            0,
          ).to(
            section,
            {
              backgroundColor: nextAccent,
              duration: 1.5,
              ease: 'power2.inOut',
            },
            0,
          )
        })

        // Cleanup order on revert
        return () => {
          textBlocks.forEach((el) => {
            el.style.order = ''
          })
          imgWraps.forEach((el) => {
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
        style={{ backgroundColor: stops[0].accent }}
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
                    alt=""
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
              <div className="j-content">
                <p className="j-label">
                  {stop.number} &mdash; {stop.label}
                </p>
                <h2 className="j-title">{stop.title}</h2>
                <p className="j-desc">{stop.description}</p>
                <div className="j-meta">
                  <Image
                    src={stop.flag}
                    alt=""
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
                src={stop.flag}
                alt=""
                fill
                className="j-img"
                sizes="(max-width: 768px) 100vw, 540px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
