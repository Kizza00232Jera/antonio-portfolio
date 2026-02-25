'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/utils/cn'

gsap.registerPlugin(ScrollTrigger)

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

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReduced) {
      section.style.overflow = 'auto'
      return
    }

    let timer: ReturnType<typeof setTimeout>

    const ctx = gsap.context(() => {
      const getScrollDistance = () =>
        Math.max(0, track.scrollWidth - section.offsetWidth)

      timer = setTimeout(() => {
        const distance = getScrollDistance()
        if (distance <= 0) return

        gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            end: () => `+=${getScrollDistance()}`,
            invalidateOnRefresh: true,
          },
        })
      }, 150)
    }, section)

    const ro = new ResizeObserver(() => {
      ScrollTrigger.refresh()
    })
    ro.observe(track)

    return () => {
      clearTimeout(timer)
      ro.disconnect()
      ctx.revert()
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
