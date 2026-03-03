'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Matter from 'matter-js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/utils/cn'

gsap.registerPlugin(ScrollTrigger)

/* ── Types ──────────────────────────────────────────────── */

type MainTechGroup =
  | 'react' | 'next' | 'ts' | 'css' | 'tailwind' | 'gsap'
  | 'node' | 'sanity' | 'sentry' | 'posthog' | 'mux'
  | 'vercel' | 'github' | 'vscode' | 'figma' | 'supabase'
  | 'clerk' | 'uploadthing' | 'upstash'

type OrphanGroup = 'general'
type ColorGroup = MainTechGroup | OrphanGroup

interface MainTech {
  name: string
  group: MainTechGroup
  icon: string | null
}

interface SubConcept {
  text: string
  group: ColorGroup
}

interface PhysicsItem {
  type: 'icon' | 'pill'
  label: string
  group: ColorGroup
  icon?: string
}

/* ── Color palette ──────────────────────────────────────── */

const GROUP_COLORS: Record<ColorGroup, string> = {
  react: '#61DAFB',
  next: '#808080',
  ts: '#3178C6',
  css: '#264de4',
  tailwind: '#0E7490',
  gsap: '#88CE02',
  node: '#68A063',
  sanity: '#F9B1AB',
  sentry: '#6C5FC7',
  posthog: '#F9BD2B',
  mux: '#FA50B5',
  vercel: '#808080',
  github: '#6e7681',
  vscode: '#007ACC',
  figma: '#F24E1E',
  supabase: '#3ECF8E',
  clerk: '#6C47FF',
  uploadthing: '#EB1E58',
  upstash: '#00E9A3',
  general: '#8B8680',
}

function getContrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff'
}

/* ── Main tech data — organized in 3 rows ───────────────── */

const ROW_1: MainTech[] = [
  { name: 'React',        group: 'react',    icon: '/tech/react.svg' },
  { name: 'Next.js',      group: 'next',     icon: '/tech/nextjs.svg' },
  { name: 'TypeScript',   group: 'ts',       icon: '/tech/typescript.svg' },
  { name: 'Tailwind CSS', group: 'tailwind', icon: '/tech/tailwind.svg' },
  { name: 'GSAP',         group: 'gsap',     icon: '/tech/gsap.svg' },
  { name: 'Node.js',      group: 'node',     icon: '/tech/nodejs.svg' },
  { name: 'CSS',          group: 'css',      icon: '/tech/css3.svg' },
]

const ROW_2: MainTech[] = [
  { name: 'Sanity',   group: 'sanity',   icon: '/tech/sanity.svg' },
  { name: 'Supabase', group: 'supabase', icon: '/tech/Supabase_id9q7Wa4Ba_0.svg' },
  { name: 'Vercel',   group: 'vercel',   icon: '/tech/Vercel_Logo_0.svg' },
  { name: 'GitHub',   group: 'github',   icon: '/tech/github.svg' },
  { name: 'Figma',    group: 'figma',    icon: '/tech/figma-svgrepo-com.svg' },
  { name: 'Sentry',   group: 'sentry',   icon: '/tech/sentry.svg' },
]

const ROW_3: MainTech[] = [
  { name: 'PostHog',     group: 'posthog',     icon: '/tech/posthog-logo.svg' },
  { name: 'Mux',         group: 'mux',         icon: '/tech/Mux_Logo_0.svg' },
  { name: 'VS Code',     group: 'vscode',      icon: '/tech/vs-code-svgrepo-com.svg' },
  { name: 'Clerk',       group: 'clerk',       icon: '/tech/Clerk_idOESnvCPd_1.svg' },
  { name: 'Uploadthing', group: 'uploadthing', icon: null },
  { name: 'Upstash',     group: 'upstash',     icon: '/tech/Upstash-Icon--Streamline-Svg-Logos.svg' },
]

const ALL_TECHS = [...ROW_1, ...ROW_2, ...ROW_3]
const TECH_ROWS = [ROW_1, ROW_2, ROW_3]

/* Row font sizes — row 1 biggest, row 3 smallest */
const ROW_FONT_SIZES = [
  'clamp(1.75rem, 3vw, 2.5rem)',
  'clamp(1.25rem, 2.2vw, 1.75rem)',
  'clamp(1rem, 1.6vw, 1.25rem)',
]

const ROW_DEFAULT_OPACITIES = [0.9, 0.7, 0.5]

/* ── Sub-concepts ───────────────────────────────────────── */

