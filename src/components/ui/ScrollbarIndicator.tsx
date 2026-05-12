'use client'

import { useEffect, useState } from 'react'

export function ScrollbarIndicator() {
  const [thumb, setThumb] = useState({ top: 0, height: 0 })

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

  if (thumb.height === 0) return null

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
