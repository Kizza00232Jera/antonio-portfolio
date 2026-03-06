'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useMenu } from '@/contexts/MenuContext'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { isOpen } = useMenu()

  // Shrink/restore page when menu opens/closes
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 768px)').matches

    if (prefersReduced) {
      if (isOpen) {
        gsap.set(wrapper, {
          overflow: 'hidden',
          borderRadius: '12px',
          x: isMobile ? '100%' : '40%',
          rotation: isMobile ? 0 : -12,
          transformOrigin: '100% 50%',
        })
      } else {
        gsap.set(wrapper, { clearProps: 'overflow,borderRadius,transform' })
      }
      return
    }

    if (isOpen) {
      gsap.set(wrapper, { overflow: 'hidden', borderRadius: '12px' })
      gsap.to(wrapper, {
        x: isMobile ? '100%' : '40%',
        rotation: isMobile ? 0 : -12,
        transformOrigin: '100% 50%',
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
          gsap.set(wrapper, { clearProps: 'overflow,borderRadius,transform' })
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
    >
      {children}
    </div>
  )
}
