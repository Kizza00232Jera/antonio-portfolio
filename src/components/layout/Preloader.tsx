'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function Preloader() {
  const [visible, setVisible] = useState(true)
  const [count, setCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const topPanelRef = useRef<HTMLDivElement>(null)
  const bottomPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip preloader if already seen this session
    if (sessionStorage.getItem('preloader-seen')) {
      setVisible(false)
      return
    }

    // Respect reduced motion — skip animation, just hide
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      sessionStorage.setItem('preloader-seen', '1')
      setVisible(false)
      return
    }

    // Count from 0 to 100 over ~1.5s
    const duration = 1500
    const start = performance.now()
    let frame: number

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * 100))

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        // Counting done — slide panels away
        const tl = gsap.timeline({
          onComplete: () => {
            sessionStorage.setItem('preloader-seen', '1')
            setVisible(false)
          },
        })

        tl.to(topPanelRef.current, {
          yPercent: -100,
          duration: 0.8,
          ease: 'power3.inOut',
        }, 0)
        .to(bottomPanelRef.current, {
          yPercent: 100,
          duration: 0.8,
          ease: 'power3.inOut',
        }, 0)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {/* Top panel */}
      <div
        ref={topPanelRef}
        className="absolute inset-x-0 top-0 h-1/2 bg-[#0a0a0a] flex items-end justify-between px-8 pb-2"
      >
        <span className="font-heading text-xs text-white/30 uppercase tracking-widest">
          Antonio
        </span>
      </div>

      {/* Bottom panel */}
      <div
        ref={bottomPanelRef}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-[#0a0a0a] flex items-start justify-end px-8 pt-2"
      >
        <span
          className="font-heading font-bold text-white tabular-nums"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1 }}
        >
          {count}
        </span>
      </div>
    </div>
  )
}
