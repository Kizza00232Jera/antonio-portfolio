'use client'

import { useMenu } from '@/contexts/MenuContext'
import { CharRevealText } from '@/components/ui/CharReveal'

export function MenuButton() {
  const { isOpen, toggle } = useMenu()

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      className="char-reveal flex cursor-pointer items-center gap-2 text-base tracking-wide"
      style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
    >
      <CharRevealText text={isOpen ? '× Close' : '≡ Menu'} />
    </button>
  )
}
