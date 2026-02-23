'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const words = ['This', 'is', 'my', 'journey.']

export default function JourneyIntroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const wordEls = sectionRef.current?.querySelectorAll<HTMLElement>('[data-word]')
    if (!wordEls || wordEls.length === 0) return

    // Each word fades + slides in as it enters the viewport scrubbed by scroll
    gsap.fromTo(
      wordEls,
      { opacity: 0.15, y: 24 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'center 40%',
          scrub: 0.8,
        },
      }
    )
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]"
    >
      <p
        className="font-heading font-bold text-text leading-tight"
        style={{ fontSize: 'var(--text-display)' }}
        aria-label="This is my journey."
      >
        {words.map((word, i) => (
          <span
            key={i}
            data-word
            className="mr-[0.3em] inline-block"
            aria-hidden="true"
          >
            {word}
          </span>
        ))}
      </p>
    </section>
  )
}
