'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/utils/cn'

gsap.registerPlugin(ScrollTrigger)

interface HorizontalScrollProps {
  children: React.ReactNode
  className?: string
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Reduced-motion fallback: native horizontal scroll
    if (prefersReduced) {
      section.style.overflow = 'auto'
      return
    }

    const ctx = gsap.context(() => {
      // Wait for layout to settle, then calculate scroll distance
      const updateScroll = () => {
        const scrollDistance = track.scrollWidth - section.offsetWidth

        if (scrollDistance <= 0) return

        gsap.to(track, {
          x: -scrollDistance,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            end: () => `+=${scrollDistance}`,
            invalidateOnRefresh: true,
          },
        })
      }

      // Small delay to ensure DOM is ready
      requestAnimationFrame(updateScroll)
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className={cn('overflow-hidden', className)}>
      <div ref={trackRef} className="flex gap-8 will-change-transform">
        {children}
      </div>
    </div>
  )
}
