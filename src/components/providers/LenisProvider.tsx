'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Prevent browser from restoring scroll position on refresh
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    // Keep ScrollTrigger in sync with Lenis scroll position
    lenis.on('scroll', ScrollTrigger.update)

    // Drive Lenis with the GSAP ticker so they share one RAF loop
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    // Allow other components (e.g. PageWrapper) to stop/start Lenis via events
    const handleStop = () => lenis.stop()
    const handleStart = () => lenis.start()

    // Allow other components to trigger smooth scroll via lenis:scrollTo event
    const handleScrollTo = (e: Event) => {
      const { target, duration } = (e as CustomEvent).detail
      lenis.scrollTo(target as number, { duration })
    }

    window.addEventListener('lenis:stop', handleStop)
    window.addEventListener('lenis:start', handleStart)
    window.addEventListener('lenis:scrollTo', handleScrollTo)

    return () => {
      window.removeEventListener('lenis:stop', handleStop)
      window.removeEventListener('lenis:start', handleStart)
      window.removeEventListener('lenis:scrollTo', handleScrollTo)
      lenis.destroy()
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000)
      })
    }
  }, [])

  return <>{children}</>
}
