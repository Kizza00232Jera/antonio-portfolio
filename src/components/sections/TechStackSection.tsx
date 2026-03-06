'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ── Types ──────────────────────────────────────────────── */

type MainTechGroup =
  | 'react' | 'next' | 'ts' | 'css' | 'tailwind' | 'gsap'
  | 'node' | 'sanity' | 'sentry' | 'posthog' | 'mux'
  | 'vercel' | 'github' | 'figma' | 'supabase'
  | 'clerk' | 'uploadthing' | 'upstash'

type ColorGroup = MainTechGroup

/* ── Color palette ──────────────────────────────────────── */

const GROUP_COLORS: Record<ColorGroup, string> = {
  react: '#61DAFB',
  next: '#ffffff',
  ts: '#3178C6',
  css: '#264de4',
  tailwind: '#0E7490',
  gsap: '#88CE02',
  node: '#68A063',
  sanity: '#F9B1AB',
  sentry: '#6C5FC7',
  posthog: '#F9BD2B',
  mux: '#FA50B5',
  vercel: '#ffffff',
  github: '#ffffff',
  figma: '#F24E1E',
  supabase: '#3ECF8E',
  clerk: '#6C47FF',
  uploadthing: '#EB1E58',
  upstash: '#00E9A3',
}

/* ── Tech data ─────────────────────────────────────────── */

interface MainTech {
  name: string
  group: MainTechGroup
  icon: string | null
}

const ALL_TECHS: MainTech[] = [
  { name: 'React',        group: 'react',       icon: '/tech/react.svg' },
  { name: 'Next.js',      group: 'next',        icon: '/tech/nextjs.svg' },
  { name: 'TypeScript',   group: 'ts',          icon: '/tech/typescript.svg' },
  { name: 'Tailwind CSS', group: 'tailwind',    icon: '/tech/tailwind.svg' },
  { name: 'GSAP',         group: 'gsap',        icon: '/tech/gsap.svg' },
  { name: 'Node.js',      group: 'node',        icon: '/tech/nodejs.svg' },
  { name: 'CSS',          group: 'css',         icon: '/tech/css.svg' },
  { name: 'Sanity',       group: 'sanity',      icon: '/tech/sanity.svg' },
  { name: 'Supabase',     group: 'supabase',    icon: '/tech/supabase.svg' },
  { name: 'Vercel',       group: 'vercel',      icon: '/tech/vercel.svg' },
  { name: 'GitHub',       group: 'github',      icon: '/tech/github.svg' },
  { name: 'Figma',        group: 'figma',       icon: '/tech/figma.svg' },
  { name: 'Sentry',       group: 'sentry',      icon: '/tech/sentry.svg' },
  { name: 'PostHog',      group: 'posthog',     icon: '/tech/posthog.svg' },
  { name: 'Mux',          group: 'mux',         icon: '/tech/mux.svg' },
  { name: 'Clerk',        group: 'clerk',       icon: '/tech/clerk.svg' },
  { name: 'Uploadthing',  group: 'uploadthing', icon: '/tech/uploadthing.svg' },
  { name: 'Upstash',      group: 'upstash',     icon: '/tech/upstash.svg' },
]

/* ── Sub-concepts per tech ──────────────────────────────── */

interface WaveItem {
  text: string
  icon: string | null
  group: ColorGroup
}

