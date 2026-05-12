'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/utils/cn'

interface HorizontalScrollProps {
  children: React.ReactNode
  className?: string
  trackClassName?: string
  trackStyle?: React.CSSProperties
  onProgress?: (progress: number) => void
}

export function HorizontalScroll({
  children,
  className,
  trackClassName,
  trackStyle,
  onProgress,
}: HorizontalScrollProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const currentX = useRef(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isDragging = useRef(false)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    // Reduced-motion fallback: native horizontal scroll
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.style.overflowX = 'auto'
      return
    }

    const getMaxScroll = () => track.scrollWidth - section.offsetWidth

    const updatePosition = (animate = true) => {
      const maxScroll = getMaxScroll()
      if (maxScroll <= 0) return

      currentX.current = Math.max(-maxScroll, Math.min(0, currentX.current))

      if (animate) {
        gsap.to(track, {
          x: currentX.current,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: true,
        })
      } else {
        gsap.set(track, { x: currentX.current })
      }

      const progress = Math.abs(currentX.current) / maxScroll
      onProgress?.(progress)
    }

    // Desktop: wheel events
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const maxScroll = getMaxScroll()
      if (maxScroll <= 0) return

      currentX.current -= e.deltaY
      updatePosition()
    }

    // Mobile: touch events
    const handleTouchStart = (e: TouchEvent) => {
      isDragging.current = true
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return

      const deltaX = e.touches[0].clientX - touchStartX.current
      const deltaY = e.touches[0].clientY - touchStartY.current

      // Only handle horizontal swipes (prevent vertical scroll hijacking)
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault()
        currentX.current += deltaX
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
        updatePosition(false)
      }
    }

    const handleTouchEnd = () => {
      isDragging.current = false
      // Snap to bounds with animation
      updatePosition(true)
    }

    section.addEventListener('wheel', handleWheel, { passive: false })
    section.addEventListener('touchstart', handleTouchStart, { passive: true })
    section.addEventListener('touchmove', handleTouchMove, { passive: false })
    section.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      section.removeEventListener('wheel', handleWheel)
      section.removeEventListener('touchstart', handleTouchStart)
      section.removeEventListener('touchmove', handleTouchMove)
      section.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onProgress])

  return (
    <div ref={sectionRef} className={cn('overflow-hidden', className)}>
      <div
        ref={trackRef}
        className={cn(
          'flex will-change-transform',
          trackClassName,
        )}
        style={trackStyle}
      >
        {children}
      </div>
    </div>
  )
}
