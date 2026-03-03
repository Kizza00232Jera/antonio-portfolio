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

/* Row font sizes — row 1 biggest, row 3 smallest
   Mobile minimums are smaller so the text list stays compact
   and leaves more room for the physics container. */
const ROW_FONT_SIZES = [
  'clamp(1.15rem, 3vw, 2.5rem)',
  'clamp(0.95rem, 2.2vw, 1.75rem)',
  'clamp(0.8rem, 1.6vw, 1.25rem)',
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
  const rafRef = useRef<number>(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<Set<MainTechGroup>>(new Set())
  const selectedGroupsRef = useRef<Set<MainTechGroup>>(new Set())

  const toggleGroupRef = useRef<(group: MainTechGroup) => void>(() => {})
  const cursorRef = useRef<SVGSVGElement>(null)
  const rippleRef = useRef<HTMLSpanElement>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  /* Body tracking: group → [{ body, itemIndex }] */
  const groupBodiesRef = useRef<Map<string, Array<{ body: Matter.Body; idx: number }>>>(new Map())

  /* Keep ref in sync so callbacks can read current selection */
  useEffect(() => {
    selectedGroupsRef.current = selectedGroups
  }, [selectedGroups])

  /* ── Drop pills for a group into the container ── */
  const addGroupBodies = useCallback((group: string) => {
    const container = containerRef.current
    const engine = engineRef.current
    if (!container || !engine) return

    const cw = container.offsetWidth
    const entries: Array<{ body: Matter.Body; idx: number }> = []

    PHYSICS_ITEMS.forEach((item, i) => {
      if (item.group !== group) return
      const el = itemRefs.current[i]
      if (!el) return

      el.style.opacity = '1'

      const rect = el.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      if (w === 0 || h === 0) return

      const x = Math.random() * (cw - w - 40) + w / 2 + 20
      const y = h // near top — gravity pulls them down

      const isIcon = item.type === 'icon'
      const body = Bodies.rectangle(x, y, w, h, {
        frictionAir: 0.01,
        friction: 0.1,
        restitution: 0.6,
        chamfer: { radius: isIcon ? 6 : h / 2 },
      })

      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 3,
        y: Math.random() * 2,
      })

      Composite.add(engine.world, body)
      entries.push({ body, idx: i })
    })

    groupBodiesRef.current.set(group, entries)
  }, [])

  /* ── Explode + remove pills for a group ── */
  const removeGroupBodies = useCallback((group: string) => {
    const engine = engineRef.current
    if (!engine) return

    const entries = groupBodiesRef.current.get(group)
    if (!entries) return

    // Explosion: fling upward + random sideways
    entries.forEach(({ body }) => {
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 20,
        y: -(Math.random() * 15 + 5),
      })
    })

    // After 500 ms remove from world and hide DOM elements
    setTimeout(() => {
      entries.forEach(({ body, idx }) => {
        try {
          Composite.remove(engine.world, body)
        } catch {
          /* body already removed (e.g. resize rebuild) */
        }
        const el = itemRefs.current[idx]
        if (el) {
          el.style.opacity = '0'
          el.style.transform = ''
        }
      })
      groupBodiesRef.current.delete(group)
    }, 500)
  }, [])

  /* ── Build / rebuild the physics world ── */
  const buildWorld = useCallback(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const cw = container.offsetWidth
    const ch = container.offsetHeight
    if (cw === 0 || ch === 0) return

    /* Tear down previous */
    cancelAnimationFrame(rafRef.current)
    if (runnerRef.current) Runner.stop(runnerRef.current)
    if (engineRef.current) Engine.clear(engineRef.current)
    groupBodiesRef.current.clear()

    /* Hide all items */
    itemRefs.current.forEach((el) => {
      if (el) { el.style.opacity = '0'; el.style.transform = '' }
    })

    canvas.width = cw
    canvas.height = ch

    /* Fresh engine — default gravity scale (0.001) */
    const engine = Engine.create()
    engineRef.current = engine

    /* Walls — flush with container edges, thick enough to catch everything */
    const wallT = 60
    const wo = { isStatic: true, render: { visible: false } }
    Composite.add(engine.world, [
      Bodies.rectangle(cw / 2, -wallT / 2, cw + wallT * 2, wallT, wo),
      Bodies.rectangle(cw / 2, ch + wallT / 2, cw + wallT * 2, wallT, wo),
      Bodies.rectangle(-wallT / 2, ch / 2, wallT, ch + wallT * 2, wo),
      Bodies.rectangle(cw + wallT / 2, ch / 2, wallT, ch + wallT * 2, wo),
    ])

    /* Mouse drag — desktop only (touch listeners block scroll on mobile) */
    if (!window.matchMedia('(pointer: coarse)').matches) {
      const mouse = Mouse.create(canvas)
      mouse.pixelRatio = window.devicePixelRatio || 1
      Composite.add(engine.world, MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      }))
    }

    /* Re-add bodies for currently selected groups */
    selectedGroupsRef.current.forEach((group) => addGroupBodies(group))

    /* Runner handles physics timing (battle-tested across devices) */
    const runner = Runner.create()
    Runner.run(runner, engine)
    runnerRef.current = runner

    /* RAF loop — DOM sync only, no physics stepping */
    const sync = () => {
      groupBodiesRef.current.forEach((entries) => {
        entries.forEach(({ body, idx }) => {
          const el = itemRefs.current[idx]
          if (!el) return
          const { x, y } = body.position
          const w = el.offsetWidth
          const h = el.offsetHeight
          el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${body.angle}rad)`
        })
      })
      rafRef.current = requestAnimationFrame(sync)
    }
    rafRef.current = requestAnimationFrame(sync)
  }, [addGroupBodies])

  /* ── Toggle a tech group on/off ── */
  const toggleGroup = useCallback(
    (group: MainTechGroup) => {
      setSelectedGroups((prev) => {
        const next = new Set(prev)
        if (next.has(group)) {
          next.delete(group)
          removeGroupBodies(group)
        } else {
          next.add(group)
          addGroupBodies(group)
        }
        return next
      })
    },
    [addGroupBodies, removeGroupBodies],
  )

  /* Keep ref in sync so the demo effect can call toggleGroup */
  useEffect(() => {
    toggleGroupRef.current = toggleGroup
  }, [toggleGroup])

  /* ── Mount / unmount ── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setReducedMotion(true)
      return
    }

    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches)

    /* Build world immediately — engine is ready for interactions. */
    buildWorld()

    /* Wait for fonts so text rows have their final height before we
       measure the container for wall placement. fonts.ready resolves
       even if fonts fail to load, so this never blocks indefinitely. */
    document.fonts.ready.then(() => buildWorld())

    /* ResizeObserver catches any later dimension change (viewport
       rotation, browser resize, dynamic content) and rebuilds. */
    const container = containerRef.current
    let resizeTimer: ReturnType<typeof setTimeout>
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(buildWorld, 200)
    })
    if (container) ro.observe(container)

    return () => {
      ro.disconnect()
      clearTimeout(resizeTimer)
      cancelAnimationFrame(rafRef.current)
      if (runnerRef.current) Runner.stop(runnerRef.current)
      if (engineRef.current) Engine.clear(engineRef.current)
    }
  }, [buildWorld])

  /* ── Auto-demo: animated cursor clicks tech names on first scroll ── */
  useEffect(() => {
    if (reducedMotion || !containerRef.current || !cursorRef.current || !rippleRef.current) return

    const section = sectionRef.current
    const cursor = cursorRef.current
    const ripple = rippleRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const sequence: MainTechGroup[] = ['gsap', 'next', 'react', 'gsap']
          const tl = gsap.timeline({ delay: 0.3 })

          /* Fade cursor in at center of section */
          const parentEl = section.querySelector('.relative') as HTMLElement | null
          const parentRect = (parentEl ?? section).getBoundingClientRect()
          gsap.set(cursor, {
            x: parentRect.width / 2,
            y: parentRect.height / 2,
          })
          tl.to(cursor, { opacity: 1, duration: 0.3 })

          sequence.forEach((group) => {
            /* Move cursor to the target tech name */
            tl.add(() => {
              const target = section.querySelector(`[data-tech-group="${group}"]`)
              if (!target) return
              const targetRect = target.getBoundingClientRect()
              const sRect = (parentEl ?? section).getBoundingClientRect()
              const x = targetRect.left - sRect.left + targetRect.width / 2
              const y = targetRect.top - sRect.top + targetRect.height / 2
              gsap.to(cursor, { x, y, duration: 0.5, ease: 'power2.inOut' })
            })
            /* Wait for cursor to arrive */
            tl.add(() => {}, '+=0.55')
            /* Click ripple + trigger toggle */
            tl.add(() => {
              const target = section.querySelector(`[data-tech-group="${group}"]`)
              if (!target) return
              const targetRect = target.getBoundingClientRect()
              const sRect = (parentEl ?? section).getBoundingClientRect()
              const rx = targetRect.left - sRect.left + targetRect.width / 2 - 10
              const ry = targetRect.top - sRect.top + targetRect.height / 2 - 10

              gsap.set(ripple, { x: rx, y: ry, scale: 0.5, opacity: 0.6 })
              gsap.to(ripple, { scale: 2, opacity: 0, duration: 0.4, ease: 'power2.out' })
              gsap.to(cursor, { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 })

              toggleGroupRef.current(group)
            })
            /* Pause between clicks for pills to settle */
            tl.add(() => {}, '+=0.6')
          })

          /* Fade cursor out after demo */
          tl.to(cursor, { opacity: 0, duration: 0.3 })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

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

  /* ── Render ── */
  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className="sticky top-0 min-h-screen"
    >
      <div
        className="relative flex min-h-screen flex-col px-6 py-12"
        style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}
      >
      {/* Eyebrow */}
      <p className="mb-6 font-ui text-sm text-text-muted uppercase tracking-widest">
        Toolbox
      </p>

      {/* ── Tech text list (3 rows, click to toggle) ── */}
      <div ref={textListRef} className="mb-8 space-y-2">
        {TECH_ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex flex-wrap justify-center items-baseline gap-x-4 gap-y-2"
          >
            {row.map((tech) => {
              const isSelected = selectedGroups.has(tech.group)
              return (
                <span
                  key={tech.group}
                  data-tech-word
                  data-tech-group={tech.group}
                  className="cursor-pointer font-heading font-bold select-none"
                  style={{
                    fontSize: ROW_FONT_SIZES[rowIdx],
                    opacity: selectedGroups.size === 0
                      ? ROW_DEFAULT_OPACITIES[rowIdx]
                      : isSelected
                        ? 1
                        : 0.3,
                    color: isSelected
                      ? GROUP_COLORS[tech.group]
                      : 'var(--color-text-muted)',
                    transition: 'opacity 0.3s ease-out, color 0.3s ease-out',
                  }}
                  onClick={() => toggleGroup(tech.group)}
                >
                  {tech.name}
                </span>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Physics playground (starts empty) ── */}
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
          className="relative flex-1 w-full min-h-[50vh] overflow-hidden rounded-2xl border border-border bg-bg-alt"
          style={{ touchAction: isTouchDevice ? 'auto' : 'none' }}
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
                  /* Icon containers get a minimum size so they have real
                     dimensions even before the image has downloaded.
                     Without this, getBoundingClientRect returns ~16×52
                     on slow connections, producing tiny physics bodies. */
                  ...(item.type === 'icon' ? { minWidth: 56, minHeight: 40 } : {}),
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

      {/* Demo cursor — animated on first scroll into view */}
      {!reducedMotion && (
        <>
          <svg
            ref={cursorRef}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-0 top-0"
            style={{ opacity: 0 }}
          >
            {isTouchDevice ? (
              /* Hand with index finger — tap gesture */
              <g fill="white" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 5.5a2 2 0 1 1 4 0V12" />
                <path d="M14 12v-1.5a2 2 0 1 1 4 0V17a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6v-3.5a2 2 0 1 1 4 0V12" />
                <path d="M10 12V5.5" />
              </g>
            ) : (
              /* Mouse pointer arrow */
              <path
                d="M5 3l14 8-6 2-2 6z"
                fill="white"
                stroke="#1a1a1a"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            )}
          </svg>
          <span
            ref={rippleRef}
            className="pointer-events-none absolute left-0 top-0 rounded-full"
            style={{ width: 20, height: 20, opacity: 0, backgroundColor: 'var(--color-accent)' }}
          />
        </>
      )}
      </div>
    </section>
  )
}
