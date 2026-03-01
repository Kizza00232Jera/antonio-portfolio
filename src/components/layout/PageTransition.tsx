'use client'

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { usePageTransition, getLabelForPath } from '@/contexts/PageTransitionContext'

declare global {
  interface Window {
    __preloaderDone?: boolean
  }
}

/* ── Timing ───────────────────────────────────────────────── */

const TYPE_SPEED = 110 // ms per character typed
const DELETE_SPEED = 45 // ms per character deleted (~30% faster than original 65ms)
const PAUSE_DURATION = 700 // hold after typing before deleting
const INITIAL_DELAY = 350 // delay before typing on first load

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/* ── Component ────────────────────────────────────────────── */

export default function PageTransition() {
  const [text, setText] = useState('')
  const [cursorOn, setCursorOn] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const colRefs = useRef<(HTMLDivElement | null)[]>([])

  const cancelRef = useRef(false)
  const blinkRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const runningRef = useRef(false)
  const initialDoneRef = useRef(false)

  const router = useRouter()
  const { navigationRequest, completeTransition } = usePageTransition()

  /* ── Helpers ──────────────────────────────────────────── */

  const cols = useCallback(
    () => colRefs.current.filter(Boolean) as HTMLDivElement[],
    [],
  )

  const stopBlink = useCallback(() => {
    if (blinkRef.current) {
      clearInterval(blinkRef.current)
      blinkRef.current = null
    }
  }, [])

  const startBlink = useCallback(() => {
    stopBlink()
    blinkRef.current = setInterval(() => setCursorOn((v) => !v), 530)
  }, [stopBlink])

  /** Kill all running tweens + abort async loops */
  const killAll = useCallback(() => {
    cancelRef.current = true
    stopBlink()
    cols().forEach((c) => gsap.killTweensOf(c))
    if (textRef.current) gsap.killTweensOf(textRef.current)
    setText('')
    setCursorOn(false)
  }, [cols, stopBlink])

  /** Block / unblock pointer events on the overlay */
  const setBlocking = useCallback((block: boolean) => {
    if (containerRef.current) {
      containerRef.current.style.pointerEvents = block ? 'auto' : 'none'
    }
  }, [])

  /* ── Shared: type → hold → delete → fade → curtain UP ── */

  const typeDeleteReveal = useCallback(
    async (label: string): Promise<boolean> => {
      startBlink()
      if (textRef.current) gsap.set(textRef.current, { opacity: 1 })

      // Type
      for (let i = 1; i <= label.length; i++) {
        if (cancelRef.current) return false
        setText(label.slice(0, i))
        await wait(TYPE_SPEED)
      }

      // Hold
      await wait(PAUSE_DURATION)
      if (cancelRef.current) return false

      // Delete
      for (let i = label.length - 1; i >= 0; i--) {
        if (cancelRef.current) return false
        setText(label.slice(0, i))
        await wait(DELETE_SPEED)
      }

      if (cancelRef.current) return false
      await wait(150)

      // Stop cursor
      stopBlink()
      setCursorOn(false)

      // Fade text out
      if (textRef.current) {
        gsap.to(textRef.current, { opacity: 0, duration: 0.2, ease: 'power2.out' })
      }

      // Curtain UP — columns slide to yPercent: -100
      await new Promise<void>((resolve) => {
        gsap.to(cols(), {
          yPercent: -100,
          duration: 0.75,
          ease: 'power3.inOut',
          stagger: 0.1,
          delay: 0.15,
          onComplete: resolve,
        })
      })

      return !cancelRef.current
    },
    [cols, startBlink, stopBlink],
  )

  /** Dispatch events, restart Lenis, unblock pointer events */
  const finalize = useCallback(() => {
    window.__preloaderDone = true
    window.dispatchEvent(new CustomEvent('preloader:done'))
    window.dispatchEvent(new Event('lenis:start'))
    setBlocking(false)
    runningRef.current = false
  }, [setBlocking])

  /* ─────────────────────────────────────────────────────── *
   * A) Initial page load                                    *
   * Columns start covering the screen. Detect the route,    *
   * type the label, then curtain UP. Slug routes and        *
   * reduced-motion skip immediately.                        *
   * ─────────────────────────────────────────────────────── */

  // useLayoutEffect runs before the browser paints —
  // this prevents a flash of the curtain on slug routes
  useLayoutEffect(() => {
    const path = window.location.pathname
    const label = getLabelForPath(path)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!label || prefersReduced) {
      // Hide columns immediately (before paint)
      cols().forEach((c) => gsap.set(c, { yPercent: -100 }))
      setBlocking(false)
      window.__preloaderDone = true
      setTimeout(() => window.dispatchEvent(new CustomEvent('preloader:done')), 0)
      initialDoneRef.current = true
    } else {
      // Columns stay at yPercent: 0 (covering the screen)
      cols().forEach((c) => gsap.set(c, { yPercent: 0 }))
      setBlocking(true)
    }
  }, [cols, setBlocking])

  useEffect(() => {
    if (initialDoneRef.current) return
    initialDoneRef.current = true

    const path = window.location.pathname
    const label = getLabelForPath(path)
    if (!label) return // already handled in useLayoutEffect

    // Stop Lenis during the animation
    window.dispatchEvent(new Event('lenis:stop'))
    runningRef.current = true
    cancelRef.current = false

    async function run() {
      await wait(INITIAL_DELAY)
      if (cancelRef.current) return

      const ok = await typeDeleteReveal(label!)
      if (ok) finalize()
    }

    run()

    return () => {
      cancelRef.current = true
      stopBlink()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ─────────────────────────────────────────────────────── *
   * B) Client-side navigation                               *
   * Context sets navigationRequest → curtain DOWN →         *
   * router.push → type → curtain UP.                        *
   * ─────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!navigationRequest) return
    if (runningRef.current) return

    const { path, label } = navigationRequest

    runningRef.current = true
    cancelRef.current = false
    setBlocking(true)

    // Stop Lenis
    window.dispatchEvent(new Event('lenis:stop'))

    async function run() {
      // Reset text state
      setText('')
      setCursorOn(true)
      if (textRef.current) gsap.set(textRef.current, { opacity: 1 })

      // Curtain DOWN — columns from yPercent: -100 to 0
      await new Promise<void>((resolve) => {
        gsap.to(cols(), {
          yPercent: 0,
          duration: 0.5,
          ease: 'power3.inOut',
          stagger: 0.1,
          onComplete: resolve,
        })
      })

      if (cancelRef.current) return

      // Navigate
      router.push(path)

      // Brief pause for Next.js to settle the route change
      await wait(100)

      // Scroll to top while the curtain hides everything
      window.scrollTo(0, 0)

      if (cancelRef.current) return

      // Type → delete → curtain UP
      const ok = await typeDeleteReveal(label)

      if (ok) {
        finalize()
        completeTransition()
      }
    }

    run()
  }, [navigationRequest]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ─────────────────────────────────────────────────────── *
   * C) Browser back / forward (popstate)                    *
   * The navigation has already happened by the time our     *
   * handler fires, so we snap the curtain to cover          *
   * immediately (no down animation), then type + reveal.    *
   * ─────────────────────────────────────────────────────── */

  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname
      const label = getLabelForPath(newPath)

      // Slug routes: let Next.js handle without curtain
      if (!label) return

      // Kill any in-progress transition
      killAll()

      // Snap curtain to cover immediately
      cols().forEach((c) => gsap.set(c, { yPercent: 0 }))
      setBlocking(true)

      // Stop Lenis + scroll to top
      window.dispatchEvent(new Event('lenis:stop'))
      window.scrollTo(0, 0)

      runningRef.current = true
      cancelRef.current = false

      async function run() {
        // Wait for Next.js to settle the route
        await wait(200)
        if (cancelRef.current) return

        const ok = await typeDeleteReveal(label!)

        if (ok) {
          finalize()
          completeTransition()
        }
      }

      run()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [killAll, typeDeleteReveal, finalize, completeTransition, cols, setBlocking])

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* 5 full-height vertical columns — the curtain */}
      <div className="absolute inset-0 flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            ref={(el) => {
              colRefs.current[i] = el
            }}
            className="flex-1 bg-[#151515]"
          />
        ))}
      </div>

      {/* Typing text — centered on top of columns */}
      <div
        ref={textRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: 0 }}
      >
        <span
          className="font-heading font-semibold text-white"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.02em' }}
        >
          {text}
          <span
            className="relative inline-block bg-white align-middle"
            style={{
              width: '2px',
              height: '1em',
              marginLeft: '3px',
              top: '-0.05em',
              opacity: cursorOn ? 1 : 0,
              transition: 'opacity 0.08s',
            }}
          />
        </span>
      </div>
    </div>
  )
}
