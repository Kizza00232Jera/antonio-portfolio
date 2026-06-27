import type { Metadata } from 'next'
import { Bebas_Neue, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { SanityLive } from '@/lib/sanity/live'
import { DisableDraftMode } from '@/components/sanity/DisableDraftMode'
import { ScrollbarIndicator } from '@/components/ui/ScrollbarIndicator'
import { getSiteSettings } from '@/lib/sanity/queries'
import { SITE } from '@/lib/seo'
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

  // Sanity values win when present; otherwise fall back to the name-first
  // defaults. Both layers now agree, so there is no "which one does Google see".
  const title = siteSettings?.seo?.metaTitle ?? siteSettings?.title ?? SITE.defaultTitle
  const description =
    siteSettings?.seo?.metaDescription ?? siteSettings?.description ?? SITE.defaultDescription
  const ogImage = siteSettings?.seo?.ogImageUrl ?? siteSettings?.ogImageUrl

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: title,
      template: `%s | ${SITE.name}`,
    },
    description,
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    alternates: { canonical: SITE.url },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: SITE.locale,
      url: SITE.url,
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: SITE.twitterHandle,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
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
      suppressHydrationWarning
      className={`${satoshi.variable} ${bebasNeue.variable} ${jetbrainsMono.variable}`}
      // Paint the brand-dark background on the very first frame, before the
      // render-blocking CSS bundle arrives. Without this the browser shows
      // white until the CSS loads (the "white frames" in the PageSpeed filmstrip).
      style={{ backgroundColor: '#080c18' }}
    >
      <head>
        {/* Project images load from Sanity's CDN; preconnect saves the
            TLS/DNS round-trip when the first image is requested. */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
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
