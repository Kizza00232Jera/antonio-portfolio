import Link from 'next/link'
import { MenuButton } from './MenuButton'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0">
      <div className="flex h-16 items-center justify-between px-6">
        <MenuButton />

        <Link
          href="/"
          className="flex flex-col leading-none tracking-tight uppercase"
          aria-label="Antonio Jerkovic — home"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '1rem' }}
        >
          <span className="font-light">Antonio</span>
          <span className="font-semibold">Jerkovic</span>
        </Link>
      </div>
    </header>
  )
}
