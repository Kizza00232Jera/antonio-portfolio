import Link from 'next/link'
import { MenuButton } from './MenuButton'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <MenuButton variant="header" />

        <Link
          href="/"
          className="font-heading text-sm font-bold tracking-tight text-white"
          aria-label="Antonio — home"
        >
          A.J.
        </Link>
      </div>
    </header>
  )
}
