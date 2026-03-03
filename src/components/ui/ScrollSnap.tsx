'use client'

import { useEffect, useRef } from 'react'

/**
 * Gentle scroll-drift between sticky sections.
 *
 * After the user stops scrolling for 1.5 s AND has crossed the 50 %
 * midpoint of a segment, gently drift forward to the next section.
 * Never snaps backward. Never interrupts active scrolling.
 */

const DEBOUNCE_MS = 1500 // wait 1.5 s after user stops before drifting
const FORWARD_THRESHOLD = 0.5 // must scroll past 50 % of segment to drift forward

export default function ScrollSnap() {
  const isSnappingRef = useRef(false)

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReduced) return

    let wheelTimer: ReturnType<typeof setTimeout>

    /* ── Core: drift to the nearest section ── */
    const evaluateSnap = () => {
      if (isSnappingRef.current) return

      // Calculate fresh snap positions every time (avoids stale offsets)
      const sections = document.querySelectorAll<HTMLElement>(
        '#page-wrapper section',
      )
      if (sections.length < 2) return

      const scrollY = window.scrollY
      const snapPositions = Array.from(sections).map(
        (s) => s.getBoundingClientRect().top + scrollY,
      )

      // Find which segment we're in
      let segIdx = 0
      for (let i = snapPositions.length - 1; i >= 0; i--) {
        if (scrollY >= snapPositions[i] - 5) {
          segIdx = i
          break
        }
      }

      const current = snapPositions[segIdx]
      const next = snapPositions[segIdx + 1]

      // No next section to drift to — do nothing
      if (next === undefined) return

      const segmentSize = next - current
      const progress = (scrollY - current) / segmentSize

      // Only drift forward when past the threshold
      if (progress >= FORWARD_THRESHOLD) {
        drift(next)
      }
    }

    const drift = (target: number) => {
      const distance = Math.abs(target - window.scrollY)
      if (distance < 5) return

      const vh = window.innerHeight
      const duration = Math.min(2.5, Math.max(1.5, (distance / vh) * 2))

      isSnappingRef.current = true

      window.dispatchEvent(
        new CustomEvent('lenis:scrollTo', {
          detail: { target, duration },
        }),
      )

      // Release lock after animation finishes (+ buffer)
      setTimeout(() => {
        isSnappingRef.current = false
      }, duration * 1000 + 200)
    }

    /* ── Event handlers ── */
    const onWheel = () => {
      // User is actively scrolling — cancel any pending drift
      isSnappingRef.current = false
      clearTimeout(wheelTimer)
      wheelTimer = setTimeout(evaluateSnap, DEBOUNCE_MS)
    }

    // Only desktop (wheel) — on mobile, Lenis momentum + sticky
    // sections already provide smooth scrolling without snap
    window.addEventListener('wheel', onWheel, { passive: true })

    return () => {
      clearTimeout(wheelTimer)
      window.removeEventListener('wheel', onWheel)
    }
  }, [])

  return null
}
