'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LETTERS = 'Things I\'ve built.'.split('')

export default function ProjectsIntroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!sectionRef.current) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReduced) return

    const els = lettersRef.current.filter(Boolean)
    const ctx = gsap.context(() => {
      gsap.fromTo(els, { opacity: 0, y: 20 }, {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        duration: 0.5,
        stagger: 0.03,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef.current)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} data-theme="dark" className="sticky top-0 min-h-screen px-6 py-24 md:py-32">
      <h2
        className="text-center font-heading font-bold leading-[1.1] text-text"
        style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)' }}
      >
        {LETTERS.map((char, i) => (
          <span
            key={i}
            ref={(el) => { lettersRef.current[i] = el }}
            className="inline-block will-change-transform"
            style={char === ' ' ? { width: '0.3em' } : undefined}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h2>
    </section>
  )
}
