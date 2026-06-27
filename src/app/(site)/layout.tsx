import { Suspense } from 'react'
import Preloader from '@/components/layout/Preloader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { ImageTrailCursor } from '@/components/ui/ImageTrailCursor'
import { ProjectTransitionProvider } from '@/contexts/ProjectTransitionContext'
import { TransitionOverlay } from '@/components/project/TransitionOverlay'
import { MenuProvider } from '@/contexts/MenuContext'
import { NavOverlay } from '@/components/layout/NavOverlay'
import PostHogProvider from '@/components/providers/PostHogProvider'
import PostHogPageview from '@/components/providers/PostHogPageview'
import LenisProvider from '@/components/providers/LenisProvider'


export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PostHogProvider>
      <LenisProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-white focus:no-underline"
        >
          Skip to main content
        </a>
        <Preloader />
        <Suspense fallback={null}>
          <PostHogPageview />
        </Suspense>
        <MenuProvider>
          <ProjectTransitionProvider>
            <CustomCursor />
            <PageWrapper>
              <main id="main-content" tabIndex={-1} className="min-h-screen">
                {children}
              </main>
            </PageWrapper>
            <NavOverlay />
            <ImageTrailCursor />
            <div id="transition-portal" />
            <TransitionOverlay />
          </ProjectTransitionProvider>
        </MenuProvider>
      </LenisProvider>
    </PostHogProvider>
  )
}
