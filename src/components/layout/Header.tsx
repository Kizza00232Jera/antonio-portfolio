import Link from 'next/link'
import { CharRevealText } from '@/components/ui/CharReveal'
import { MenuButton } from '@/components/layout/MenuButton'

interface HeaderProps {
  heroVariant?: boolean
}

export default function Header({ heroVariant }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0">
      <div
        className="flex h-16 items-center justify-between px-6"
        style={heroVariant ? { color: '#000' } : undefined}
      >
        <MenuButton />
        <Link
          href="/"
          className="group flex flex-col leading-none tracking-tight uppercase"
          aria-label="Antonio Jerkovic — home"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '1rem' }}
        >
          <CharRevealText text="Antonio" className="font-light" />
          <CharRevealText text="Jerkovic" className="font-semibold" />
        </Link>
      </div>
    </header>
  )
}
