'use client'

import { useMenu } from '@/contexts/MenuContext'

export function MenuButton() {
  const { isOpen, toggle } = useMenu()

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      className="flex cursor-pointer items-center gap-2 font-body text-sm font-medium transition-colors duration-200 hover:opacity-70"
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