const SUB_CONCEPTS: { text: string; group: ColorGroup }[] = [
  /* React */
  { text: 'Hooks',              group: 'react' },
  { text: 'Context API',        group: 'react' },
  { text: 'Server Comps',       group: 'react' },
  { text: 'Client Comps',       group: 'react' },
  { text: 'JSX',                group: 'react' },
  { text: 'Suspense',           group: 'react' },
  /* Next.js */
  { text: 'App Router',         group: 'next' },
  { text: 'API Routes',         group: 'next' },
  { text: 'SSR',                group: 'next' },
  { text: 'ISR',                group: 'next' },
  { text: 'Middleware',          group: 'next' },
  { text: 'Server Actions',     group: 'next' },
  /* TypeScript */
  { text: 'Strict Mode',        group: 'ts' },
  { text: 'Type Safety',        group: 'ts' },
  { text: 'Interfaces',         group: 'ts' },
  { text: 'Generics',           group: 'ts' },
  { text: 'Type Guards',        group: 'ts' },
  /* Tailwind */
  { text: 'Responsive Design',  group: 'tailwind' },
  { text: 'Dark Mode',          group: 'tailwind' },
  { text: 'Custom Themes',      group: 'tailwind' },
  { text: '@theme Config',      group: 'tailwind' },
  { text: 'Animations',         group: 'tailwind' },
  /* GSAP */
  { text: 'ScrollTrigger',      group: 'gsap' },
  { text: 'Timelines',          group: 'gsap' },
  { text: 'Stagger',            group: 'gsap' },
  { text: 'gsap.context()',     group: 'gsap' },
  { text: 'Easing Functions',   group: 'gsap' },
  /* Node.js */
  { text: 'API Handlers',       group: 'node' },
  { text: 'Async/Await',        group: 'node' },
  { text: 'Module System',      group: 'node' },
  { text: 'Error Handling',     group: 'node' },
  /* CSS */
  { text: 'Flexbox',            group: 'css' },
  { text: 'Grid',               group: 'css' },
  { text: 'Custom Props',       group: 'css' },
  { text: 'Keyframes',          group: 'css' },
  { text: 'Media Queries',      group: 'css' },
  /* Sanity */
  { text: 'GROQ',               group: 'sanity' },
  { text: 'Schemas',            group: 'sanity' },
  { text: 'Visual Editing',     group: 'sanity' },
  { text: 'Webhooks',           group: 'sanity' },
  /* Supabase */
  { text: 'OAuth Login',        group: 'supabase' },
  { text: 'Database CRUD',      group: 'supabase' },
  { text: 'Row Policies',       group: 'supabase' },
  { text: 'Realtime',           group: 'supabase' },
  /* Vercel */
  { text: 'Deployments',        group: 'vercel' },
  { text: 'Image CDN',          group: 'vercel' },
  { text: 'Preview URLs',       group: 'vercel' },
  /* GitHub */
  { text: 'Repositories',       group: 'github' },
  { text: 'Pull Requests',      group: 'github' },
  { text: 'Git Workflow',       group: 'github' },
  /* Figma */
  { text: 'UI Design',          group: 'figma' },
  { text: 'Wireframes',         group: 'figma' },
  { text: 'Prototyping',        group: 'figma' },
  /* Sentry */
  { text: 'Error Tracking',     group: 'sentry' },
  { text: 'Session Replay',     group: 'sentry' },
  { text: 'Source Maps',        group: 'sentry' },
  /* PostHog */
  { text: 'Pageview Tracking',  group: 'posthog' },
  { text: 'Event Capture',      group: 'posthog' },
  { text: 'User Identification', group: 'posthog' },
  /* Mux */
  { text: 'HLS Streaming',      group: 'mux' },
  { text: 'Playback IDs',       group: 'mux' },
  { text: 'Poster Images',      group: 'mux' },
  /* Clerk */
  { text: 'User Profiles',      group: 'clerk' },
  { text: 'Sign-in Flows',      group: 'clerk' },
  { text: 'Auth Middleware',     group: 'clerk' },
  /* Uploadthing */
  { text: 'Image Uploads',      group: 'uploadthing' },
  { text: 'Upload Dropzone',    group: 'uploadthing' },
  { text: 'File URLs',          group: 'uploadthing' },
  /* Upstash */
  { text: 'Rate Limiting',      group: 'upstash' },
  { text: 'Redis Store',        group: 'upstash' },
  { text: 'Sliding Window',     group: 'upstash' },
]

/* ── Build wave items (sub-concept → parent tech lookup) ── */

const TECH_MAP = new Map(ALL_TECHS.map((t) => [t.group, t]))

const WAVE_ITEMS: WaveItem[] = SUB_CONCEPTS.map((sc) => {
  const tech = TECH_MAP.get(sc.group)!
  return {
    text: sc.text,
    icon: tech.icon,
    group: sc.group,
  }
})

/* Unique images for preloading */
const UNIQUE_ICONS = [...new Set(WAVE_ITEMS.map((w) => w.icon).filter(Boolean))] as string[]

/* ── Wave config ──────────────────────────────────────── */

