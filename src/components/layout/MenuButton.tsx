'use client'

import { useMenu } from '@/contexts/MenuContext'

interface MenuButtonProps {
  variant: 'header' | 'overlay'
}

export function MenuButton({ variant }: MenuButtonProps) {
  const { isOpen, toggle } = useMenu()

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      className="flex cursor-pointer items-center gap-2 font-body text-sm font-medium text-white transition-colors duration-200 hover:text-white/70"
    >
      {variant === 'header' && (
        <span className="flex flex-col gap-[4px]">
          <span className="block h-[1.5px] w-4 bg-current" />
          <span className="block h-[1.5px] w-4 bg-current" />
        </span>
      )}
      {variant === 'overlay' && (
        <span className="text-base leading-none">&times;</span>
      )}
      {variant === 'header' ? 'Menu' : 'Close'}
    </button>
  )
}
