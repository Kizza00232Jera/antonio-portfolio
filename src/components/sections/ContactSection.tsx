'use client'

import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SmartNavLink } from '@/components/ui/SmartNavLink'

gsap.registerPlugin(ScrollTrigger)

/* ── Static data ──────────────────────────────────── */

const NAV_LINKS = [
  { label: 'HOME', href: '/', soon: false },
  { label: 'PROJECTS', href: '/projects', soon: false },
  { label: 'BLOGS', href: '/blog', soon: false },
]

const NAME_WORDS = ['ANTONIO', 'JERKOVIC']
const TITLE_WORDS = ['CONTACT', 'ME']

const DEFAULTS = {
  phoneCroatian: '+385 91 512 4000',
  phoneSwedish: '+46764248374',
  email: 'antonio.jera10@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/antonio00232/',
  githubUrl: 'https://github.com/Kizza00232Jera',
}

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

/* ── Scroll-scrub letter animation (matches SectionTitle) ── */

function useScrubLetters(
  ref: React.RefObject<HTMLElement | null>,
  selector: string,
  start = 'top 100%',
  end = 'bottom 30%',
) {
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const letters = el.querySelectorAll<HTMLElement>(selector)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        letters,
        { y: '-120%' },
        {
          y: '0%',
          duration: 1,
          ease: 'power3.out',
          stagger: { each: 0.04, from: 'center' },
          scrollTrigger: {
            trigger: el,
            start,
            end,
            scrub: 1,
          },
        },
      )
    })
    return () => ctx.revert()
  }, [ref, selector, start, end])
}

/* ── Component ────────────────────────────────────── */

interface ContactSectionProps {
  phoneCroatian?: string
  phoneSwedish?: string
  email?: string
  linkedinUrl?: string
  githubUrl?: string
}

export default function ContactSection({
  phoneCroatian = DEFAULTS.phoneCroatian,
  phoneSwedish = DEFAULTS.phoneSwedish,
  email = DEFAULTS.email,
  linkedinUrl = DEFAULTS.linkedinUrl,
  githubUrl = DEFAULTS.githubUrl,
}: ContactSectionProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)

  useScrubLetters(titleRef, '.ct-letter')
  /* The name sits at the page end, so its scrub can't extend past max scroll.
     Starting 70vh before it enters gives it the same total scroll runway as
     SectionTitle (element height + 70vh) → identical letter speed. */
  useScrubLetters(nameRef, '.fn-char', 'top 170%', 'bottom bottom')

  return (
    <footer id="contact" data-theme="light" className="footer-root">

      {/* ── CONTACT ME title ── */}
      <div ref={titleRef} className="footer-contact-title">
        <h2 className="footer-contact-title-line">
          {TITLE_WORDS.map((word, wi) => (
            <span key={wi} style={{ display: 'inline-flex', overflow: 'hidden' }}>
              {word.split('').map((char, ci) => (
                <span
                  key={ci}
                  className="ct-letter"
                  style={{ display: 'inline-block', willChange: 'transform' }}
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h2>
      </div>

      <div className="footer-inner">

        {/* ── Top grid: nav left · contact right ── */}
        <div className="footer-top">

          {/* Left — page links */}
          <nav className="footer-nav-col" aria-label="Footer navigation">
            {NAV_LINKS.map(({ label, href, soon }) =>
              soon ? (
                <span key={label} className="group relative cursor-not-allowed inline-flex items-center gap-2">
                  <span className="footer-nav-link opacity-30 select-none">{label}</span>
                  <span className="font-mono text-[10px] tracking-[0.18em] text-[#111] opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">SOON</span>
                </span>
              ) : (
                <SmartNavLink key={label} href={href} label={label} className="footer-nav-link" />
              )
            )}
          </nav>

          {/* Right — contact info */}
          <div className="footer-contact-col">
            <div className="footer-contact-row">
              {phoneCroatian && (
                <a href={`tel:${phoneCroatian.replace(/\s/g, '')}`} className="footer-contact-item footer-phone">
                  {phoneCroatian}
                </a>
              )}
              {phoneSwedish && (
                <a href={`tel:${phoneSwedish.replace(/\s/g, '')}`} className="footer-contact-item footer-phone">
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
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="footer-social-link">
                  GITHUB ↗
                </a>
              )}
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="footer-social-link">
                  LINKEDIN ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Big name + clock pinned to bottom on mobile ── */}
        <div className="footer-bottom-group">
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

          {/* ── Stockholm clock centered ── */}
          <div className="footer-bottom">
            <StockholmClock />
          </div>
        </div>

      </div>
    </footer>
  )
}
