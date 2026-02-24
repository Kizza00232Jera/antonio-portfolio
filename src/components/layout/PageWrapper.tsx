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
          x: isMobile ? '100%' : '40%',
          rotation: isMobile ? 0 : -12,
          transformOrigin: '100% 0%',
        })
      } else {
        gsap.set(wrapper, { clearProps: 'transform' })
      }
      return
    }

    if (isOpen) {
      gsap.to(wrapper, {
        x: isMobile ? '100%' : '40%',
        rotation: isMobile ? 0 : -12,
        transformOrigin: '100% 0%',
        duration: 1,
        ease: 'power3.inOut',
      })
    } else {
      gsap.to(wrapper, {
        x: '0%',
        rotation: 0,
        duration: 1,
        ease: 'power3.inOut',
        onComplete: () => {
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
      className="relative z-50 min-h-screen"
    >
      {children}
    </div>
  )
}
