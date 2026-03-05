import type { Metadata } from 'next'
import { Syne, Bebas_Neue, DM_Sans, JetBrains_Mono, DM_Serif_Display } from 'next/font/google'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { SanityLive } from '@/lib/sanity/live'
import { DisableDraftMode } from '@/components/sanity/DisableDraftMode'
import './globals.css'

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: ['400'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400'],
})

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-serif-display',
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
      className={`${syne.variable} ${bebasNeue.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${dmSerifDisplay.variable}`}
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
