'use client'

import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function HashScrollHandler() {
  useEffect(() => {
    if (window.location.hash !== '#contact') return

    let cancelled = false
    let rafA = 0
    let rafB = 0

    // The "My Journey" and project sections pin with GSAP ScrollTrigger, which
    // adds large pin-spacers to the page height. Those triggers are created in
    // sibling effects that run right after this one, so a fixed timeout used to
    // race them and scroll to a stale (too-high) position, landing mid-journey.
    //
    // Instead: wait two frames for those effects to create their triggers,
    // force ScrollTrigger.refresh() so the pin-spacers are baked into the page
    // height, then scroll to #contact's real, final position.
    rafA = requestAnimationFrame(() => {
      rafB = requestAnimationFrame(() => {
        if (cancelled) return
        ScrollTrigger.refresh()
        window.dispatchEvent(
          new CustomEvent('lenis:scrollTo', {
            detail: { target: '#contact', duration: 1.2 },
          }),
        )
      })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafA)
      cancelAnimationFrame(rafB)
    }
  }, [])

  return null
}
