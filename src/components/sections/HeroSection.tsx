'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'

/* ── Data ─────────────────────────────────────────── */

const SUB = 'Web Development · Web Design · Creative Technology'

/* ── Copenhagen live clock ─────────────────────────── */

function HeroClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString('en-GB', {
          timeZone: 'Europe/Copenhagen',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="hero-corner hero-clock">
      COPENHAGEN&thinsp;·&thinsp;{time || '··:··:··'}
    </span>
  )
}

/* ── Component ────────────────────────────────────── */

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* ── Creative Field — retina-correct dot grid that reacts to the cursor ── */
  useEffect(() => {
    const hero = heroRef.current
    const canvas = canvasRef.current
    if (!hero || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const GAP = 38 // spacing between dots (CSS px)
    const RADIUS = 160 // cursor influence radius
    const PUSH = 28 // max displacement
    const EASE = 0.18 // return-to-home easing

    type Dot = { x: number; y: number; ox: number; oy: number }
    let W = 0
    let H = 0
    let dots: Dot[] = []
    let raf = 0
    const mouse = { x: -9999, y: -9999 }

    function build() {
      const rect = hero!.getBoundingClientRect()
      W = rect.width
      H = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(W * dpr)
      canvas!.height = Math.round(H * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      dots = []
      for (let y = GAP; y < H; y += GAP) {
        for (let x = GAP; x < W; x += GAP) {
          dots.push({ x, y, ox: x, oy: y })
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H)
      for (const d of dots) {
        const dx = d.x - mouse.x
        const dy = d.y - mouse.y
        const dist = Math.hypot(dx, dy)
        let tx = d.ox
        let ty = d.oy
        let size = 1.5
        let alpha = 0.32
        if (dist < RADIUS) {
          const f = 1 - dist / RADIUS
          const ang = Math.atan2(dy, dx)
          tx = d.ox + Math.cos(ang) * PUSH * f
          ty = d.oy + Math.sin(ang) * PUSH * f
          size = 1.5 + f * 3.8
          alpha = 0.32 + f * 0.68
        }
        d.x += (tx - d.x) * EASE
        d.y += (ty - d.y) * EASE
        ctx!.beginPath()
        ctx!.arc(d.x, d.y, size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(247,247,247,${alpha})`
        ctx!.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    function staticDraw() {
      ctx!.clearRect(0, 0, W, H)
      for (const d of dots) {
        ctx!.beginPath()
        ctx!.arc(d.ox, d.oy, 1.5, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(247,247,247,0.32)'
        ctx!.fill()
      }
    }

    function onMove(e: PointerEvent) {
      // touch is for scrolling, not for stirring the field
      if (e.pointerType === 'touch') return
      const rect = canvas!.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    function onLeave() {
      mouse.x = -9999
      mouse.y = -9999
    }

    build()
    if (reduce) {
      staticDraw()
    } else {
      hero.addEventListener('pointermove', onMove)
      hero.addEventListener('pointerleave', onLeave)
      raf = requestAnimationFrame(draw)
    }

    let resizeTimer: ReturnType<typeof setTimeout>
    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        build()
        if (reduce) staticDraw()
      }, 150)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  /* ── Entrance animation ──────────────────────────── */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // NOTE: the hero headline (the LCP element) is intentionally NOT animated
      // by GSAP. GSAP runs only after hydration (~6s on slow mobile), and a
      // from({opacity:0}) would hide the largest element until then, wrecking
      // LCP. Its entrance is a CSS-only transform rise (see .hero-name span in
      // globals.css) that keeps it fully visible from first paint.
      gsap.from('.hero-sub', {
        opacity: 0,
        y: 10,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.6,
      })
      gsap.from('.hero-corner', {
        opacity: 0,
        y: 6,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.95,
      })
    })

    return () => ctx.revert()
  }, [])

  /* ── Render ───────────────────────────────────── */

  return (
    <section ref={heroRef} data-theme="dark" className="hero-section">
      <canvas ref={canvasRef} className="hero-field" aria-hidden />

      <div className="hero-center">
        <h1 className="hero-name" aria-label="Antonio Jerković">
          {/* Crawlable, correctly-spelled name for SEO; the spans below are the
              stylized visual. sr-only keeps it out of the visual layout. */}
          <span className="sr-only">Antonio Jerković</span>
          <span aria-hidden>ANTONIO</span>
          <span aria-hidden>JERKOVIC</span>
        </h1>
        <div className="hero-sub">{SUB}</div>
        {/* Crawlable prose for search engines. The visible hero is built from
            decorative fragments (ANTONIO / JERKOVIC / OPEN FOR WORK), which
            Google was stitching into a jumbled snippet. This sr-only sentence
            gives crawlers one clean, complete sentence to read instead, so the
            page's own text reinforces the meta description rather than fighting
            it. Hidden from the visual layout; read by crawlers and screen readers. */}
        <p className="sr-only">
          Antonio Jerković is a web developer and designer based in Copenhagen,
          Denmark, working across web development, web design and creative
          technology. Available for work.
        </p>
      </div>

      <div className="hero-corners">
        <span className="hero-corner hero-status">
          <span className="hero-status-dot" aria-hidden />
          OPEN FOR WORK
        </span>
        <HeroClock />
      </div>
    </section>
  )
}
