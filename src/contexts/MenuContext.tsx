'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface MenuContextValue {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <MenuContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu(): MenuContextValue {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}
