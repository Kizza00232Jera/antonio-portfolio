'use client'

import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { useProjectTransition } from '@/contexts/ProjectTransitionContext'
import type { StoredRect } from '@/contexts/ProjectTransitionContext'

export function TransitionOverlay() {
  const {
    isTransitioning,
    transitionData,
    direction,
    completeTransition,
  } = useProjectTransition()

  const router = useRouter()
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  const overlayRef = useRef<HTMLDivElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  // Find the portal target on mount
  useEffect(() => {
    setPortalTarget(document.getElementById('transition-portal'))
  }, [])

  // Enter animation
  useEffect(() => {
    if (!isTransitioning || direction !== 'enter' || !transitionData) return

    const overlay = overlayRef.current
    const fade = fadeRef.current
    const imageWrapper = imageWrapperRef.current
    const img = imageRef.current
    if (!overlay || !fade || !imageWrapper || !img) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      router.push(`/projects/${transitionData.slug}`)
      return
    }

    const { imageRect } = transitionData
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Set up initial state
    img.src = transitionData.thumbnailUrl
    gsap.set(overlay, { visibility: 'visible', pointerEvents: 'auto' })
    gsap.set(fade, { opacity: 0 })
    gsap.set(imageWrapper, {
      left: imageRect.left,
      top: imageRect.top,
      width: imageRect.width,
      height: imageRect.height,
      y: 0,
    })

    const tl = gsap.timeline()
    timelineRef.current = tl

    // Phase 1: Fade page content to 10%
    tl.to('#page-wrapper', {
      opacity: 0.1,
      duration: 0.5,
      ease: 'power2.out',
    }, 0)

    // Phase 2: Expand image from card rect to fullscreen
    tl.to(imageWrapper, {
      left: 0,
      top: 0,
      width: vw,
      height: vh,
      duration: 0.8,
      ease: 'power3.inOut',
    }, 0.2)

    // Phase 3: Slide image down once fullscreen
    tl.to(imageWrapper, {
      y: vh * 0.75,
      duration: 0.6,
      ease: 'power3.out',
    }, 1.0)

    // Phase 4: Navigate at the start of the slide-down
    tl.call(() => {
      router.push(`/projects/${transitionData.slug}`)
    }, [], 1.0)

    return () => {
      tl.kill()
    }
  }, [isTransitioning, direction, transitionData, router])

  // Detect route change during enter transition → fade in new page, hide overlay
  useEffect(() => {
    if (prevPathname.current !== pathname && isTransitioning && direction === 'enter') {
      const overlay = overlayRef.current
      if (!overlay) return

      // New page mounted — fade page content in and hide overlay
      requestAnimationFrame(() => {
        gsap.to('#page-wrapper', {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        })

        gsap.to(overlay, {
          opacity: 0,
          duration: 0.4,
          delay: 0.3,
          onComplete: () => {
            gsap.set(overlay, { visibility: 'hidden', opacity: 1, pointerEvents: 'none' })
            completeTransition()
          },
        })
      })
    }
    prevPathname.current = pathname
  }, [pathname, isTransitioning, direction, completeTransition])

  // Exit animation
  useEffect(() => {
    if (!isTransitioning || direction !== 'exit' || !transitionData) return

    const overlay = overlayRef.current
    const fade = fadeRef.current
    if (!overlay || !fade) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      router.push('/projects')
      completeTransition()
      return
    }

    gsap.set(overlay, { visibility: 'visible', pointerEvents: 'auto' })

    const tl = gsap.timeline()
    timelineRef.current = tl

    // Fade detail content out
    tl.to('#page-wrapper', {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
    }, 0)

    // Fade bg color in to cover screen
    tl.to(fade, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    }, 0.2)

    // Navigate back to listing
    tl.call(() => {
      router.push('/projects')
    }, [], 0.6)

    return () => {
      tl.kill()
    }
  }, [isTransitioning, direction, transitionData, router, completeTransition])

  // Detect route change during exit transition → fade listing in
  useEffect(() => {
    if (prevPathname.current !== pathname && isTransitioning && direction === 'exit') {
      const overlay = overlayRef.current
      const fade = fadeRef.current
      if (!overlay || !fade) return

      requestAnimationFrame(() => {
        // Fade bg out, reveal listing
        gsap.to(fade, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
        })

        gsap.to('#page-wrapper', {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        })

        gsap.to(overlay, {
          opacity: 0,
          duration: 0.4,
          delay: 0.3,
          onComplete: () => {
            gsap.set(overlay, { visibility: 'hidden', opacity: 1, pointerEvents: 'none' })
            gsap.set(fade, { opacity: 0 })
            completeTransition()
          },
        })
      })
    }
    // prevPathname updated in the enter effect above
  }, [pathname, isTransitioning, direction, completeTransition])

  // Browser back/forward safety cleanup
  useEffect(() => {
    const handlePopState = () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
      gsap.set('#page-wrapper', { opacity: 1 })
      if (overlayRef.current) {
        gsap.set(overlayRef.current, { visibility: 'hidden', opacity: 1, pointerEvents: 'none' })
      }
      if (fadeRef.current) {
        gsap.set(fadeRef.current, { opacity: 0 })
      }
      completeTransition()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [completeTransition])

  if (!portalTarget) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none"
      style={{ visibility: 'hidden' }}
    >
      {/* Fade layer — covers page content with bg color */}
      <div
        ref={fadeRef}
        className="absolute inset-0"
        style={{ backgroundColor: '#e8e2da', opacity: 0 }}
      />

      {/* Image clone — positioned absolutely, animates from card to fullscreen */}
      <div
        ref={imageWrapperRef}
        className="absolute overflow-hidden"
        style={{ willChange: 'transform, left, top, width, height' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    </div>,
    portalTarget,
  )
}
