import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PostHogProvider from '@/components/providers/PostHogProvider'
import PostHogPageview from '@/components/providers/PostHogPageview'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['600', '700'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500'],
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
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageview />
          </Suspense>
          <Header />
          <main id="page-wrapper" className="min-h-screen" style={{ transformStyle: 'preserve-3d' }}>
            {children}
          </main>
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  )
}
