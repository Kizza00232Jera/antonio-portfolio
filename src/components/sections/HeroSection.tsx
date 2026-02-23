'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

gsap.registerPlugin()

const lines = [
  'Hi, I\'m Antonio.',
  'Designer turned',
  'developer.',
]

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)
  const metaRef = useRef<HTMLParagraphElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const scrollCueRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lineEls = containerRef.current?.querySelectorAll<HTMLElement>('[data-line]')
    if (!lineEls) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Slide each line up from behind its mask
    tl.fromTo(
      lineEls,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.9, stagger: 0.12 }
    )
    // Fade in meta + subtext after heading
    .fromTo(
      [metaRef.current, subtextRef.current],
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
      '-=0.4'
    )
    // Fade in scroll cue
    .fromTo(
      scrollCueRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      '-=0.2'
    )
  }, { scope: containerRef })

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col justify-center bg-[#0a0a0a] px-6"
    >
      <div className="mx-auto w-full max-w-[var(--max-width)]">
        {/* Role label */}
        <p
          ref={metaRef}
          className="mb-6 font-mono text-xs text-white/40 uppercase tracking-widest opacity-0"
        >
          Designer &amp; Web Developer
        </p>

        {/* Heading — each line masked so it slides up from behind */}
        <h1
          className="font-heading font-bold text-white"
          style={{ fontSize: 'var(--text-hero)', lineHeight: 1.05 }}
        >
          {lines.map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <span data-line className="block">
                {line}
              </span>
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <p
          ref={subtextRef}
          className="mt-8 max-w-md font-body text-white/50 opacity-0"
          style={{ fontSize: 'var(--text-body)', lineHeight: 1.7 }}
        >
          From Croatia to Denmark to Sweden — building fast, accessible,
          and a little bit delightful interfaces.
        </p>
      </div>

      {/* Scroll cue */}
      <div
        ref={scrollCueRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
          Scroll
        </span>
        <div className="h-10 w-px bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  )
}
