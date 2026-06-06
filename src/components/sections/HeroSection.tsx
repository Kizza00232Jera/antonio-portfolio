'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useCarouselState } from '@/components/ui/useCarouselState'

/* ── Data ─────────────────────────────────────────── */

const ROLES = ['/ WEB DEVELOPMENT', '/ WEB DESIGN', '/ CREATIVE TECHNOLOGY']

const ABOUT = 'Half designer, half developer — full attention to detail. Five years across three countries learning how research becomes a system, a system becomes a product, and a product becomes something you actually want to use. Now exploring XR and creative code at Stockholm University.'

/* ── Component ────────────────────────────────────── */

export default function HeroSection() {
  const { activePanel, goToPanel } = useCarouselState(2)
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

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

  /* ── Render ───────────────────────────────────── */

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className="hero-section"
    >
      <div className="hero-body">

        {/* ── Main: left-text | right-text (desktop) ─ */}
        <div className="hero-main">
          <div className="hero-intro-left">
            <span className="hero-eyebrow">/ 01 — ROLES</span>
            <div className="hero-roles">
              {ROLES.map((r) => (
                <span key={r} className="hero-role">{r}</span>
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
