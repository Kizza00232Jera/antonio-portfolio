import Link from 'next/link'
import { CharRevealLink, CharRevealText } from '@/components/ui/CharReveal'
import { MenuButton } from '@/components/layout/MenuButton'
import { CvButton } from '@/components/layout/CvButton'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact' },
]

export default function Header() {
  return (
    <header className="header-root">
      <div className="header-inner">
        {/* Logo — left, two stacked rows */}
        <Link href="/" className="header-logo-wrap group">
          <CharRevealText text="ANTONIO" className="header-logo" />
          <CharRevealText text="JERKOVIC" className="header-logo" />
        </Link>

        {/* Nav — center (desktop only) */}
        <nav className="header-nav" aria-label="Site navigation">
          {NAV_LINKS.map(({ label, href }) => (
            <span key={label} className="nav-bracket-wrap">
              <CharRevealLink
                href={href}
                label={label.toUpperCase()}
                className="header-nav-link"
              />
            </span>
          ))}
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
    </header>
  )
}
