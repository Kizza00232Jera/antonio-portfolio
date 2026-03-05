'use client'

import { useMenu } from '@/contexts/MenuContext'

export function MenuButton() {
  const { isOpen, toggle } = useMenu()

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      className="flex cursor-pointer items-center gap-2 text-base font-medium uppercase tracking-wide transition-colors duration-200 hover:opacity-70"
      style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
    >
      {isOpen ? (
        <span className="text-base leading-none">&times;</span>
      ) : (
        <span className="flex flex-col gap-[4px]">
          <span className="block h-[1.5px] w-4 bg-current" />
          <span className="block h-[1.5px] w-4 bg-current" />
        </span>
      )}
      {isOpen ? 'Close' : 'Menu'}
    </button>
  )
}
