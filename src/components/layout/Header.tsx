'use client'

import { MenuButton } from './MenuButton'
import { usePageTransition } from '@/contexts/PageTransitionContext'

export default function Header() {
  const { navigateTo } = usePageTransition()

  return (
    <header className="fixed top-0 left-0 right-0">
      <div className="flex h-16 items-center justify-between px-6">
        <MenuButton variant="header" />

        <a
          href="/"
          onClick={(e) => {
            e.preventDefault()
            navigateTo('/')
          }}
          className="font-heading text-sm font-bold tracking-tight"
          aria-label="Antonio — home"
        >
          A.J.
        </a>
      </div>
    </header>
  )
}
