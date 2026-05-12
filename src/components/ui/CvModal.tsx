'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'

interface CvModalProps {
  isOpen: boolean
  onClose: () => void
}

const PDF_PATH = '/CV_Antonio_Jerkovic.pdf'

export function CvModal({ isOpen, onClose }: CvModalProps) {
  const [mounted, setMounted] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    const backdrop = backdropRef.current
    const panel = panelRef.current
    if (!backdrop || !panel) return

    if (isOpen) {
      gsap.set(backdrop, { display: 'flex' })
      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      gsap.fromTo(panel, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' })
      requestAnimationFrame(() => closeButtonRef.current?.focus())
    } else {
      gsap.to(panel, { y: 40, opacity: 0, duration: 0.25, ease: 'power2.in' })
      gsap.to(backdrop, {
        opacity: 0,
        duration: 0.3,
        delay: 0.05,
        ease: 'power2.in',
        onComplete: () => { gsap.set(backdrop, { display: 'none' }) },
      })
    }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4 py-6"
      style={{ display: 'none' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Curriculum Vitae"
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-5xl bg-white flex flex-col shadow-2xl overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 3rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 shrink-0">
          <span
            style={{
              fontFamily: 'var(--font-satoshi), sans-serif',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#080c18',
            }}
          >
            Curriculum Vitae
          </span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              padding: '0.25rem',
              cursor: 'pointer',
              color: '#080c18',
              fontSize: '1.1rem',
              lineHeight: 1,
              opacity: 0.5,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.5' }}
          >
            ✕
          </button>
        </div>

        {/* PDF — A4 ratio on mobile (no white gap), tall+clipped on desktop */}
        <div className="min-h-0 overflow-hidden md:flex-1">
          <iframe
            src={`${PDF_PATH}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
            title="Antonio Jerkovic — Curriculum Vitae"
            style={{
              width: '100%',
              height: 'min(calc(100vw * 297 / 210), 300vh)',
              border: 'none',
              display: 'block',
            }}
          />
        </div>

        {/* Footer — download */}
        <div
          className="px-8 py-4 border-t border-gray-100 flex justify-end shrink-0"
        >
          <a
            href={PDF_PATH}
            download="Antonio_Jerkovic_CV.pdf"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#080c18',
              color: '#fff',
              fontFamily: 'var(--font-satoshi), sans-serif',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '0.625rem 1.5rem',
            }}
          >
            Download CV ↓
          </a>
        </div>
      </div>
    </div>,
    document.body
  )
}
