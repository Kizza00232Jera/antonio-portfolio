import type { Metadata } from 'next'
import { Bebas_Neue, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { SanityLive } from '@/lib/sanity/live'
import { DisableDraftMode } from '@/components/sanity/DisableDraftMode'
import { ScrollbarIndicator } from '@/components/ui/ScrollbarIndicator'
import { getSiteSettings } from '@/lib/sanity/queries'
import './globals.css'

const satoshi = localFont({
  src: [
    { path: '../../public/fonts/satoshi/satoshi-300.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/satoshi/satoshi-400.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/satoshi/satoshi-500.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/satoshi/satoshi-700.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/satoshi/satoshi-900.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: ['400'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400'],
})

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings()
  return {
    title: {
      default: siteSettings?.title ?? "Antonio's Portfolio",
      template: '%s | Antonio Jerkovic',
    },
    description: siteSettings?.description ?? 'Designer and web developer from Croatia, based in Sweden.',
    openGraph: siteSettings?.ogImageUrl
      ? { images: [siteSettings.ogImageUrl] }
      : undefined,
  }
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
      className={`${satoshi.variable} ${bebasNeue.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <ScrollbarIndicator />
        {children}
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
