import Link from 'next/link'
import Nav from './Nav'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-bg/80 backdrop-blur-sm">
      <div
        className="mx-auto flex h-16 max-w-[var(--max-width)] items-center justify-between px-6"
      >
        <Link
          href="/"
          className="font-heading text-lg font-bold tracking-tight text-text hover:text-accent transition-colors duration-200"
          aria-label="Antonio — home"
        >
          Antonio
        </Link>

        <Nav />
      </div>
    </header>
  )
}
