'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface SectionTitleProps {
  title: string
  theme: 'light' | 'dark'
}

export default function SectionTitle({ title, theme }: SectionTitleProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  const bg = theme === 'light' ? '#fafaf8' : '#0d0d0d'
  const color = theme === 'light' ? '#111111' : '#f7f7f7'

  // Split title into words → letters
  const words = title.split(' ')

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const letters = section.querySelectorAll<HTMLElement>('.st-letter')

    const ctx = gsap.context(() => {
      gsap.fromTo(
        letters,
        { y: '-120%' },
        {
          y: '0%',
          duration: 1,
          ease: 'power3.out',
          stagger: { each: 0.04, from: 'center' },
          scrollTrigger: {
            trigger: section,
            start: 'top 100%',
            end: 'bottom 30%',
            scrub: 1,
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={sectionRef}
      data-theme={theme}
      style={{
        backgroundColor: bg,
        paddingBlock: 'clamp(3rem, 5vw, 5rem)',
        paddingInline: 'clamp(1rem, 3vw, 3rem)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display-alt)',
          fontSize: 'clamp(5rem, 13vw, 17rem)',
          lineHeight: 0.9,
          letterSpacing: '-0.04em',
          color,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 0.18em',
        }}
      >
        {words.map((word, wi) => (
          <span
            key={wi}
            style={{ display: 'inline-flex', overflow: 'hidden' }}
          >
            {word.split('').map((char, ci) => (
              <span
                key={ci}
                className="st-letter"
                style={{ display: 'inline-block', willChange: 'transform' }}
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      </h2>
    </div>
  )
}
