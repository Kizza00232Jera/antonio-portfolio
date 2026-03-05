'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
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
              },
            })

            // 0–1: Image card shrinks
            if (isDesktop) {
              // Desktop: scale transform on the card
              if (imageCardRef.current) {
                tl.fromTo(
                  imageCardRef.current,
                  { scale: 1 },
                  { scale: 0.35, duration: 1, ease: 'none' },
                  0,
                )
              }
              // Desktop: counter-zoom — image zooms IN as card shrinks OUT
              if (imageInnerRef.current) {
                tl.fromTo(
                  imageInnerRef.current,
                  { scale: 1 },
                  { scale: 1.5, duration: 1, ease: 'none' },
                  0,
                )
              }
            } else {
              // Mobile: animate wrapper inset to change card size & aspect ratio
              // No transform on image — object-cover naturally re-crops, face stays undistorted
              if (cardWrapRef.current) {
                tl.fromTo(
                  cardWrapRef.current,
                  { top: '0%', right: '0%', bottom: '0%', left: '0%' },
                  { top: '36%', right: '13%', bottom: '29%', left: '13%', duration: 1, ease: 'none' },
                  0,
                )
              }
            }

            // 0.2–0.8: Marquee rows fade in
            if (marqueeRow1Ref.current) {
              tl.fromTo(
                marqueeRow1Ref.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.6, ease: 'none' },
                0.2,
              )
            }
            if (marqueeRow2Ref.current) {
              tl.fromTo(
                marqueeRow2Ref.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.6, ease: 'none' },
                0.25,
              )
            }

            // 0.5–0.9: Image desaturates and darkens
            if (imageInnerRef.current) {
              tl.fromTo(
                imageInnerRef.current,
                { filter: 'grayscale(0) brightness(1)' },
                { filter: 'grayscale(1) brightness(0.45)', duration: 0.4, ease: 'none' },
                0.5,
              )
            }

            // 0.5–0.9: Card background transitions from cream to dark blue
            if (imageCardRef.current) {
              tl.fromTo(
                imageCardRef.current,
                { backgroundColor: '#f2ede8' },
                { backgroundColor: '#1a2e4a', duration: 0.4, ease: 'none' },
                0.5,
              )
            }

            // 0–1: Signature wrapper scales with card
            if (signatureWrapRef.current) {
              if (isDesktop) {
                tl.fromTo(
                  signatureWrapRef.current,
                  { scale: 1 },
                  { scale: 0.35, duration: 1, ease: 'none' },
                  0,
                )
              } else {
                // Match card inset but slightly larger (signature overflows card)
                tl.fromTo(
                  signatureWrapRef.current,
                  { top: '0%', right: '0%', bottom: '0%', left: '0%' },
                  { top: '29%', right: '10%', bottom: '22%', left: '10%', duration: 1, ease: 'none' },
                  0,
                )
              }
            }

            // 0.55–1: Signature draws in
            if (signatureRef.current?.pathElement) {
              const len = signatureRef.current.totalLength
              tl.fromTo(
                signatureRef.current.pathElement,
                { strokeDashoffset: len },
                { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' },
                0.55,
              )
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
    <div ref={wrapperRef} className="relative" style={{ height: '350vh' }}>
    <section
      ref={sectionRef}
      data-theme="dark"
      className="sticky top-0 h-screen w-full overflow-hidden"
      style={{ backgroundColor: '#102747' }}
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
    </section>
    </div>
  )
}
