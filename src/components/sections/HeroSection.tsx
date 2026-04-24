'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ── Data ─────────────────────────────────────────── */

const TECH_ITEMS = [
  'React', 'Next.js', 'TypeScript', 'TailwindCSS',
  'GSAP', 'Node.js', 'Vercel', 'Supabase', 'Sanity', 'Figma',
]

const SENTENCE_WORDS = ['Hi,', "I'm", 'Antonio', '—', 'a', 'Creative', 'Frontend', 'Developer.']

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
  const wrapperRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const photoMainRef = useRef<HTMLDivElement>(null)
  const photoShadeRef = useRef<HTMLDivElement>(null)
  const ballContainerRef = useRef<HTMLDivElement>(null)
  const ballItemRefs = useRef<(HTMLSpanElement | null)[]>([])
  const sentenceWordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const rafIdRef = useRef(0)
  const rotYRef = useRef(0)
  const isTransitioningRef = useRef(false)
  const startTransitionRef = useRef<(() => void) | undefined>(undefined)
  const resetTransitionRef = useRef<(() => void) | undefined>(undefined)

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

        // Photo shade: fade in
        if (photoShadeRef.current) {
          gsap.from(photoShadeRef.current, {
            opacity: 0,
            duration: 1.8,
            ease: 'power3.out',
            delay: 0.9,
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
      if (isTransitioningRef.current) return

      rotYRef.current += 0.007
      const cosY = Math.cos(rotYRef.current)
      const sinY = Math.sin(rotYRef.current)

      BASE_POSITIONS.forEach((pos, i) => {
        const el = ballItemRefs.current[i]
        if (!el) return

        // Rotate around Y axis
        const rx = pos.x * cosY - pos.z * sinY
        const ry = pos.y
        const rz = pos.x * sinY + pos.z * cosY

        // Project to screen
        const scale = FOCAL / (FOCAL + rz * RADIUS)
        const sx = rx * RADIUS * scale
        const sy = ry * RADIUS * scale
        const depth = (rz + 1) / 2 // 0 = back, 1 = front

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

  /* ── Transition functions ─────────────────────── */
  // Update refs on every render so closures in effects always get latest
  startTransitionRef.current = () => {
    if (isTransitioningRef.current) return
    isTransitioningRef.current = true
    cancelAnimationFrame(rafIdRef.current)

    ballItemRefs.current.forEach((el, i) => {
      if (!el) return
      const itemRect = el.getBoundingClientRect()

      if (i < SENTENCE_WORDS.length) {
        const targetEl = sentenceWordRefs.current[i]
        if (!targetEl) return
        const targetRect = targetEl.getBoundingClientRect()
        const dx = targetRect.left + targetRect.width / 2 - (itemRect.left + itemRect.width / 2)
        const dy = targetRect.top + targetRect.height / 2 - (itemRect.top + itemRect.height / 2)
        gsap.to(el, {
          x: `+=${dx}`,
          y: `+=${dy}`,
          opacity: 0,
          scale: 0.7,
          duration: 1.0,
          ease: 'power3.in',
          delay: i * 0.07,
        })
      } else {
        // Extra items fly off downward
        gsap.to(el, {
          y: '+=180',
          opacity: 0,
          duration: 0.8,
          ease: 'power3.in',
          delay: i * 0.05,
        })
      }
    })

    // Reveal sentence words with stagger
    sentenceWordRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.fromTo(
        el,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.55 + i * 0.1 },
      )
    })
  }

  resetTransitionRef.current = () => {
    if (!isTransitioningRef.current) return

    gsap.killTweensOf(ballItemRefs.current.filter(Boolean))
    gsap.killTweensOf(sentenceWordRefs.current.filter(Boolean))

    // Fade sentence words out
    sentenceWordRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.to(el, {
        opacity: 0,
        y: 12,
        duration: 0.35,
        ease: 'power2.in',
        delay: i * 0.04,
      })
    })

    // Animate ball items back to center — same motion as scatter, reversed
    const itemCount = ballItemRefs.current.filter(Boolean).length
    let doneCount = 0

    ballItemRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.to(el, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        delay: i * 0.05,
        onComplete: () => {
          doneCount++
          if (doneCount < itemCount) return

          // All items converged — clear GSAP props and restart rAF
          ballItemRefs.current.forEach(item => {
            if (item) gsap.set(item, { clearProps: 'x,y,scale,opacity' })
          })

          isTransitioningRef.current = false

          const RADIUS = window.innerWidth < 768 ? 120 : 185
          const FOCAL = 380
          const startRaf = () => {
            if (!isTransitioningRef.current) {
              rotYRef.current += 0.007
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
              rafIdRef.current = requestAnimationFrame(startRaf)
            }
          }
          rafIdRef.current = requestAnimationFrame(startRaf)
        },
      })
    })
  }

  /* ── ScrollTrigger: ball → sentence ──────────── */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          if (self.progress > 0.35 && !isTransitioningRef.current) {
            startTransitionRef.current?.()
          }
          if (self.progress < 0.1 && isTransitioningRef.current) {
            resetTransitionRef.current?.()
          }
        },
      })
    })

    return () => ctx.revert()
  }, [])

  /* ── Render ───────────────────────────────────── */

  const titleWords = ['ANTONIO', 'JERKOVIC']

  return (
    <div ref={wrapperRef} className="hero-wrapper">
      <section
        ref={sectionRef}
        data-theme="dark"
        className="hero-section"
      >
        <div className="hero-body">
          {/* ── Title — single row, fluid size ─ */}
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
            {/* LEFT: portrait stack (photo + descriptor panel) */}
            <div className="hero-left">
              <div className="hero-portrait-stack">
                <div ref={photoShadeRef} className="hero-photo-shade" aria-hidden>
                  <Image
                    src="/images/hero-portrait.jpeg"
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 50vw, 400px"
                  />
                </div>
                <div ref={photoMainRef} className="hero-photo-main">
                  <Image
                    src="/images/hero-portrait.jpeg"
                    alt="Antonio Jerkovic"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 50vw, 400px"
                    priority
                  />
                </div>
                {/* Dark panel — to the right of photo, descriptors overlaid */}
                <div className="hero-descriptor-panel">
                  {DESCRIPTORS.map((d) => (
                    <span key={d} className="hero-descriptor">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: spinning ball + sentence */}
            <div className="hero-right">
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

              {/* Sentence: initially hidden, revealed on scroll */}
              <div className="hero-sentence" aria-live="polite">
                {SENTENCE_WORDS.map((word, i) => (
                  <span
                    key={i}
                    ref={el => { sentenceWordRefs.current[i] = el }}
                    className="hero-sentence-word"
                    style={{ opacity: 0 }}
                  >
                    {word}
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
