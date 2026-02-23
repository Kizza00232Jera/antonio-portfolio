'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function Preloader() {
  const [visible, setVisible] = useState(true)
  const col1Ref = useRef<HTMLDivElement>(null)
  const col2Ref = useRef<HTMLDivElement>(null)
  const col3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem('preloader-seen')) {
      setVisible(false)
      return
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      sessionStorage.setItem('preloader-seen', '1')
      setVisible(false)
      return
    }

    // Hold briefly, then stagger-slide all 3 columns upward
    const tl = gsap.timeline({
      delay: 0.8,
      onComplete: () => {
        sessionStorage.setItem('preloader-seen', '1')
        setVisible(false)
      },
    })

    tl.to(
      [col1Ref.current, col2Ref.current, col3Ref.current],
      {
        yPercent: -100,
        duration: 0.9,
        ease: 'power3.inOut',
        stagger: 0.08,
      }
    )
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex"
      aria-hidden="true"
    >
      {/* 3 equal vertical columns */}
      <div ref={col1Ref} className="flex-1 bg-[#151515]" />
      <div ref={col2Ref} className="flex-1 bg-[#151515]" />
      <div ref={col3Ref} className="flex-1 bg-[#151515]" />

      {/* Small pill indicator — top left */}
      <div className="absolute left-8 top-8 flex items-center gap-2">
        <div
          className="relative h-6 w-[18px] overflow-hidden rounded-full bg-white"
          aria-hidden="true"
        >
          <div className="absolute inset-[2px] rounded-full bg-[#010101]" />
        </div>
      </div>
    </div>
  )
}
