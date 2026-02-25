'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useMenu } from '@/contexts/MenuContext'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { isOpen } = useMenu()

  // Translate the page when menu opens — no scaling, just shift right + down
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 768px)').matches

    if (prefersReduced) {
      if (isOpen) {
        gsap.set(wrapper, {
          x: isMobile ? '100%' : '55%',
          y: isMobile ? '12vh' : '20vh',
          rotateY: !isMobile ? -3 : 0,
          transformPerspective: 1200,
          transformOrigin: 'center center',
        })
      } else {
        gsap.set(wrapper, { clearProps: 'transform' })
      }
      return
    }

    if (isOpen) {
      gsap.to(wrapper, {
        x: isMobile ? '100%' : '55%',
        y: isMobile ? '12vh' : '20vh',
        rotateY: isMobile ? 0 : -3,
        transformPerspective: 1200,
        transformOrigin: 'center center',
        duration: 0.6,
        ease: 'power3.inOut',
      })
    } else {
      gsap.to(wrapper, {
        x: '0%',
        y: '0%',
        rotateY: 0,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
          // Clear all inline styles so fixed positioning works inside the wrapper
          gsap.set(wrapper, { clearProps: 'transform' })
        },
      })
    }
  }, [isOpen])

  // Lock/unlock scroll when menu opens/closes
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      window.dispatchEvent(new CustomEvent('lenis:stop'))
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      window.dispatchEvent(new CustomEvent('lenis:start'))
    }

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <div
      ref={wrapperRef}
      id="page-wrapper"
      className="relative min-h-screen"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}
