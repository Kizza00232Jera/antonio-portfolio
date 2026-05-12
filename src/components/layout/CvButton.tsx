'use client'

import { useState, useRef } from 'react'
import { CvModal } from '@/components/ui/CvModal'

export function CvButton() {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="char-reveal header-contact"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        {Array.from('MY CV ↗').map((char, i) => (
          <span
            key={i}
            data-char={char}
            style={{ '--index': i } as React.CSSProperties}
          >
            {char}
          </span>
        ))}
      </button>
      <CvModal isOpen={isOpen} onClose={handleClose} />
    </>
  )
}
