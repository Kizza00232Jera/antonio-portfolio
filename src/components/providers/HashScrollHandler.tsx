'use client'

import { useEffect } from 'react'

export function HashScrollHandler() {
  useEffect(() => {
    if (window.location.hash !== '#contact') return
    const id = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('lenis:scrollTo', {
          detail: { target: '#contact', duration: 1.2 },
        })
      )
    }, 300)
    return () => clearTimeout(id)
  }, [])

  return null
}
