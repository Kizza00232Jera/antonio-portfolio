'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const wordGroups = ['This', 'is my', 'journey.']

export default function JourneyIntroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const paragraph = paragraphRef.current
    if (!section || !paragraph) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // ── Mobile ─────────────────────────────────────────────
      mm.add('(max-width: 768px)', () => {
        const word2 = wordRefs.current[1]
        const word3 = wordRefs.current[2]
        if (!word2 || !word3) return

        // Spread: each word pushed down by 15vh more than the previous
        // Paragraph has same offset as word 3 — constant gap maintained
        gsap.set(word2, { y: '15vh' })
        gsap.set(word3, { y: '30vh' })
        gsap.set(paragraph, { y: '30vh' })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        })

        // PHASE 1 (0% → 40%): "is my" merges with "This"
        // Word 2 closes its 15vh gap entirely
        tl.to(word2, { y: 0, ease: 'none', duration: 0.4 }, 0)
        // Word 3 + paragraph move up by the same 15vh (maintaining their spacing)
        tl.to(word3, { y: '15vh', ease: 'none', duration: 0.4 }, 0)
        tl.to(paragraph, { y: '15vh', ease: 'none', duration: 0.4 }, 0)

        // PHASE 2 (40% → 80%): "journey." merges with "This + is my"
        // Word 3 closes its remaining 15vh gap
        tl.to(word3, { y: 0, ease: 'none', duration: 0.4 }, 0.4)
        // Paragraph follows word 3 — same spacing preserved
        tl.to(paragraph, { y: 0, ease: 'none', duration: 0.4 }, 0.4)
      })

      // ── Desktop (placeholder — same sequential behavior) ──
      mm.add('(min-width: 769px)', () => {
        const word2 = wordRefs.current[1]
        const word3 = wordRefs.current[2]
        if (!word2 || !word3) return

        gsap.set(word2, { y: '15vh' })
        gsap.set(word3, { y: '30vh' })
        gsap.set(paragraph, { y: '30vh' })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        })

        tl.to(word2, { y: 0, ease: 'none', duration: 0.4 }, 0)
        tl.to(word3, { y: '15vh', ease: 'none', duration: 0.4 }, 0)
        tl.to(paragraph, { y: '15vh', ease: 'none', duration: 0.4 }, 0)

        tl.to(word3, { y: 0, ease: 'none', duration: 0.4 }, 0.4)
        tl.to(paragraph, { y: 0, ease: 'none', duration: 0.4 }, 0.4)
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className="sticky top-0 relative py-6"
      style={{ height: '140vh' }}
    >
      <div className="sticky top-0 px-6 pt-[35vh] md:px-16">
        <div>
          <h2
            className="text-center font-heading font-bold leading-[1.1] text-text"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)' }}
          >
            {wordGroups.map((group, i) => (
              <span
                key={group}
                ref={(el) => {
                  wordRefs.current[i] = el
                }}
                className="block will-change-transform"
              >
                {group}
              </span>
            ))}
          </h2>
          <p
            ref={paragraphRef}
            className="mx-auto mt-8 max-w-2xl pb-24 text-center text-base text-text-muted md:mt-10 md:text-lg will-change-transform"
          >
            From a small town in Croatia to studying in Denmark and Sweden
            &mdash; I&apos;ve been chasing curiosity across borders, picking up
            design thinking, web development, and a love for building things
            that work beautifully.
          </p>
        </div>
      </div>
    </section>
  )
}
