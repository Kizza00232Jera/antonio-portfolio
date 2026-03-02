import type { Metadata } from 'next'
import { Zen_Old_Mincho, JetBrains_Mono, Marcellus } from 'next/font/google'
import { Suspense } from 'react'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { SanityLive } from '@/lib/sanity/live'
import { DisableDraftMode } from '@/components/sanity/DisableDraftMode'
import Header from '@/components/layout/Header'

import Preloader from '@/components/layout/Preloader'
import { NavOverlay } from '@/components/layout/NavOverlay'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { MenuProvider } from '@/contexts/MenuContext'
import { ProjectTransitionProvider } from '@/contexts/ProjectTransitionContext'
import { TransitionOverlay } from '@/components/project/TransitionOverlay'
import PostHogProvider from '@/components/providers/PostHogProvider'
import PostHogPageview from '@/components/providers/PostHogPageview'
import LenisProvider from '@/components/providers/LenisProvider'
import './globals.css'

const zenOldMincho = Zen_Old_Mincho({
  variable: '--font-zen-old-mincho',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400'],
})

const marcellus = Marcellus({
  variable: '--font-marcellus',
  subsets: ['latin'],
  weight: ['400'],
})

export const metadata: Metadata = {
  title: "Antonio's Portfolio",
  description: 'Designer and web developer from Croatia, based in Sweden.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <html
      lang="en"
      className={`${zenOldMincho.variable} ${jetbrainsMono.variable} ${marcellus.variable}`}
    >
      <body className="antialiased">
        <PostHogProvider>
          <LenisProvider>
            <Preloader />
            <Suspense fallback={null}>
              <PostHogPageview />
            </Suspense>
            <ProjectTransitionProvider>
              <MenuProvider>
                <CustomCursor />
                <NavOverlay />
                <PageWrapper>
                  <main className="min-h-screen">
                    {children}
                  </main>
                </PageWrapper>
                <div id="transition-portal" />
                <Header />
              </MenuProvider>
              <TransitionOverlay />
            </ProjectTransitionProvider>
          </LenisProvider>
        </PostHogProvider>
        <SanityLive />
        {isDraftMode && (
          <>
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
      </body>
    </html>
  )
}
