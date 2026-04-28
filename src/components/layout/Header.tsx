import Link from 'next/link'
import { CharRevealLink, CharRevealText } from '@/components/ui/CharReveal'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Connect', href: '#contact' },
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

        {/* Contact — right */}
        <div className="header-right">
          <CharRevealLink
            href="#contact"
            label="CONTACT ME ↗"
            className="header-contact"
          />
        </div>
      </div>
    </header>
  )
}