const SUB_CONCEPTS: SubConcept[] = [
  /* ── Row 1 techs: 8-10 pills each ────────────────────── */

  /* React (10) */
  { text: 'Hooks',              group: 'react' },
  { text: 'Context API',        group: 'react' },
  { text: 'Server Components',  group: 'react' },
  { text: 'Client Components',  group: 'react' },
  { text: 'JSX',                group: 'react' },
  { text: 'useRef',             group: 'react' },
  { text: 'useCallback',        group: 'react' },
  { text: 'Suspense',           group: 'react' },
  { text: 'Error Boundaries',   group: 'react' },
  { text: 'Portals',            group: 'react' },
  /* Next.js (10) */
  { text: 'App Router',         group: 'next' },
  { text: 'API Routes',         group: 'next' },
  { text: 'SSR',                group: 'next' },
  { text: 'ISR',                group: 'next' },
  { text: 'Middleware',         group: 'next' },
  { text: 'Image Optimization', group: 'next' },
  { text: 'Route Groups',       group: 'next' },
  { text: 'Dynamic Imports',    group: 'next' },
  { text: 'Server Actions',     group: 'next' },
  { text: 'Metadata API',       group: 'next' },
  /* TypeScript (8) */
  { text: 'Strict Mode',        group: 'ts' },
  { text: 'Type Safety',        group: 'ts' },
  { text: 'Interfaces',         group: 'ts' },
  { text: 'Generics',           group: 'ts' },
  { text: 'Type Guards',        group: 'ts' },
  { text: 'Utility Types',      group: 'ts' },
  { text: 'Enums',              group: 'ts' },
  { text: 'Type Inference',     group: 'ts' },
  /* Tailwind (8) */
  { text: 'Responsive Design',  group: 'tailwind' },
  { text: 'Dark Mode',          group: 'tailwind' },
  { text: 'Custom Themes',      group: 'tailwind' },
  { text: '@theme Config',      group: 'tailwind' },
  { text: 'Clamp Utilities',    group: 'tailwind' },
  { text: 'Animations',         group: 'tailwind' },
  { text: 'Arbitrary Values',   group: 'tailwind' },
  { text: 'Container Queries',  group: 'tailwind' },
  /* GSAP (8) */
  { text: 'ScrollTrigger',      group: 'gsap' },
  { text: 'Timelines',          group: 'gsap' },
  { text: 'Stagger',            group: 'gsap' },
  { text: 'gsap.context()',     group: 'gsap' },
  { text: 'fromTo',             group: 'gsap' },
  { text: 'Word Morph',         group: 'gsap' },
  { text: 'autoAlpha',          group: 'gsap' },
  { text: 'Easing Functions',   group: 'gsap' },
  /* Node.js (8) */
  { text: 'API Handlers',       group: 'node' },
  { text: 'Env Variables',      group: 'node' },
  { text: 'Async/Await',        group: 'node' },
  { text: 'Module System',      group: 'node' },
  { text: 'File System',        group: 'node' },
  { text: 'JSON Parsing',       group: 'node' },
  { text: 'Error Handling',     group: 'node' },
  { text: 'Process Events',     group: 'node' },
  /* CSS (8) */
  { text: 'Flexbox',            group: 'css' },
  { text: 'Grid',               group: 'css' },
  { text: 'Custom Properties',  group: 'css' },
  { text: 'Keyframes',          group: 'css' },
  { text: 'Media Queries',      group: 'css' },
  { text: 'Transitions',        group: 'css' },
  { text: 'Pseudo Elements',    group: 'css' },
  { text: 'Clamp & Calc',       group: 'css' },

  /* ── Row 2 techs: 5-6 pills each ─────────────────────── */

  /* Sanity (6) */
  { text: 'GROQ',               group: 'sanity' },
  { text: 'Schemas',            group: 'sanity' },
  { text: 'Visual Editing',     group: 'sanity' },
  { text: 'Webhooks',           group: 'sanity' },
  { text: 'Live Preview',       group: 'sanity' },
  { text: 'Presentation',       group: 'sanity' },
  /* Supabase (5) */
  { text: 'OAuth Login',        group: 'supabase' },
  { text: 'Database CRUD',      group: 'supabase' },
  { text: 'Row Policies',       group: 'supabase' },
  { text: 'Realtime',           group: 'supabase' },
  { text: 'Session Cookies',    group: 'supabase' },
  /* Vercel (5) */
  { text: 'Deployments',        group: 'vercel' },
  { text: 'Image CDN',          group: 'vercel' },
  { text: 'Edge Config',        group: 'vercel' },
  { text: 'Preview URLs',       group: 'vercel' },
  { text: 'Env Management',     group: 'vercel' },
  /* GitHub (5) */
  { text: 'Repositories',       group: 'github' },
  { text: 'Branches',           group: 'github' },
  { text: 'Pull Requests',      group: 'github' },
  { text: 'Code Review',        group: 'github' },
  { text: 'Git Workflow',       group: 'github' },
  /* Figma (5) */
  { text: 'UI Design',          group: 'figma' },
  { text: 'Wireframes',         group: 'figma' },
  { text: 'Components',         group: 'figma' },
  { text: 'Prototyping',        group: 'figma' },
  { text: 'Design Tokens',      group: 'figma' },
  /* Sentry (5) */
  { text: 'Error Tracking',     group: 'sentry' },
  { text: 'Session Replay',     group: 'sentry' },
  { text: 'Trace Sampling',     group: 'sentry' },
  { text: 'Edge Runtime',       group: 'sentry' },
  { text: 'Source Maps',        group: 'sentry' },

  /* ── Row 3 techs: 3 pills each ───────────────────────── */

  /* PostHog (3) */
  { text: 'Pageview Tracking',  group: 'posthog' },
  { text: 'Event Capture',      group: 'posthog' },
  { text: 'User Identification', group: 'posthog' },
  /* Mux (3) */
  { text: 'HLS Streaming',      group: 'mux' },
  { text: 'Playback IDs',       group: 'mux' },
  { text: 'Poster Images',      group: 'mux' },
  /* VS Code (3) */
  { text: 'Extensions',         group: 'vscode' },
  { text: 'Snippets',           group: 'vscode' },
  { text: 'Debugging',          group: 'vscode' },
  /* Clerk (3) */
  { text: 'User Profiles',      group: 'clerk' },
  { text: 'Sign-in Flows',      group: 'clerk' },
  { text: 'Auth Middleware',     group: 'clerk' },
  /* Uploadthing (3) */
  { text: 'Image Uploads',      group: 'uploadthing' },
  { text: 'Upload Dropzone',    group: 'uploadthing' },
  { text: 'File URLs',          group: 'uploadthing' },
  /* Upstash (3) */
  { text: 'Rate Limiting',      group: 'upstash' },
  { text: 'Redis Store',        group: 'upstash' },
  { text: 'Sliding Window',     group: 'upstash' },

  /* ── General (cross-cutting, no parent tech) ──────────── */
  { text: 'PWA',                group: 'general' },
  { text: 'REST APIs',          group: 'general' },
  { text: 'Lenis',              group: 'general' },
  { text: 'ESLint',             group: 'general' },
  { text: 'Prettier',           group: 'general' },
  { text: 'pnpm',               group: 'general' },
  { text: 'Radix UI',           group: 'general' },
  { text: 'PostgreSQL',         group: 'general' },
  { text: 'ORM',                group: 'general' },
]

