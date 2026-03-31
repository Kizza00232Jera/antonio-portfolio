import { CharRevealLink } from '@/components/ui/CharReveal'
import { MenuButton } from '@/components/layout/MenuButton'

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
        {/* Logo — left */}
        <CharRevealLink
          href="/"
          label="ANTONIO JERKOVIC"
          className="header-logo"
        />

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

        {/* Menu button — right */}
        <div className="header-right">
          <MenuButton />
        </div>
      </div>
    </header>
  )
}