const WAVE_NUMBER = 0.6
const WAVE_SPEED = 1

/* ── Component ──────────────────────────────────────────── */

export default function TechStackSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)
  const thumbnailRef = useRef<HTMLImageElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const wrapper = wrapperRef.current
    const leftCol = leftColRef.current
    const rightCol = rightColRef.current
    const thumbnail = thumbnailRef.current
    if (!wrapper || !leftCol || !rightCol || !thumbnail) return

    const isMobile = window.innerWidth < 768

    const ctx = gsap.context(() => {
      const leftTexts = gsap.utils.toArray<HTMLElement>(
        leftCol.querySelectorAll('.wave-text'),
      )
      const rightTexts = gsap.utils.toArray<HTMLElement>(
        rightCol.querySelectorAll('.wave-text'),
      )

      if (leftTexts.length === 0 || rightTexts.length === 0) return

      /* quickTo setters for smooth 60fps position updates (desktop only) */
      const leftSetters = isMobile ? [] : leftTexts.map((el) =>
        gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power4.out' }),
      )
      const rightSetters = isMobile ? [] : rightTexts.map((el) =>
        gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power4.out' }),
      )

      /* Range calculation */
      let leftRange = { minX: 0, maxX: 0 }
      let rightRange = { minX: 0, maxX: 0 }

      function calculateRanges() {
        const maxLeftW = Math.max(...leftTexts.map((t) => t.offsetWidth))
        const maxRightW = Math.max(...rightTexts.map((t) => t.offsetWidth))
        const leftColW = leftCol!.offsetWidth
        const rightColW = rightCol!.offsetWidth
        leftRange = { minX: 0, maxX: Math.max(leftColW * 0.3, leftColW - maxLeftW) }
        rightRange = { minX: 0, maxX: Math.max(rightColW * 0.3, rightColW - maxRightW) }
      }

      if (!isMobile) {
        calculateRanges()
      }

      /* Set initial wave positions (desktop only) */
      function setInitialPositions(
        texts: HTMLElement[],
        range: { minX: number; maxX: number },
        multiplier: number,
      ) {
        const rangeSize = range.maxX - range.minX
        texts.forEach((text, index) => {
          const phase = WAVE_NUMBER * index - Math.PI / 2
          const wave = Math.sin(phase)
          const progress = (wave + 1) / 2
          gsap.set(text, { x: (range.minX + progress * rangeSize) * multiplier })
        })
      }

      if (!isMobile) {
        setInitialPositions(leftTexts, leftRange, 1)
        setInitialPositions(rightTexts, rightRange, -1)
      }

      /* Sine wave position calculator */
      function calculateWavePosition(
        index: number,
        globalProgress: number,
        minX: number,
        range: number,
      ) {
        const phase =
          WAVE_NUMBER * index +
          WAVE_SPEED * globalProgress * Math.PI * 2 -
          Math.PI / 2
        const wave = Math.sin(phase)
        const cycleProgress = (wave + 1) / 2
        return minX + cycleProgress * range
      }

      /* Find which left text is closest to viewport center.
         Returns -1 if no item is close enough. */
      function findClosestToViewportCenter() {
        const viewportCenter = window.innerHeight / 2
        const threshold = window.innerHeight * 0.2
        let closestIndex = -1
        let minDistance = Infinity

        leftTexts.forEach((text, index) => {
          const rect = text.getBoundingClientRect()
          const elementCenter = rect.top + rect.height / 2
          const distance = Math.abs(elementCenter - viewportCenter)
          if (distance < minDistance && distance < threshold) {
            minDistance = distance
            closestIndex = index
          }
        })

        return closestIndex
      }

      /* Update column positions + focused state */
      function updateColumn(
        texts: HTMLElement[],
        setters: ReturnType<typeof gsap.quickTo>[],
        range: { minX: number; maxX: number },
        progress: number,
        focusedIndex: number,
        multiplier: number,
      ) {
        const rangeSize = range.maxX - range.minX

        texts.forEach((text, index) => {
          /* Wave X movement only on desktop */
          if (!isMobile) {
            const finalX = calculateWavePosition(index, progress, range.minX, rangeSize) * multiplier
            setters[index](finalX)
          }

          if (index === focusedIndex) {
            text.classList.add('focused')
          } else {
            text.classList.remove('focused')
          }
        })
      }

      /* Track current image to avoid redundant swaps */
      let currentImage: string | null = null

      /* Update thumbnail position + image */
      function updateThumbnail(focusedIndex: number) {
        if (!thumbnail) return

        if (focusedIndex === -1) {
          gsap.set(thumbnail, { opacity: 0 })
          return
        }

        const focusedText = leftTexts[focusedIndex]
        if (!focusedText) return

        gsap.set(thumbnail, { opacity: 1 })

        const newImage = focusedText.dataset.image
        if (newImage && currentImage !== newImage) {
          currentImage = newImage
          thumbnail.src = newImage
        }

        /* Position thumbnail centered in viewport, clamped to wrapper */
        const wrapperRect = wrapper!.getBoundingClientRect()
        const viewportCenter = window.innerHeight / 2
        const thumbHeight = thumbnail.offsetHeight
        const wrapperHeight = wrapper!.offsetHeight

        const idealY = viewportCenter - wrapperRect.top - thumbHeight / 2
        const minY = -thumbHeight / 2
        const maxY = wrapperHeight - thumbHeight / 2
        const clampedY = Math.max(minY, Math.min(maxY, idealY))

        gsap.set(thumbnail, { y: clampedY })
      }

      /* ScrollTrigger drives everything */
      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const progress = self.progress
          const closestIndex = findClosestToViewportCenter()

          updateColumn(leftTexts, leftSetters, leftRange, progress, closestIndex, 1)
          updateColumn(rightTexts, rightSetters, rightRange, progress, closestIndex, -1)

          updateThumbnail(closestIndex)
        },
      })

      /* Recalculate on resize (desktop only) */
      const onResize = () => { if (!isMobile) calculateRanges() }
      window.addEventListener('resize', onResize)

      return () => {
        window.removeEventListener('resize', onResize)
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  /* ── Reduced motion: static grid fallback ── */
  if (reducedMotion) {
    const grouped = new Map<ColorGroup, string[]>()
    WAVE_ITEMS.forEach((item) => {
      if (!grouped.has(item.group)) grouped.set(item.group, [])
      grouped.get(item.group)!.push(item.text)
    })

    return (
      <section ref={sectionRef} data-theme="dark" className="py-24 px-6">
        <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
          <h2 className="font-heading font-bold text-text mb-12 text-[length:var(--text-display)]">
            Toolbox
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {ALL_TECHS.map((tech) => {
              const items = grouped.get(tech.group)
              if (!items) return null
              return (
                <div key={tech.group}>
                  <div className="flex items-center gap-2 mb-3">
                    {tech.icon && (
                      <Image
                        src={tech.icon}
                        alt={tech.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    )}
                    <span
                      className="font-heading font-bold text-sm uppercase"
                      style={{ color: GROUP_COLORS[tech.group] }}
                    >
                      {tech.name}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <li key={item} className="text-sm text-text-muted">{item}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} data-theme="dark" className="relative bg-bg overflow-hidden">
      {/* Preload tech SVGs */}
      {UNIQUE_ICONS.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}

      <div
        ref={wrapperRef}
        className="dual-wave-wrapper"
        style={{ paddingTop: '35vh', paddingBottom: '35vh' }}
      >
        {/* Left column: sub-concept names */}
        <div ref={leftColRef} className="wave-column wave-column-left">
          {WAVE_ITEMS.map((item, i) => (
            <div
              key={`l-${i}`}
              className="wave-text"
              data-image={item.icon ?? undefined}
              data-group={item.group}
            >
              {item.text}
            </div>
          ))}
        </div>

        {/* Center: tech logo thumbnail */}
        <div className="wave-image-wrapper">
          <img
            ref={thumbnailRef}
            src={UNIQUE_ICONS[0]}
            alt="Tech logo"
            className="wave-image-thumbnail"
          />
        </div>

        {/* Right column: same words mirrored */}
        <div ref={rightColRef} className="wave-column wave-column-right">
          {WAVE_ITEMS.map((item, i) => (
            <div
              key={`r-${i}`}
              className="wave-text"
              data-group={item.group}
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
