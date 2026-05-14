'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

declare global {
  interface Window {
    __preloaderDone?: boolean
  }
}

const NAME = 'Antonio.'
const TYPE_SPEED = 110
const DELETE_SPEED = 65
const PAUSE_DURATION = 700
const INITIAL_DELAY = 350

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export default function Preloader() {
  const [visible, setVisible] = useState(true)
  const [text, setText] = useState('')
  const [cursorOn, setCursorOn] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const c1Ref = useRef<HTMLDivElement>(null)
  const c2Ref = useRef<HTMLDivElement>(null)
  const c3Ref = useRef<HTMLDivElement>(null)
  const c4Ref = useRef<HTMLDivElement>(null)
  const c5Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run the preloader animation on the homepage
    if (window.location.pathname !== '/') {
      window.__preloaderDone = true
      window.dispatchEvent(new CustomEvent('preloader:done'))
      setVisible(false)
      return
    }

    // Reduced motion: skip immediately
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      window.__preloaderDone = true
      setTimeout(() => window.dispatchEvent(new CustomEvent('preloader:done')), 0)
      setVisible(false)
      return
    }

    let cancelled = false
    const blinkInterval = setInterval(() => setCursorOn((v) => !v), 530)

    async function run() {
      await wait(INITIAL_DELAY)

      // Type "Antonio"
      for (let i = 1; i <= NAME.length; i++) {
        if (cancelled) return
        setText(NAME.slice(0, i))
        await wait(TYPE_SPEED)
      }

      // Hold
      await wait(PAUSE_DURATION)
      if (cancelled) return

      // Delete
      for (let i = NAME.length - 1; i >= 0; i--) {
        if (cancelled) return
        setText(NAME.slice(0, i))
        await wait(DELETE_SPEED)
      }

      if (cancelled) return
      await wait(150)

      clearInterval(blinkInterval)
      setCursorOn(false)

      // Fade the text wrapper out
      gsap.to(textRef.current, { opacity: 0, duration: 0.2, ease: 'power2.out' })

      // Stagger the 5 columns upward — full curtain reveal in ~1 second
      gsap.to(
        [c1Ref.current, c2Ref.current, c3Ref.current, c4Ref.current, c5Ref.current],
        {
          yPercent: -100,
          duration: 0.83,
          ease: 'power3.inOut',
          stagger: 0.1,
          delay: 0.15,
          onComplete: () => {
            window.__preloaderDone = true
            window.dispatchEvent(new CustomEvent('preloader:done'))
            setVisible(false)
          },
        }
      )
    }

    run()

    return () => {
      cancelled = true
      clearInterval(blinkInterval)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {/* 5 full-height vertical columns — the curtain */}
      <div className="absolute inset-0 flex">
        <div ref={c1Ref} className="flex-1 bg-[#fafaf8]" />
        <div ref={c2Ref} className="flex-1 bg-[#fafaf8]" />
        <div ref={c3Ref} className="flex-1 bg-[#fafaf8]" />
        <div ref={c4Ref} className="flex-1 bg-[#fafaf8]" />
        <div ref={c5Ref} className="flex-1 bg-[#fafaf8]" />
      </div>

      {/* Typing text — centered on top of columns */}
      <div
        ref={textRef}
        className="absolute inset-0 z-10 flex items-center justify-center"
      >
        <span
          className="font-heading font-semibold text-[#111111]"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.02em' }}
        >
          {text}
          <span
            className="relative inline-block bg-[#111111] align-middle"
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
