'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/utils/cn'

interface HorizontalScrollProps {
  children: React.ReactNode
  className?: string
  trackClassName?: string
}

export function HorizontalScroll({
  children,
  className,
  trackClassName,
}: HorizontalScrollProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const currentX = useRef(0)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    // Reduced-motion fallback: native horizontal scroll
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.style.overflowX = 'auto'
      return
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const maxScroll = track.scrollWidth - section.offsetWidth
      if (maxScroll <= 0) return

      // Convert vertical wheel delta to horizontal movement
      currentX.current = Math.max(
        -maxScroll,
        Math.min(0, currentX.current - e.deltaY),
      )

      gsap.to(track, {
        x: currentX.current,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: true,
      })
    }

    section.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      section.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <div ref={sectionRef} className={cn('overflow-hidden', className)}>
      <div
        ref={trackRef}
        className={cn(
          'flex items-center gap-8 will-change-transform',
          trackClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
