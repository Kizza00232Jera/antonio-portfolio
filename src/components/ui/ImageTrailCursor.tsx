'use client'

import { useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'

// Placeholder gradients — replace with real portfolio project images later
const TRAIL_IMAGES = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
]

const POOL_SIZE = 15
const DISTANCE_THRESHOLD = 80
const IMG_WIDTH = 200
const IMG_OFFSET = 30 // px overscan on inner image for parallax zoom

export function ImageTrailCursor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const poolRef = useRef<{ outer: HTMLDivElement; inner: HTMLDivElement }[]>([])
  const poolIndex = useRef(0)
  const activeCount = useRef(0)
  const scrollActive = useRef(false)
  const inZone = useRef(false)
  const mousePos = useRef({ x: 0, y: 0 })
  const cachePos = useRef({ x: 0, y: 0 })
  const lastSpawnPos = useRef({ x: 0, y: 0 })
  const rafId = useRef<number>(0)
  const isRendering = useRef(false)

  // Lerp helper
  const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b

  // Distance helper
  const getDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.hypot(x2 - x1, y2 - y1)

  // Fade out all pool elements
  const fadeOutAll = useCallback(() => {
    poolRef.current.forEach(({ outer, inner }) => {
      gsap.killTweensOf(outer)
      gsap.killTweensOf(inner)
      gsap.to(outer, { opacity: 0, duration: 0.3 })
    })
  }, [])

  // Start or stop the render loop based on both conditions
  const syncState = useCallback(() => {
    const shouldRun = scrollActive.current && inZone.current

    if (shouldRun && !isRendering.current) {
      isRendering.current = true
      cachePos.current = { ...mousePos.current }
      lastSpawnPos.current = { ...mousePos.current }
      rafId.current = requestAnimationFrame(renderLoop)
    } else if (!shouldRun && isRendering.current) {
      isRendering.current = false
      cancelAnimationFrame(rafId.current)
      fadeOutAll()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showNextImage = useCallback(() => {
    const pool = poolRef.current
    if (pool.length < POOL_SIZE) return

    poolIndex.current = poolIndex.current < POOL_SIZE - 1 ? poolIndex.current + 1 : 0
    const item = pool[poolIndex.current]
    if (!item) return
    const { outer, inner } = item

    // Kill any running animations on this element
    gsap.killTweensOf(outer)
    gsap.killTweensOf(inner)

    // Use known dimensions (IMG_WIDTH x IMG_WIDTH * 4/3)
    const hw = IMG_WIDTH / 2
    const hh = (IMG_WIDTH * 4 / 3) / 2

    // GSAP timeline matching Codrops demo2 "innerscape"
    const tl = gsap.timeline({
      onStart: () => { activeCount.current++ },
      onComplete: () => { activeCount.current-- },
    })

    // Outer: scale in from 0 at cached position, drift to current position
    tl.fromTo(
      outer,
      {
        opacity: 1,
        scale: 0,
        x: cachePos.current.x - hw,
        y: cachePos.current.y - hh,
      },
      {
        duration: 0.4,
        ease: 'power1',
        scale: 1,
        x: mousePos.current.x - hw,
        y: mousePos.current.y - hh,
      },
      0,
    )

    // Inner: zoom out from 2.8x with brightness flash
    tl.fromTo(
      inner,
      {
        scale: 2.8,
        filter: 'brightness(250%)',
      },
      {
        duration: 0.4,
        ease: 'power1',
        scale: 1,
        filter: 'brightness(100%)',
      },
      0,
    )

    // Outer: fade out and shrink
    tl.to(
      outer,
      {
        duration: 0.4,
        ease: 'power2',
        opacity: 0,
        scale: 0.2,
      },
      0.45,
    )
  }, [])

  // Render loop — defined as a standalone function so syncState can reference it
  function renderLoop() {
    if (!isRendering.current) return

    // Smooth cached position toward actual mouse
    cachePos.current.x = lerp(cachePos.current.x || mousePos.current.x, mousePos.current.x, 0.1)
    cachePos.current.y = lerp(cachePos.current.y || mousePos.current.y, mousePos.current.y, 0.1)

    // Check distance from last spawn
    const dist = getDistance(
      mousePos.current.x,
      mousePos.current.y,
      lastSpawnPos.current.x,
      lastSpawnPos.current.y,
    )

    if (dist > DISTANCE_THRESHOLD) {
      showNextImage()
      lastSpawnPos.current = { ...mousePos.current }
    }

    rafId.current = requestAnimationFrame(renderLoop)
  }

  // Mouse tracking with zone detection
  useEffect(() => {
    const handleMove = (ev: MouseEvent) => {
      mousePos.current = { x: ev.clientX, y: ev.clientY }

      // Check if mouse is over the hero trail zone
      const overZone = !!document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-trail-zone]')
      const wasInZone = inZone.current
      inZone.current = overZone

      // If zone state changed, sync render loop
      if (wasInZone !== overZone) {
        syncState()
      }

      // Start render loop on first move while both conditions met
      if (scrollActive.current && inZone.current && !isRendering.current) {
        isRendering.current = true
        cachePos.current = { ...mousePos.current }
        lastSpawnPos.current = { ...mousePos.current }
        rafId.current = requestAnimationFrame(renderLoop)
      }
    }

    window.addEventListener('mousemove', handleMove)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(rafId.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncState])

  // Listen for scroll-based activation/deactivation events
  useEffect(() => {
    const handleToggle = (ev: Event) => {
      const active = (ev as CustomEvent).detail as boolean
      scrollActive.current = active
      syncState()
    }

    window.addEventListener('imagetrail:toggle', handleToggle)
    return () => window.removeEventListener('imagetrail:toggle', handleToggle)
  }, [syncState])

  // Only render on pointer devices
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) {
      if (containerRef.current) {
        containerRef.current.style.display = 'none'
      }
    }
  }, [])

  // Collect pool refs after mount
  useEffect(() => {
    if (!containerRef.current) return
    const outers = containerRef.current.querySelectorAll<HTMLDivElement>('[data-trail-outer]')
    const pool: { outer: HTMLDivElement; inner: HTMLDivElement }[] = []
    outers.forEach((outer) => {
      const inner = outer.querySelector<HTMLDivElement>('[data-trail-inner]')
      if (inner) pool.push({ outer, inner })
    })
    poolRef.current = pool
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: POOL_SIZE }).map((_, i) => {
        const imgSrc = TRAIL_IMAGES[i % TRAIL_IMAGES.length]
        return (
          <div
            key={i}
            data-trail-outer
            style={{
              width: IMG_WIDTH,
              aspectRatio: '3/4',
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 0,
              overflow: 'hidden',
              borderRadius: '0.5rem',
              willChange: 'transform, filter',
            }}
          >
            <div
              data-trail-inner
              style={{
                background: imgSrc.startsWith('linear-gradient') ? imgSrc : `url(${imgSrc}) center/cover`,
                width: `calc(100% + ${IMG_OFFSET * 2}px)`,
                height: `calc(100% + ${IMG_OFFSET * 2}px)`,
                position: 'absolute',
                top: -IMG_OFFSET,
                left: -IMG_OFFSET,
                willChange: 'transform, filter',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
