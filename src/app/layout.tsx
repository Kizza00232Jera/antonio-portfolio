import type { Metadata } from 'next'
import { Zen_Old_Mincho, JetBrains_Mono } from 'next/font/google'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'

import Preloader from '@/components/layout/Preloader'
import { NavOverlay } from '@/components/layout/NavOverlay'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { MenuProvider } from '@/contexts/MenuContext'
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

export const metadata: Metadata = {
  title: "Antonio's Portfolio",
  description: 'Designer and web developer from Croatia, based in Sweden.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${zenOldMincho.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased bg-[#151515]">
        <PostHogProvider>
          <LenisProvider>
            <Preloader />
            <Suspense fallback={null}>
              <PostHogPageview />
            </Suspense>
            <MenuProvider>
              <NavOverlay />
              <PageWrapper>
                <main className="min-h-screen">
                  {children}
                </main>
              </PageWrapper>
              <div id="transition-portal" />
              <Header />
            </MenuProvider>
          </LenisProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
