import { CharRevealLink } from '@/components/ui/CharReveal'

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
        {/* Logo — left, two lines */}
        <div className="header-logo-stack">
          <CharRevealLink href="/" label="ANTONIO" className="header-logo" />
          <CharRevealLink href="/" label="JERKOVIC" className="header-logo" />
        </div>

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

      </div>
    </header>
  )
}
