'use client'

import { useEffect } from 'react'

export function LenisStop() {
  useEffect(() => {
    window.dispatchEvent(new Event('lenis:stop'))
    return () => {
      window.dispatchEvent(new Event('lenis:start'))
    }
  }, [])

  return null
}
