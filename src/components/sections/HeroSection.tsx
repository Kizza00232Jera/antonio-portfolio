'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useCarouselState } from '@/components/ui/useCarouselState'

/* ── Data ─────────────────────────────────────────── */

const TECH_ITEMS = [
  'React', 'Next.js', 'TypeScript', 'TailwindCSS',
  'GSAP', 'Node.js', 'Vercel', 'Supabase', 'Sanity', 'Figma',
]

const ROLES = ['/ WEB DEVELOPMENT', '/ WEB DESIGN', '/ CREATIVE TECHNOLOGY']

const ABOUT = 'Half designer, half developer — full attention to detail. Five years across three countries learning how research becomes a system, a system becomes a product, and a product becomes something you actually want to use. Now exploring XR and creative code at Stockholm University.'

/* ── Fibonacci sphere positions (unit sphere) ─────── */

const N = TECH_ITEMS.length
const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2

const BASE_POSITIONS = Array.from({ length: N }, (_, i) => {
  const theta = Math.acos(1 - (2 * (i + 0.5)) / N)
  const phi = 2 * Math.PI * i / GOLDEN_RATIO
  return {
    x: Math.sin(theta) * Math.cos(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(theta),
  }
})

/* ── Component ────────────────────────────────────── */

export default function HeroSection() {
  const { activePanel, goToPanel } = useCarouselState(2)
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  // Desktop ball
  const ballContainerRef = useRef<HTMLDivElement>(null)
  const ballItemRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Mobile ball (separate DOM element, same RAF values)
  const mobileBallContainerRef = useRef<HTMLDivElement>(null)
  const mobileBallItemRefs = useRef<(HTMLSpanElement | null)[]>([])

  const rafIdRef = useRef(0)
  const radiusRef = useRef(0)
  const rotYRef = useRef(0)
  const rotXRef = useRef(0)
  const speedRef = useRef(0.007)
  const targetSpeedRef = useRef(0.007)
  const isDraggingRef = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0 })
  const isMobilePausedRef = useRef(false)
  const touchMovedRef = useRef(false)
  const touchStartPosRef = useRef({ x: 0, y: 0 })

  /* ── Entrance animations ──────────────────────────────────────────── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.from('.hero-title-svg', {
          yPercent: 105,
          duration: 1.5,
          ease: 'power4.out',
          delay: 0.1,
        })
      }
      gsap.from('.hero-main .hero-eyebrow', {
        opacity: 0, y: 8, duration: 0.7, ease: 'power3.out', stagger: 0.15, delay: 0.55,
      })
      gsap.from('.hero-main .hero-role', {
        opacity: 0, x: -10, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.7,
      })
      gsap.from('.hero-main .hero-about', {
        opacity: 0, y: 10, duration: 0.8, ease: 'power3.out', delay: 0.8,
      })
    })

    return () => ctx.revert()
  }, [])

  /* ── Ball rAF spin — updates both desktop and mobile item refs ─── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    radiusRef.current = window.innerWidth < 768 ? 110 : 160
    const FOCAL = 380

    function animate() {
      speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.05

      if (!isDraggingRef.current && !isMobilePausedRef.current) {
        rotYRef.current += speedRef.current
      }

      const cosX = Math.cos(rotXRef.current)
      const sinX = Math.sin(rotXRef.current)
      const cosY = Math.cos(rotYRef.current)
      const sinY = Math.sin(rotYRef.current)
      const R = radiusRef.current

      BASE_POSITIONS.forEach((pos, i) => {
        const rx = pos.x * cosY - pos.z * sinY
        const ry = pos.y
        const rz = pos.x * sinY + pos.z * cosY

        const finalX = rx
        const finalY = ry * cosX - rz * sinX
        const finalZ = ry * sinX + rz * cosX

        const scale = FOCAL / (FOCAL + finalZ * R)
        const sx = finalX * R * scale
        const sy = finalY * R * scale
        const depth = (finalZ + 1) / 2

        const transform = `translate(-50%, -50%) translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`
        const opacity = (0.2 + depth * 0.8).toFixed(3)
        const fontSize = `${(0.65 + depth * 0.45).toFixed(3)}rem`
        const zIndex = String(Math.round(depth * 100))

        const el = ballItemRefs.current[i]
        if (el) {
          el.style.transform = transform
          el.style.opacity = opacity
          el.style.fontSize = fontSize
          el.style.zIndex = zIndex
        }

        const mEl = mobileBallItemRefs.current[i]
        if (mEl) {
          mEl.style.transform = transform
          mEl.style.opacity = opacity
          mEl.style.fontSize = fontSize
          mEl.style.zIndex = zIndex
        }
      })

      rafIdRef.current = requestAnimationFrame(animate)
    }

    rafIdRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafIdRef.current)
  }, [])

  /* ── Recompute orbit radius on resize ────────── */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        radiusRef.current = window.innerWidth < 768 ? 110 : 160
      }, 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  /* ── Desktop globe interaction (hover + drag) ─────────────────── */
  useEffect(() => {
    const container = ballContainerRef.current
    if (!container) return

    const onEnter = () => { targetSpeedRef.current = 0.001 }
    const onLeave = () => {
      targetSpeedRef.current = 0.007
      isDraggingRef.current = false
      container.classList.remove('is-dragging')
    }
    const onDown = (e: MouseEvent) => {
      isDraggingRef.current = true
      container.classList.add('is-dragging')
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const dx = e.clientX - lastPointerRef.current.x
      const dy = e.clientY - lastPointerRef.current.y
      rotYRef.current += dx * 0.008
      rotXRef.current += dy * 0.008
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => {
      isDraggingRef.current = false
      container.classList.remove('is-dragging')
    }

    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)
    container.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    return () => {
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      container.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  /* ── Mobile globe interaction (drag + tap-to-pause) ───────────── */
  useEffect(() => {
    const container = mobileBallContainerRef.current
    if (!container) return

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      isDraggingRef.current = true
      lastPointerRef.current = { x: t.clientX, y: t.clientY }
      touchStartPosRef.current = { x: t.clientX, y: t.clientY }
      touchMovedRef.current = false
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return
      e.preventDefault()
      const t = e.touches[0]
      const dx = t.clientX - lastPointerRef.current.x
      const dy = t.clientY - lastPointerRef.current.y
      const totalDx = t.clientX - touchStartPosRef.current.x
      const totalDy = t.clientY - touchStartPosRef.current.y
      if (Math.abs(totalDx) > 6 || Math.abs(totalDy) > 6) touchMovedRef.current = true
      rotYRef.current += dx * 0.008
      rotXRef.current += dy * 0.008
      lastPointerRef.current = { x: t.clientX, y: t.clientY }
    }
    const onTouchEnd = () => {
      isDraggingRef.current = false
      if (!touchMovedRef.current) {
        // Tap — toggle pause
        isMobilePausedRef.current = !isMobilePausedRef.current
      }
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('touchend', onTouchEnd)

    return () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  /* ── Render ───────────────────────────────────── */

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className="hero-section"
    >
      <div className="hero-body">

        {/* ── Main: left-text | globe | right-text (desktop) ─ */}
        <div className="hero-main">
          <div className="hero-intro-left">
            <span className="hero-eyebrow">/ 01 — ROLES</span>
            <div className="hero-roles">
              {ROLES.map((r) => (
                <span key={r} className="hero-role">{r}</span>
              ))}
            </div>
          </div>

          <div className="hero-globe-wrap">
            <div ref={ballContainerRef} className="hero-ball">
              {TECH_ITEMS.map((item, i) => (
                <span
                  key={item}
                  ref={el => { ballItemRefs.current[i] = el }}
                  className="hero-ball-item"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-intro-right">
            <span className="hero-eyebrow">/ 02 — ABOUT ME</span>
            <p className="hero-about">{ABOUT}</p>
          </div>
        </div>

        {/* ── Mobile: carousel panels ─────────────── */}
        <div className="hero-mobile-carousel">
          <div className={`hero-carousel-panel${activePanel === 0 ? ' is-active' : ''}`}>
            <span className="hero-eyebrow">/ 02 — ABOUT ME</span>
            <p className="hero-about">{ABOUT}</p>
          </div>
          <div className={`hero-carousel-panel${activePanel === 1 ? ' is-active' : ''}`}>
            <span className="hero-eyebrow">/ 01 — ROLES</span>
            <div className="hero-roles">
              {ROLES.map((r) => (
                <span key={r} className="hero-role">{r}</span>
              ))}
            </div>
          </div>
          <div className="hero-carousel-dots">
            {[0, 1].map((i) => (
              <button
                key={i}
                className={`hero-carousel-dot${activePanel === i ? ' is-active' : ''}`}
                onClick={() => goToPanel(i)}
                aria-label={`Panel ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── Mobile globe — centered, tap to pause ─ */}
        <div className="hero-mobile-globe" aria-label="Interactive tech sphere, tap to pause">
          <div ref={mobileBallContainerRef} className="hero-ball">
            {TECH_ITEMS.map((item, i) => (
              <span
                key={`m-${item}`}
                ref={el => { mobileBallItemRefs.current[i] = el }}
                className="hero-ball-item"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── Wordmark ─────────────────────────────── */}
        <div ref={titleRef} className="hero-title" aria-label="ANTONIO JERKOVIC">
          <svg viewBox="0 0 1000 180" className="hero-title-svg" aria-hidden>
            <text
              x="500"
              y="158"
              fontSize={200}
              textAnchor="middle"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              className="hero-title-text"
            >
              ANTONIO JERKOVIC
            </text>
          </svg>
        </div>

      </div>
    </section>
  )
}
