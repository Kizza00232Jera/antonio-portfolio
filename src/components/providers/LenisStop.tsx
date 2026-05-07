'use client'

import { useEffect } from 'react'

export function LenisStop() {
  useEffect(() => {
    if (!window.matchMedia('(min-width: 768px)').matches) return

    window.dispatchEvent(new Event('lenis:stop'))
    return () => {
      window.dispatchEvent(new Event('lenis:start'))
    }
  }, [])

  return null
}
