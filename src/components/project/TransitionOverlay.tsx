'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { useProjectTransition } from '@/contexts/ProjectTransitionContext'

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

  // Gate for enter reveal: route must have changed
  const routeChangedRef = useRef(false)
  const revealStartedRef = useRef(false)

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalTarget(document.getElementById('transition-portal'))
  }, [])

  // The reveal sequence — runs when route has changed (image is fullscreen)
  // Slide-down and content stagger happen simultaneously
  const tryReveal = useCallback(() => {
    if (!routeChangedRef.current || revealStartedRef.current) return
    revealStartedRef.current = true

    const overlay = overlayRef.current
    const imageWrapper = imageWrapperRef.current
    if (!overlay || !imageWrapper) return

    const vh = window.innerHeight

    // Prepare the new page: make container visible, hide text elements
    const content = document.getElementById('projects-content')
    if (content) {
      const animateEls = content.querySelectorAll('[data-animate]')
      gsap.set(animateEls, { opacity: 0, y: 30 })
      gsap.set(content, { opacity: 1 })
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { visibility: 'hidden', opacity: 1, pointerEvents: 'none' })
        completeTransition()
      },
    })

    // Slide image down to where the video sits (75dvh = right below the hero section)
    tl.to(imageWrapper, {
      y: vh * 0.75,
      duration: 0.8,
      ease: 'power3.inOut',
    }, 0)

    // Simultaneously stagger the text content in from above
    if (content) {
      const animateEls = content.querySelectorAll('[data-animate]')
      tl.to(animateEls, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.out',
      }, 0.1)
    }

    // Fade overlay image out at the end so the actual video appears seamlessly
    tl.to(overlay, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
    }, 0.6)
  }, [completeTransition])

  // Enter animation
  useEffect(() => {
    if (!isTransitioning || direction !== 'enter' || !transitionData) return

    const overlay = overlayRef.current
    const imageWrapper = imageWrapperRef.current
    const img = imageRef.current
    if (!overlay || !imageWrapper || !img) return

    // Reset gates
    routeChangedRef.current = false
    revealStartedRef.current = false

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
    gsap.set(overlay, { visibility: 'visible', pointerEvents: 'auto', opacity: 1 })
    gsap.set(imageWrapper, {
      left: imageRect.left,
      top: imageRect.top,
      width: imageRect.width,
      height: imageRect.height,
      y: 0,
    })

    const tl = gsap.timeline()
    timelineRef.current = tl

    // Phase 1: Fade content to 10% — background stays visible
    tl.to('#projects-content', {
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

    // Phase 3: When image is fullscreen, hide content fully and navigate
    // The slide-down + content stagger happens in tryReveal after route changes
    tl.call(() => {
      gsap.set('#projects-content', { opacity: 0 })
      router.push(`/projects/${transitionData.slug}`)
    }, [], 1.0)

    return () => {
      tl.kill()
    }
  }, [isTransitioning, direction, transitionData, router, tryReveal])

  // Detect route change — second gate for the enter reveal
  useEffect(() => {
    if (prevPathname.current !== pathname && isTransitioning && direction === 'enter') {
      routeChangedRef.current = true
      tryReveal()
    }
    prevPathname.current = pathname
  }, [pathname, isTransitioning, direction, tryReveal])

  // Exit animation — doesn't need transitionData (works for direct URL access too)
  useEffect(() => {
    if (!isTransitioning || direction !== 'exit') return

    const overlay = overlayRef.current
    const fade = fadeRef.current
    if (!overlay || !fade) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      router.push('/projects')
      completeTransition()
      return
    }

    gsap.set(overlay, { visibility: 'visible', pointerEvents: 'auto', opacity: 1 })

    const tl = gsap.timeline()
    timelineRef.current = tl

    // Fade detail content out
    tl.to('#projects-content', {
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
  }, [isTransitioning, direction, router, completeTransition])

  // Detect route change during exit → fade listing back in
  useEffect(() => {
    if (prevPathname.current !== pathname && isTransitioning && direction === 'exit') {
      const overlay = overlayRef.current
      const fade = fadeRef.current
      if (!overlay || !fade) return

      requestAnimationFrame(() => {
        gsap.to(fade, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
        })

        gsap.to('#projects-content', {
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
  }, [pathname, isTransitioning, direction, completeTransition])

  // Browser back/forward safety cleanup
  useEffect(() => {
    const handlePopState = () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
      gsap.set('#projects-content', { opacity: 1 })
      if (overlayRef.current) {
        gsap.set(overlayRef.current, { visibility: 'hidden', opacity: 1, pointerEvents: 'none' })
      }
      if (fadeRef.current) {
        gsap.set(fadeRef.current, { opacity: 0 })
      }
      routeChangedRef.current = false
      revealStartedRef.current = false
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
      {/* Fade layer — covers page content with bg color (used for exit) */}
      <div
        ref={fadeRef}
        className="absolute inset-0"
        style={{ backgroundColor: '#e8e2da', opacity: 0 }}
      />

      {/* Image clone — animates from card to fullscreen then slides down */}
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
