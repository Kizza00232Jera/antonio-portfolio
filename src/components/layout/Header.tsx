import Link from 'next/link'
import { MenuButton } from './MenuButton'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0">
      <div className="flex h-16 items-center justify-between px-6">
        <MenuButton />

        <Link
          href="/"
          className="font-heading text-sm font-bold tracking-tight"
          aria-label="Antonio — home"
        >
          A.J.
        </Link>
      </div>
    </header>
  )
}
