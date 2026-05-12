'use client'

import { useMenu } from '@/contexts/MenuContext'

export function MenuButton() {
  const { isOpen, toggle } = useMenu()

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      className="cursor-pointer p-1"
    >
      <div className="flex h-5 w-6 flex-col justify-between">
        <span
          className="block h-px w-full origin-center bg-current transition-all duration-300 ease-in-out"
          style={{ transform: isOpen ? 'translateY(10px) rotate(45deg)' : 'none' }}
        />
        <span
          className="block h-px w-4 bg-current transition-all duration-300 ease-in-out"
          style={{ opacity: isOpen ? 0 : 1, transform: isOpen ? 'scaleX(0)' : 'none' }}
        />
        <span
          className="block h-px w-full origin-center bg-current transition-all duration-300 ease-in-out"
          style={{ transform: isOpen ? 'translateY(-10px) rotate(-45deg)' : 'none' }}
        />
      </div>
    </button>
  )
}
