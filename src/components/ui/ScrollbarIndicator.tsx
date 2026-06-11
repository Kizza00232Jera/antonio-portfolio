'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function ScrollbarIndicator() {
  const [thumb, setThumb] = useState({ top: 0, height: 0 })
  const [dragging, setDragging] = useState(false)
  /* Drag only on fine pointers — on touch devices a grabbable edge strip
     would steal swipes that start near the screen edge. */
  const [interactive, setInteractive] = useState(false)
  const drag = useRef<{ grabOffset: number } | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const apply = () => setInteractive(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement
      const scrollHeight = doc.scrollHeight
      const clientHeight = doc.clientHeight

      if (scrollHeight <= clientHeight) {
        setThumb({ top: 0, height: 0 })
        return
      }

      const thumbH = Math.max(48, (clientHeight / scrollHeight) * clientHeight)
      const progress = window.scrollY / (scrollHeight - clientHeight)
      setThumb({ top: progress * (clientHeight - thumbH), height: thumbH })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  /* Map a pointer position on the track to a scroll position.
     behavior:'instant' bypasses the html { scroll-behavior: smooth }
     easing, which would otherwise make the thumb lag behind the pointer. */
  const scrollFromPointer = useCallback((clientY: number, grabOffset: number) => {
    const doc = document.documentElement
    const scrollHeight = doc.scrollHeight
    const clientHeight = doc.clientHeight
    const thumbH = Math.max(48, (clientHeight / scrollHeight) * clientHeight)
    const track = clientHeight - thumbH
    if (track <= 0) return
    const top = Math.min(Math.max(clientY - grabOffset, 0), track)
    window.scrollTo({
      top: (top / track) * (scrollHeight - clientHeight),
      behavior: 'instant',
    })
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const onThumb = e.clientY >= thumb.top && e.clientY <= thumb.top + thumb.height
    const grabOffset = onThumb ? e.clientY - thumb.top : thumb.height / 2
    drag.current = { grabOffset }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    if (!onThumb) scrollFromPointer(e.clientY, grabOffset)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current) scrollFromPointer(e.clientY, drag.current.grabOffset)
  }

  const endDrag = () => {
    drag.current = null
    setDragging(false)
  }

  if (thumb.height === 0) return null

  if (!interactive) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed right-0 top-0 z-50 h-screen w-[3px]"
        style={{ mixBlendMode: 'difference' }}
      >
        <div
          className="absolute inset-x-0 rounded-full bg-white"
          style={{ top: thumb.top, height: thumb.height }}
        />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className="group fixed right-0 top-0 z-50 h-screen w-[14px] touch-none select-none"
      style={{ mixBlendMode: 'difference' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className={`absolute right-0 rounded-full bg-white transition-[width] duration-150 ${
          dragging ? 'w-[6px]' : 'w-[3px] group-hover:w-[6px]'
        }`}
        style={{ top: thumb.top, height: thumb.height }}
      />
    </div>
  )
}
