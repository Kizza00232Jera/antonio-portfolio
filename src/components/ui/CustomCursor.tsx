'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'

/**
 * Global custom cursor — a small circle ring that follows the mouse.
 * Grows on hover over interactive elements (a, button).
 * Hides over elements with [data-cursor-hide] (e.g. project card images
 * that have their own custom cursor).
 * Desktop only — hidden on touch devices via matchMedia.
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [hasPointer, setHasPointer] = useState(false)

  useEffect(() => {
    // Only show on devices with a fine pointer (mouse/trackpad)
    const mq = window.matchMedia('(pointer: fine)')
    setHasPointer(mq.matches)

    const onChange = (e: MediaQueryListEvent) => setHasPointer(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!hasPointer) return

    const el = cursorRef.current
    if (!el) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const followDuration = prefersReduced ? 0 : 0.25

    // quickTo reuses a single tween per property — ideal for 60fps tracking
    const xTo = gsap.quickTo(el, 'x', { duration: followDuration, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: followDuration, ease: 'power3.out' })

    // Track mouse position
    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }

    // Only grow on elements that explicitly opt in
    const isInteractive = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false
      return !!target.closest('[data-cursor="grow"]')
    }

    const shouldHide = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false
      return !!target.closest('[data-cursor-hide]')
    }

    const onMouseOver = (e: MouseEvent) => {
      if (shouldHide(e.target)) {
        gsap.to(el, { opacity: 0, scale: 0.5, duration: 0.2, ease: 'power2.out' })
      } else if (isInteractive(e.target)) {
        gsap.to(el, { scale: 2.5, opacity: 0.8, duration: 0.3, ease: 'power3.out' })
      }
    }

    const onMouseOut = (e: MouseEvent) => {
      if (shouldHide(e.target)) {
        gsap.to(el, { opacity: 0.5, scale: 1, duration: 0.2, ease: 'power2.out' })
      } else if (isInteractive(e.target)) {
        gsap.to(el, { scale: 1, opacity: 0.5, duration: 0.3, ease: 'power3.out' })
      }
    }

    // Hide cursor when mouse leaves the window
    const onMouseLeave = () => {
      gsap.to(el, { opacity: 0, duration: 0.2 })
    }
    const onMouseEnter = () => {
      gsap.to(el, { opacity: 0.5, duration: 0.2 })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)
    document.documentElement.addEventListener('mouseleave', onMouseLeave)
    document.documentElement.addEventListener('mouseenter', onMouseEnter)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      document.documentElement.removeEventListener('mouseleave', onMouseLeave)
      document.documentElement.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [hasPointer])

  if (!hasPointer) return null

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0"
      style={{
        width: '1.875rem',
        height: '1.875rem',
        border: '1.5px solid var(--color-text)',
        borderRadius: '50%',
        opacity: 0.5,
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        willChange: 'transform',
      }}
    />
  )
}
