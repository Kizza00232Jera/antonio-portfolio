'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks scroll for the auto-hide header.
 * `scrolled` — past the hero strip (used to give the bar a solid background).
 * `hidden`   — actively scrolling down past a threshold (bar slides away).
 */
export function useHeaderScroll() {
  const [state, setState] = useState({ scrolled: false, hidden: false })

  useEffect(() => {
    // Poll scroll position every frame instead of relying on `scroll` events.
    // Lenis + GSAP can route scrolling in ways that don't always emit a window
    // scroll event, so a rAF read of the live position is the robust path.
    let raf = 0
    let lastY = -1
    let hidden = false

    const scrollY = () =>
      window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0

    const tick = () => {
      const y = scrollY()
      if (y !== lastY) {
        const delta = lastY < 0 ? 0 : y - lastY
        if (Math.abs(delta) > 4) hidden = delta > 0 && y > 120
        const scrolled = y > 40
        lastY = y
        setState((prev) =>
          prev.scrolled === scrolled && prev.hidden === hidden
            ? prev
            : { scrolled, hidden },
        )
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return state
}
