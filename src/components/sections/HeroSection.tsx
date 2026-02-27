'use client'

import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

// Cycling phrases for the typewriter — matches Edwin's format
const PHRASES = ['Designer.', 'Developer.', 'tech enthusiast.']

const TYPE_SPEED = 80    // ms per char when typing
const DELETE_SPEED = 50  // ms per char when deleting
const PAUSE_AFTER = 1800 // ms to hold after fully typed
const PAUSE_BETWEEN = 300 // ms pause between phrases

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)

  // True once the preloader has exited (or on repeat visits)
  const [ready, setReady] = useState(false)

  // Typewriter state
  const [typeText, setTypeText] = useState('')
  const [cursorOn, setCursorOn] = useState(true)

  // If preloader already ran (e.g. navigating back to home), show immediately.
  // Otherwise wait for the preloader:done event (first homepage load).
  useEffect(() => {
    if (window.__preloaderDone) {
      setReady(true)
      return
    }
    const handle = () => setReady(true)
    window.addEventListener('preloader:done', handle)
    return () => window.removeEventListener('preloader:done', handle)
  }, [])

  // GSAP entry animation — fires once when ready
  useGSAP(
    () => {
      if (!ready) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const line1 = containerRef.current?.querySelector<HTMLElement>('[data-line1]')
      const line2 = containerRef.current?.querySelector<HTMLElement>('[data-line2]')
      const para = containerRef.current?.querySelector<HTMLElement>('[data-para]')
      const cue = containerRef.current?.querySelector<HTMLElement>('[data-cue]')

      // All three content elements animate in simultaneously at t=0
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.85 } })

      // Line 1: same fade + slide as the others
      if (line1) tl.fromTo(line1, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 0)
      // Line 2: fade + slide — starts at same time as line 1
      if (line2) tl.fromTo(line2, { opacity: 0, y: 14 }, { opacity: 1, y: 0 }, 0)
      // Paragraph: fade + slight slide — same time
      if (para) tl.fromTo(para, { opacity: 0, y: 10 }, { opacity: 1, y: 0 }, 0)
      // Scroll cue fades after content is visible
      if (cue) tl.fromTo(cue, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.6)
    },
    { scope: containerRef, dependencies: [ready] },
  )

  // Typewriter cycling — starts when ready
  useEffect(() => {
    if (!ready) return

    // Reduced motion: just show first phrase statically
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypeText(PHRASES[0])
      return
    }

    let phraseIdx = 0
    let cancelled = false

    const blinkInterval = setInterval(() => setCursorOn((v) => !v), 530)

    async function cycle() {
      // All lines animate in together at 0.85s — wait just past that before typing
      await wait(950)
      if (cancelled) return

      while (!cancelled) {
        const phrase = PHRASES[phraseIdx % PHRASES.length]

        // Type out
        for (let i = 1; i <= phrase.length; i++) {
          if (cancelled) return
          setTypeText(phrase.slice(0, i))
          await wait(TYPE_SPEED)
        }

        // Hold
        await wait(PAUSE_AFTER)
        if (cancelled) return

        // Delete
        for (let i = phrase.length - 1; i >= 0; i--) {
          if (cancelled) return
          setTypeText(phrase.slice(0, i))
          await wait(DELETE_SPEED)
        }

        await wait(PAUSE_BETWEEN)
        phraseIdx++
      }
    }

    cycle()

    return () => {
      cancelled = true
      clearInterval(blinkInterval)
    }
  }, [ready])

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col justify-center px-6"
      style={{
        backgroundColor: '#e8e2da',
        backgroundImage: [
          "url('https://wa63s80c7y.ufs.sh/f/xvkaIoB9LXPW4oPrLhFuDBzPlk6wKJgc9N4mGELOVpvRIro8')",
          "url('https://wa63s80c7y.ufs.sh/f/xvkaIoB9LXPWEuBM22ZsCl3YyLdkMHmvaW5ZXURTjtq2VFfu')",
        ].join(', '),
        backgroundSize: 'auto, cover',
        backgroundRepeat: 'repeat, no-repeat',
        backgroundPosition: '0 0, center',
      }}
    >
      <div className="mx-auto w-full max-w-[var(--max-width)]">

        {/* Line 1 — "Sup, I'm Antonio." */}
        <h1
          data-line1
          className="font-heading font-bold text-text opacity-0 text-[length:var(--text-hero)] leading-[1.05]"
        >
          Sup, I&apos;m Antonio.
        </h1>

        {/* Line 2 — flex-wrap keeps "I'm a Designer." on one line on desktop,
            wraps the typewriter to its own line on mobile when it doesn't fit */}
        <p
          data-line2
          className="flex flex-wrap items-baseline font-heading font-bold text-text opacity-0 text-[length:var(--text-hero)] leading-[1.05]"
        >
          <span>I&apos;m a&nbsp;</span>
          <span className="whitespace-nowrap text-accent">
            {typeText}
            {/* Blinking cursor */}
            <span
              className="relative inline-block bg-accent align-middle"
              style={{
                width: '2px',
                height: '0.82em',
                marginLeft: '3px',
                top: '-0.05em',
                opacity: cursorOn ? 1 : 0,
                transition: 'opacity 0.08s',
              }}
            />
          </span>
        </p>

        {/* Body paragraph */}
        <p
          data-para
          className="mt-8 max-w-md font-body text-text-muted opacity-0 text-[length:var(--text-body)] leading-[1.7]"
        >
          Passionately building web experiences rooted in design, grounded in code — from Croatia to the world.
        </p>
      </div>

      {/* Scroll cue */}
      <div
        data-cue
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
        aria-hidden="true"
      >
        <span className="font-ui text-[0.625rem] text-text-muted/50 uppercase tracking-widest">Scroll</span>
        <div className="h-10 w-px bg-gradient-to-b from-text-muted/30 to-transparent" />
      </div>
    </section>
  )
}
