'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Adds a rounded top-corner "card" effect to every section
 * as it slides up over the previous one. The radius flattens
 * to 0 once the section fully covers the viewport.
 *
 * Skips the first section (Hero) since it starts at the top.
 */
export default function SectionReveal() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('section[data-theme]')
    if (sections.length < 2) return

    const ctx = gsap.context(() => {
      Array.from(sections).forEach((section, i) => {
        if (i === 0) return

        gsap.fromTo(
          section,
          { borderRadius: '1.5rem 1.5rem 0 0' },
          {
            borderRadius: '0rem 0rem 0 0',
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top 10%',
              scrub: true,
            },
          },
        )
      })
    })

    return () => ctx.revert()
  }, [])

  return null
}
