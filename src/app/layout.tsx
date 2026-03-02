import type { Metadata } from 'next'
import { Zen_Old_Mincho, JetBrains_Mono, Marcellus } from 'next/font/google'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { SanityLive } from '@/lib/sanity/live'
import { DisableDraftMode } from '@/components/sanity/DisableDraftMode'
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