/* ── Physics items (icons + pills) ─────────────────────── */

const PHYSICS_ITEMS: PhysicsItem[] = [
  ...ALL_TECHS.filter((t) => t.icon !== null).map((t) => ({
    type: 'icon' as const,
    label: t.name,
    group: t.group as ColorGroup,
    icon: t.icon as string,
  })),
  { type: 'pill' as const, label: 'Uploadthing', group: 'uploadthing' as ColorGroup },
  ...SUB_CONCEPTS.map((s) => ({
    type: 'pill' as const,
    label: s.text,
    group: s.group,
  })),
]

/* ── Matter.js aliases ──────────────────────────────────── */

const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter

/* ── Component ──────────────────────────────────────────── */

export default function TechStackSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const textListRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const bodiesRef = useRef<Matter.Body[]>([])
  const rafRef = useRef<number>(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [hoveredGroup, setHoveredGroup] = useState<MainTechGroup | null>(null)
  const hoveredGroupRef = useRef<MainTechGroup | null>(null)

  /* ── Build / rebuild the physics world ── */
  const buildWorld = useCallback(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    /* Tear down previous world */
    cancelAnimationFrame(rafRef.current)
    if (runnerRef.current) Runner.stop(runnerRef.current)
    if (engineRef.current) Engine.clear(engineRef.current)

    const cw = container.offsetWidth
    const ch = container.offsetHeight
    const wallT = 50

    /* Resize canvas to match container */
    canvas.width = cw
    canvas.height = ch

    /* Engine + runner */
    const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 } })
    engineRef.current = engine
    const runner = Runner.create()
    runnerRef.current = runner
    Runner.run(runner, engine)

    /* Walls — inset so pills stay fully visible inside the container */
    const wallOpts = { isStatic: true, render: { visible: false } }
    const inset = 4
    Composite.add(engine.world, [
      Bodies.rectangle(cw / 2, -wallT / 2 + inset, cw + wallT * 2, wallT, wallOpts),
      Bodies.rectangle(cw / 2, ch + wallT / 2 - inset, cw + wallT * 2, wallT, wallOpts),
      Bodies.rectangle(-wallT / 2 + inset, ch / 2, wallT, ch + wallT * 2, wallOpts),
      Bodies.rectangle(cw + wallT / 2 - inset, ch / 2, wallT, ch + wallT * 2, wallOpts),
    ])

    /* Bodies from measured DOM elements */
    const bodies: Matter.Body[] = []
    const bodyOpts = { frictionAir: 0.01, friction: 0.1, restitution: 0.6 }

    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      if (w === 0 || h === 0) return

      const x = Math.random() * (cw - w - 20) + w / 2 + 10
      const y = Math.random() * (ch * 0.3) + h

      const isIcon = PHYSICS_ITEMS[i].type === 'icon'
      const body = Bodies.rectangle(x, y, w, h, {
        ...bodyOpts,
        chamfer: { radius: isIcon ? 6 : h / 2 },
        label: PHYSICS_ITEMS[i].label,
      })

      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 3,
        y: Math.random() * 2,
      })

      bodies.push(body)
    })

    bodiesRef.current = bodies
    Composite.add(engine.world, bodies)

    /* Show items */
    itemRefs.current.forEach((el) => {
      if (el) el.style.opacity = '1'
    })

    /* Mouse / touch via canvas overlay */
    const mouse = Mouse.create(canvas)
    mouse.pixelRatio = window.devicePixelRatio || 1
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    })
    Composite.add(engine.world, mouseConstraint)

    /* RAF — apply magnet forces + sync DOM to physics */
    const sync = () => {
      const hg = hoveredGroupRef.current

      bodies.forEach((body, i) => {
        const el = itemRefs.current[i]
        if (!el) return

        /* Magnet: pull matching pills up, nudge others down to clear the way */
        if (hg !== null) {
          if (PHYSICS_ITEMS[i].group === hg) {
            Body.applyForce(body, body.position, { x: 0, y: -0.001 * body.mass })
          } else {
            Body.applyForce(body, body.position, { x: 0, y: 0.0003 * body.mass })
          }
        }

        const { x, y } = body.position
        const w = el.offsetWidth
        const h = el.offsetHeight
        el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${body.angle}rad)`
      })
      rafRef.current = requestAnimationFrame(sync)
    }
    rafRef.current = requestAnimationFrame(sync)
  }, [])

  /* ── Mount / unmount ── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setReducedMotion(true)
      return
    }

    /* Wait for fonts + images before measuring */
    document.fonts.ready.then(() => {
      const images = containerRef.current?.querySelectorAll('img') ?? []
      const promises = Array.from(images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.onload = () => resolve()
              img.onerror = () => resolve()
            }),
      )
      Promise.all(promises).then(buildWorld)
    })

    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(buildWorld, 300)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
      cancelAnimationFrame(rafRef.current)
      if (runnerRef.current) Runner.stop(runnerRef.current)
      if (engineRef.current) Engine.clear(engineRef.current)
    }
  }, [buildWorld])

  /* ── GSAP word-by-word entrance for text list ── */
  useEffect(() => {
    if (!textListRef.current) return

    const ctx = gsap.context(() => {
      const words = textListRef.current?.querySelectorAll<HTMLSpanElement>('[data-tech-word]')
      if (!words?.length) return

      gsap.set(words, { autoAlpha: 0, y: 20 })
      gsap.to(words, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: { each: 0.06, from: 'start' },
        scrollTrigger: {
          trigger: textListRef.current,
          start: 'top 85%',
          once: true,
        },
      })
    }, textListRef)

    return () => ctx.revert()
  }, [reducedMotion])

  /* ── Keep ref in sync so the RAF loop can read hover state ── */
  useEffect(() => {
    hoveredGroupRef.current = hoveredGroup
  }, [hoveredGroup])

  /* ── Hover highlight on physics items ── */
  useEffect(() => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const item = PHYSICS_ITEMS[i]

      if (hoveredGroup === null) {
        el.style.opacity = '1'
        el.style.filter = 'none'
        el.style.boxShadow = 'none'
      } else if (item.group === hoveredGroup) {
        const color = GROUP_COLORS[item.group]
        el.style.opacity = '1'
        el.style.filter = 'none'
        el.style.boxShadow = `0 0 12px ${color}60`
      } else {
        el.style.opacity = '0.2'
        el.style.filter = 'grayscale(1)'
        el.style.boxShadow = 'none'
      }
    })
  }, [hoveredGroup])

  /* ── Click: shake non-matching pills + pulse matching ones upward ── */
  const shakeNonMatching = useCallback((group: MainTechGroup) => {
    bodiesRef.current.forEach((body, i) => {
      if (PHYSICS_ITEMS[i].group === group) {
        Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: -12 })
      } else {
        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 16,
          y: (Math.random() - 0.5) * 12,
        })
      }
    })
  }, [])

  /* ── Render ── */
  return (
    <section
      ref={sectionRef}
      className="sticky top-0 min-h-screen projects-theme-bg"
    >
      <div
        className="flex min-h-screen flex-col px-6 py-12"
        style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}
      >
      {/* Eyebrow */}
      <p className="mb-6 font-ui text-sm text-text-muted uppercase tracking-widest">
        Toolbox
      </p>

      {/* ── Tech text list (3 rows, word-by-word animation) ── */}
      <div ref={textListRef} className="mb-8 space-y-2">
        {TECH_ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex flex-wrap justify-center items-baseline gap-x-4 gap-y-2"
          >
            {row.map((tech) => (
              <span
                key={tech.group}
                data-tech-word
                className="cursor-default font-heading font-bold select-none"
                style={{
                  fontSize: ROW_FONT_SIZES[rowIdx],
                  opacity: hoveredGroup === null
                    ? ROW_DEFAULT_OPACITIES[rowIdx]
                    : hoveredGroup === tech.group
                      ? 1
                      : 0.15,
                  color: hoveredGroup === tech.group
                    ? 'var(--color-text)'
                    : 'var(--color-text-muted)',
                  transform: hoveredGroup === tech.group ? 'scale(1.05)' : 'scale(1)',
                  transition: 'opacity 0.3s ease-out, color 0.3s ease-out, transform 0.3s ease-out',
                }}
                onMouseEnter={() => setHoveredGroup(tech.group)}
                onMouseLeave={() => setHoveredGroup(null)}
                onClick={() => shakeNonMatching(tech.group)}
              >
                {tech.name}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ── Physics playground (takes remaining space) ── */}
      {reducedMotion ? (
        <div className="flex flex-1 flex-wrap content-start gap-3 justify-center rounded-2xl border border-border bg-bg-alt p-6">
          {PHYSICS_ITEMS.map((item) => {
            const color = GROUP_COLORS[item.group]
            return (
              <div
                key={`${item.type}-${item.label}`}
                className={cn(
                  'flex items-center justify-center',
                  item.type === 'icon'
                    ? 'rounded-lg p-2'
                    : 'rounded-full px-3 py-1.5 font-ui text-xs',
                )}
                style={{
                  backgroundColor: color,
                  color: getContrastText(color),
                }}
              >
                {item.type === 'icon' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={ALL_TECHS.find((t) => t.name === item.label)?.icon ?? ''}
                    alt={item.label}
                    draggable={false}
                    style={{ height: 36, width: 'auto', maxWidth: 56, objectFit: 'contain' }}
                  />
                ) : (
                  item.label
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative flex-1 w-full overflow-hidden rounded-2xl border border-border bg-bg-alt"
          style={{ minHeight: 300, touchAction: 'none' }}
        >
          {PHYSICS_ITEMS.map((item, i) => {
            const color = GROUP_COLORS[item.group]
            return (
              <div
                key={`${item.type}-${item.label}`}
                ref={(el) => { itemRefs.current[i] = el }}
                className={cn(
                  'absolute left-0 top-0 pointer-events-none select-none will-change-transform',
                  item.type === 'icon'
                    ? 'flex items-center justify-center rounded-lg p-2'
                    : 'flex items-center justify-center rounded-full px-3 py-1.5 font-ui text-xs font-semibold',
                )}
                style={{
                  opacity: 0,
                  transition: 'opacity 0.3s, filter 0.3s, box-shadow 0.3s',
                  backgroundColor: color,
                  color: getContrastText(color),
                }}
              >
                {item.type === 'icon' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.icon}
                    alt={item.label}
                    draggable={false}
                    style={{
                      height: 36,
                      width: 'auto',
                      maxWidth: 56,
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  item.label
                )}
              </div>
            )
          })}

          {/* Transparent canvas overlay for mouse/touch */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ cursor: 'grab' }}
          />
        </div>
      )}
      </div>
    </section>
  )
}
