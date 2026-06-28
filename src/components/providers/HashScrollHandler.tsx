'use client'

import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function HashScrollHandler() {
  useEffect(() => {
    if (window.location.hash !== '#contact') return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    let lastHeight = -1
    let stableTicks = 0
    let attempts = 0

    // The "My Journey" and projects sections pin with GSAP ScrollTrigger, which
    // adds large pin-spacers to the page height AFTER mount. A fixed delay raced
    // that setup and scrolled to a stale (too-high) #contact position, landing
    // mid-journey. Instead, poll until the page height stops growing (pin-spacers
    // in place and Lenis has remeasured), then refresh and scroll to the real spot.
    const tick = () => {
      if (cancelled) return
      const h = document.documentElement.scrollHeight
      if (h === lastHeight) {
        stableTicks++
      } else {
        stableTicks = 0
        lastHeight = h
      }
      attempts++

      // Height stable for ~300ms, or give up waiting after ~3s.
      if (stableTicks >= 3 || attempts > 30) {
        ScrollTrigger.refresh()
        requestAnimationFrame(() => {
          if (cancelled) return
          window.dispatchEvent(
            new CustomEvent('lenis:scrollTo', {
              detail: { target: '#contact', duration: 1.2 },
            }),
          )
        })
        return
      }
      timer = setTimeout(tick, 100)
    }
    timer = setTimeout(tick, 100)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return null
}
