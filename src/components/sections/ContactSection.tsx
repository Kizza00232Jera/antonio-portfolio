'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
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

export default function FooterSection() {
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
              <Link key={label} href={href} className="footer-nav-link">
                {label}
              </Link>
            ))}
          </nav>

          {/* Right — contact block */}
          <div className="footer-contact-col">
            <div className="footer-contact-row">
              <a href="tel:+4544554455" className="footer-contact-item footer-phone">
                +45 44 55 44 55
              </a>
              <a href="mailto:antonio.jera10@gmail.com" className="footer-contact-item footer-email">
                antonio.jera10@gmail.com
              </a>
            </div>

            <div className="footer-social-row">
              <a
                href="https://www.linkedin.com/in/antonio-jerkovic/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                LINKEDIN ↗
              </a>
            </div>

            <div className="footer-address">
              <span className="footer-address-label">Address:</span>
              <span>Solna, Stockholm, Sweden</span>
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
          <span className="footer-copy">© 2026 All rights reserved Antonio Jerkovic</span>
        </div>
      </div>
    </footer>
  )
}
