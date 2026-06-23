'use client'

import Link from 'next/link'
import { CharRevealText } from '@/components/ui/CharReveal'
import { SmartNavLink } from '@/components/ui/SmartNavLink'
import { MenuButton } from '@/components/layout/MenuButton'
import { CvButton } from '@/components/layout/CvButton'
import { useNavLab, useHeaderScroll } from '@/components/layout/navLab'

const NAV_LINKS: Array<{ label: string; href: string; soon?: boolean }> = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact' },
]

export default function Header() {
  const { variant } = useNavLab()
  const { scrolled, hidden } = useHeaderScroll()

  // Variant 1 reacts to scroll direction; 2-4 react to "past hero".
  const headerClass =
    'header-root' +
    (variant === 1 && hidden ? ' is-hidden' : '') +
    (variant >= 2 && scrolled ? ' is-scrolled' : '')

  return (
    <header className={headerClass} data-variant={variant}>
      <div className="header-inner">
        {/* Logo — left, two stacked rows */}
        <Link href="/" className="header-logo-wrap group">
          <CharRevealText text="ANTONIO" className="header-logo" />
          <CharRevealText text="JERKOVIC" className="header-logo" />
        </Link>

        {/* Nav — center (desktop only) */}
        <nav className="header-nav" aria-label="Site navigation">
          {NAV_LINKS.map(({ label, href, soon }) =>
            soon ? (
              <span key={label} className="nav-bracket-wrap relative group cursor-not-allowed">
                <span className="header-nav-link opacity-30 select-none">{label.toUpperCase()}</span>
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-4 font-mono text-[9px] tracking-[0.18em] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  SOON
                </span>
              </span>
            ) : (
              <span key={label} className="nav-bracket-wrap">
                <SmartNavLink
                  href={href}
                  label={label.toUpperCase()}
                  className="header-nav-link"
                />
              </span>
            )
          )}
        </nav>

        {/* Right side: hamburger on mobile, Contact link on desktop */}
        <div className="header-right">
          <div className="md:hidden">
            <MenuButton />
          </div>
          <div className="hidden md:flex">
            <CvButton />
          </div>
        </div>
      </div>

      {/* Variant 4: floating menu trigger shown while reading */}
      {variant === 4 && (
        <div className="nav-fab">
          <MenuButton />
        </div>
      )}
    </header>
  )
}
