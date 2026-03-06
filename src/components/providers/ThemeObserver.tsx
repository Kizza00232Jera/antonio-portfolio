'use client'

import { useEffect } from 'react'

/**
 * Watches which `[data-theme]` section overlaps the header
 * and sets `data-theme` on the `<header>` element so its
 * text color adapts (MENU + A.J. switch between light/dark).
 */
export default function ThemeObserver() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-theme]')
    const header = document.querySelector('header')
    if (!header || sections.length === 0) return

    // Observe a thin strip at the top of the viewport (~5%)
    // so only the section behind the header triggers the switch.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const theme = (entry.target as HTMLElement).dataset.theme
            if (theme) header.dataset.headerTheme = theme
          }
        }
      },
      { rootMargin: '0px 0px -95% 0px' },
    )

    sections.forEach((s) => observer.observe(s))
    return () => {
      observer.disconnect()
      if (header) delete header.dataset.headerTheme
    }
  }, [])

  return null
}
