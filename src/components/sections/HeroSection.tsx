'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import { IsometricBackground } from '@/components/ui/IsometricBackground'
import { SignatureSVG } from '@/components/ui/SignatureSVG'
import type { SignatureSVGRef } from '@/components/ui/SignatureSVG'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const cardWrapRef = useRef<HTMLDivElement>(null)
  const imageCardRef = useRef<HTMLDivElement>(null)
  const imageInnerRef = useRef<HTMLDivElement>(null)
  const signatureWrapRef = useRef<HTMLDivElement>(null)
  const signatureRef = useRef<SignatureSVGRef>(null)
  const marqueeRow1Ref = useRef<HTMLDivElement>(null)
  const marqueeRow2Ref = useRef<HTMLDivElement>(null)
  const progressBarWrapRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressNumberRef = useRef<HTMLSpanElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  const [ready, setReady] = useState(false)

  // Wait for preloader to finish before enabling ScrollTrigger
  useEffect(() => {
    if (window.__preloaderDone) {
      setReady(true)
      return
    }
    const handle = () => setReady(true)
    window.addEventListener('preloader:done', handle)
    return () => window.removeEventListener('preloader:done', handle)
  }, [])

  // Track trail activation to avoid dispatching on every scroll tick
  const trailActiveRef = useRef(false)

  // GSAP ScrollTrigger timeline
  useEffect(() => {
    if (!ready) return
    if (!sectionRef.current) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh()

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia()

        mm.add(
          {
            isDesktop: '(min-width: 768px)',
            isMobile: '(max-width: 767px)',
          },
          (context) => {
            const { isDesktop } = context.conditions as { isDesktop: boolean; isMobile: boolean }

            if (imageCardRef.current) {
              imageCardRef.current.style.transformOrigin = 'center center'
            }

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: wrapperRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                onUpdate: (self) => {
                  // Toggle image trail cursor activation (~90% of signature drawn)
                  const shouldBeActive = self.progress >= 0.67
                  if (trailActiveRef.current !== shouldBeActive) {
                    trailActiveRef.current = shouldBeActive
                    window.dispatchEvent(
                      new CustomEvent('imagetrail:toggle', { detail: shouldBeActive }),
                    )
                  }
                },
              },
            })

            // ── All positions scaled ×0.7 (animations finish at 70% = 350vh of 500vh) ──
            // 70%–90% = blank scroll (50vh) with trail cursor + progress bar
            // 90%–100% = overlap zone where section 2 slides over sticky hero

            // 0–0.7: Image card shrinks
            if (isDesktop) {
              if (imageCardRef.current) {
                tl.fromTo(
                  imageCardRef.current,
                  { scale: 1 },
                  { scale: 0.35, duration: 0.7, ease: 'none' },
                  0,
                )
              }
              if (imageInnerRef.current) {
                tl.fromTo(
                  imageInnerRef.current,
                  { scale: 1 },
                  { scale: 1.5, duration: 0.7, ease: 'none' },
                  0,
                )
              }
            } else {
              if (cardWrapRef.current) {
                tl.fromTo(
                  cardWrapRef.current,
                  { top: '0%', right: '0%', bottom: '0%', left: '0%' },
                  { top: '36%', right: '13%', bottom: '29%', left: '13%', duration: 0.7, ease: 'none' },
                  0,
                )
              }
            }

            // 0.14–0.56: Marquee rows fade in
            if (marqueeRow1Ref.current) {
              tl.fromTo(
                marqueeRow1Ref.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.42, ease: 'none' },
                0.14,
              )
            }
            if (marqueeRow2Ref.current) {
              tl.fromTo(
                marqueeRow2Ref.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.42, ease: 'none' },
                0.175,
              )
            }

            // 0.0–0.35: Section background transitions from black to white
            if (sectionRef.current) {
              tl.fromTo(
                sectionRef.current,
                { backgroundColor: '#000000' },
                { backgroundColor: '#ffffff', duration: 0.35, ease: 'none' },
                0,
              )
            }

            // 0.35–0.63: Image desaturates and darkens
            if (imageInnerRef.current) {
              tl.fromTo(
                imageInnerRef.current,
                { filter: 'grayscale(0) brightness(1)' },
                { filter: 'grayscale(1) brightness(0.45)', duration: 0.28, ease: 'none' },
                0.35,
              )
            }

            // 0.35–0.63: Card background transitions from cream to black
            if (imageCardRef.current) {
              tl.fromTo(
                imageCardRef.current,
                { backgroundColor: '#f2ede8' },
                { backgroundColor: '#000000', duration: 0.28, ease: 'none' },
                0.35,
              )
            }

            // 0–0.7: Signature wrapper scales with card
            if (signatureWrapRef.current) {
              if (isDesktop) {
                tl.fromTo(
                  signatureWrapRef.current,
                  { scale: 1 },
                  { scale: 0.35, duration: 0.7, ease: 'none' },
                  0,
                )
              } else {
                tl.fromTo(
                  signatureWrapRef.current,
                  { top: '0%', right: '0%', bottom: '0%', left: '0%' },
                  { top: '29%', right: '10%', bottom: '22%', left: '10%', duration: 0.7, ease: 'none' },
                  0,
                )
              }
            }

            // 0.385–0.7: Signature draws in
            if (signatureRef.current?.pathElement) {
              const len = signatureRef.current.totalLength
              tl.fromTo(
                signatureRef.current.pathElement,
                { strokeDashoffset: len },
                { strokeDashoffset: 0, duration: 0.315, ease: 'power2.out' },
                0.385,
              )
            }

            // 0–1.0: Progress bar fills across the entire scroll
            if (progressBarRef.current) {
              const proxy = { value: 0 }
              tl.fromTo(
                progressBarRef.current,
                { width: '0%' },
                { width: '100%', duration: 1, ease: 'none' },
                0,
              )
              tl.fromTo(
                proxy,
                { value: 0 },
                {
                  value: 100,
                  duration: 1,
                  ease: 'none',
                  onUpdate: () => {
                    if (progressNumberRef.current) {
                      progressNumberRef.current.textContent = `${Math.round(proxy.value)}`
                    }
                  },
                },
                0,
              )
            }

            // 0–0.18: Header fades out early in the scroll
            if (headerRef.current) {
              tl.to(headerRef.current, { opacity: 0, duration: 0.18, ease: 'none' }, 0)
            }

            return () => {
              tl.kill()
            }
          },
        )
      }, sectionRef)

      return () => ctx.revert()
    })

    return () => cancelAnimationFrame(raf)
  }, [ready])

  // Marquee text content (repeated for seamless loop)
  const row1Text = Array(15).fill('ANTONIO').join('\u2003\u2003')
  const row2Text = Array(15).fill('JERKOVIC').join('\u2003\u2003')

  return (
    <>
    <section
      ref={sectionRef}
      data-theme="dark"
      data-trail-zone
      className="fixed top-0 left-0 h-screen w-full overflow-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Layer 1: Dark background with morphing blob outlines */}
      <IsometricBackground variant="dark" />

      {/* Layer 2: Marquee text bands — BELOW center on mobile, centered on desktop */}
      <div className="absolute inset-x-0 bottom-[5%] md:top-0 md:right-0 md:bottom-0 md:left-0 flex flex-col items-center justify-end md:justify-center gap-0">
        <div
          ref={marqueeRow1Ref}
          className="w-full overflow-hidden whitespace-nowrap opacity-0"
        >
          <div
            className="inline-block uppercase italic"
            style={{
              fontFamily: 'var(--font-serif-display), serif',
              fontSize: 'clamp(3rem, 9vw, 8rem)',
              letterSpacing: '0.02em',
              color: '#60a5fa',
              textShadow: '0 0 10px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.3)',
              animation: 'marquee-left 150s linear infinite',
            }}
          >
            {row1Text}
            {'\u2003\u2003'}
            {row1Text}
          </div>
        </div>

        <div
          ref={marqueeRow2Ref}
          className="w-full overflow-hidden whitespace-nowrap opacity-0"
        >
          <div
            className="inline-block uppercase italic"
            style={{
              fontFamily: 'var(--font-serif-display), serif',
              fontSize: 'clamp(3rem, 9vw, 8rem)',
              letterSpacing: '0.02em',
              color: '#ffffff',
              animation: 'marquee-right 150s linear infinite',
            }}
          >
            {row2Text}
            {'\u2003\u2003'}
            {row2Text}
          </div>
        </div>
      </div>

      {/* Layer 3: Image card — cream bg rectangle with portrait, scales down on scroll */}
      <div ref={cardWrapRef} className="absolute inset-0">
        <div
          ref={imageCardRef}
          className="relative h-full w-full overflow-hidden"
          style={{
            backgroundColor: '#f2ede8',
          }}
        >
          {/* Morphing blob shapes on cream background */}
          <IsometricBackground />

          {/* Portrait image — wrapped for counter-zoom + desaturation */}
          <div
            ref={imageInnerRef}
            className="absolute inset-0"
            style={{ transformOrigin: 'center 45%' }}
          >
            <Image
              src="/images/diffuse.webp"
              alt="Antonio Jerkovic"
              fill
              priority
              className="object-cover object-[center_35%] md:object-contain md:object-bottom"
              sizes="100vw"
            />
          </div>

        </div>
      </div>

      {/* Layer 4: Signature — outside the card so it can overflow, scales with card */}
      <div
        ref={signatureWrapRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="relative w-[105%] h-[105%]">
          <SignatureSVG ref={signatureRef} className="h-full w-full" />
        </div>
      </div>

      {/* Layer 5: Scroll progress bar — appears after signature finishes */}
      <div
        ref={progressBarWrapRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
      >
        <div
          style={{ width: '120px', height: '2px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '1px' }}
        >
          <div
            ref={progressBarRef}
            style={{ width: '0%', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '1px', transformOrigin: 'left' }}
          />
        </div>
        <span
          ref={progressNumberRef}
          className="text-xs tabular-nums"
          style={{ color: 'rgba(255,255,255,0.9)', minWidth: '2ch', textAlign: 'right' }}
        >
          0
        </span>
      </div>

      {/* Layer 6: Header — fades out on scroll */}
      <div ref={headerRef}>
        <Header heroVariant />
      </div>
    </section>
    <div ref={wrapperRef} style={{ height: '500vh' }} />
    </>
  )
}
