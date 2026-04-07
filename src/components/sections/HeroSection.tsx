'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

/* ── Data ─────────────────────────────────────────── */

const TECH_ITEMS = [
  'React', 'Next.js', 'TypeScript', 'TailwindCSS',
  'GSAP', 'Node.js', 'Vercel', 'Supabase', 'Sanity', 'Figma',
]

const DESCRIPTORS = ['/ ART DIRECTION', '/ WEB DESIGN', '/ WEB DEVELOPMENT']

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
  const titleRef = useRef<HTMLDivElement>(null)
  const photoMainRef = useRef<HTMLDivElement>(null)
  const ballItemRefs = useRef<(HTMLSpanElement | null)[]>([])
  const rafIdRef = useRef(0)
  const rotYRef = useRef(0)

  /* ── Entrance animations ──────────────────────── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (!prefersReduced) {
        // Title: letters cascade from y: -110%
        const chars = titleRef.current?.querySelectorAll<HTMLElement>('.hero-char')
        if (chars?.length) {
          gsap.from(chars, {
            y: '-110%',
            duration: 1.7,
            ease: 'power4.inOut',
            stagger: { each: 0.03, from: 'center' },
            delay: 0.15,
          })
        }

        // Photo main: clip-path wipe from top
        if (photoMainRef.current) {
          gsap.from(photoMainRef.current, {
            clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
            duration: 2.2,
            ease: 'power4.out',
            delay: 0.5,
          })
        }

        // Descriptors: slide in from left
        const descriptors = document.querySelectorAll<HTMLElement>('.hero-descriptor')
        if (descriptors.length) {
          gsap.from(descriptors, {
            opacity: 0,
            x: -16,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.12,
            delay: 1.3,
          })
        }
      }
    })

    return () => ctx.revert()
  }, [])

  /* ── Ball rAF spin ────────────────────────────── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const RADIUS = window.innerWidth < 768 ? 120 : 185
    const FOCAL = 380

    function animate() {
      rotYRef.current += 0.003

      const cosY = Math.cos(rotYRef.current)
      const sinY = Math.sin(rotYRef.current)

      BASE_POSITIONS.forEach((pos, i) => {
        const el = ballItemRefs.current[i]
        if (!el) return

        const rx = pos.x * cosY - pos.z * sinY
        const ry = pos.y
        const rz = pos.x * sinY + pos.z * cosY

        const scale = FOCAL / (FOCAL + rz * RADIUS)
        const sx = rx * RADIUS * scale
        const sy = ry * RADIUS * scale
        const depth = (rz + 1) / 2

        el.style.transform = `translate(-50%, -50%) translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`
        el.style.opacity = (0.2 + depth * 0.8).toFixed(3)
        el.style.fontSize = `${(0.65 + depth * 0.45).toFixed(3)}rem`
        el.style.zIndex = String(Math.round(depth * 100))
      })

      rafIdRef.current = requestAnimationFrame(animate)
    }

    rafIdRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafIdRef.current)
  }, [])

  /* ── Render ───────────────────────────────────── */

  const titleWords = ['ANTONIO', 'JERKOVIC']

  return (
    <div className="hero-wrapper">
      <section
        data-theme="dark"
        className="hero-section"
      >
        <div className="hero-body">
          {/* ── Title ─ */}
          <div ref={titleRef} className="hero-title" aria-label="ANTONIO JERKOVIC">
            <div className="hero-title-line">
              {titleWords.map((word, wi) => (
                <span key={wi} className="hero-title-word-group">
                  {word.split('').map((char, ci) => (
                    <span key={ci} className="hero-char-clip">
                      <span className="hero-char">{char}</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          {/* ── Columns ────────────────────────── */}
          <div className="hero-columns">
            {/* LEFT: portrait + descriptors */}
            <div className="hero-left">
              <div className="hero-portrait-stack">
                <div ref={photoMainRef} className="hero-photo-main">
                  {/* Placeholder — swap for a real square photo when ready */}
                  <div className="hero-photo-placeholder" aria-hidden />
                </div>

                <div className="hero-descriptor-panel">
                  {DESCRIPTORS.map((d) => (
                    <span key={d} className="hero-descriptor">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: spinning ball */}
            <div className="hero-right">
              <div className="hero-ball">
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
          </div>
        </div>
      </section>
    </div>
  )
}
