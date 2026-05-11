'use client'

import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { CharRevealLink } from '@/components/ui/CharReveal'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ── Data ─────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'HOME', href: '/' },
  { label: 'PROJECTS', href: '/projects' },
  { label: 'BLOGS', href: '/blog' },
]

const NAME_WORDS = ['ANTONIO', 'JERKOVIC']

/* ── Stockholm live clock ─────────────────────────── */

function StockholmClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString('en-GB', {
          timeZone: 'Europe/Stockholm',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return <span className="footer-clock">STOCKHOLM: (GMT+2) {time}</span>
}

/* ── Component ────────────────────────────────────── */

interface ContactSectionProps {
  phoneCroatian?: string
  phoneSwedish?: string
  email?: string
  linkedinUrl?: string
  githubUrl?: string
}

export default function FooterSection({
  phoneCroatian,
  phoneSwedish,
  email,
  linkedinUrl,
  githubUrl,
}: ContactSectionProps) {
  const nameRef = useRef<HTMLDivElement>(null)

  /* Clip-path slide-up reveal on the big name */
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !nameRef.current) return

    const chars = nameRef.current.querySelectorAll<HTMLElement>('.fn-char')

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { y: '110%' },
        {
          y: '0%',
          duration: 1.4,
          ease: 'power4.out',
          stagger: { each: 0.025, from: 'start' },
          scrollTrigger: {
            trigger: nameRef.current,
            start: 'top 95%',
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <footer id="contact" data-theme="light" className="footer-root">
      <div className="footer-inner">

        {/* ── Top grid: nav left · contact right ── */}
        <div className="footer-top">

          {/* Left — page links */}
          <nav className="footer-nav-col" aria-label="Footer navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <CharRevealLink key={label} href={href} label={label} className="footer-nav-link" />
            ))}
          </nav>

          {/* Right — contact block */}
          <div className="footer-contact-col">
            <div className="footer-contact-row">
              {phoneCroatian && (
                <a href={`tel:${phoneCroatian}`} className="footer-contact-item footer-phone">
                  {phoneCroatian}
                </a>
              )}
              {phoneSwedish && (
                <a href={`tel:${phoneSwedish}`} className="footer-contact-item footer-phone">
                  {phoneSwedish}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="footer-contact-item footer-email">
                  {email}
                </a>
              )}
            </div>

            <div className="footer-social-row">
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                >
                  LINKEDIN ↗
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                >
                  GITHUB ↗
                </a>
              )}
            </div>

          </div>
        </div>

        {/* ── Big name ── */}
        <div ref={nameRef} className="footer-name" aria-label="ANTONIO JERKOVIC">
          <div className="footer-name-line">
            {NAME_WORDS.map((word, wi) => (
              <span key={wi} className="footer-name-word">
                {word.split('').map((char, ci) => (
                  <span key={ci} className="fn-char-clip">
                    <span className="fn-char">{char}</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="footer-bottom">
          <StockholmClock />
        </div>
      </div>
    </footer>
  )
}
