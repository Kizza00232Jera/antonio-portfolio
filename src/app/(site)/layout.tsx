import { Suspense } from 'react'
import Preloader from '@/components/layout/Preloader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { ImageTrailCursor } from '@/components/ui/ImageTrailCursor'
import { ProjectTransitionProvider } from '@/contexts/ProjectTransitionContext'
import { TransitionOverlay } from '@/components/project/TransitionOverlay'
import { MenuProvider } from '@/contexts/MenuContext'
import { NavOverlay } from '@/components/layout/NavOverlay'
import { NavLabProvider, NavLabSwitcher } from '@/components/layout/navLab'
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
        <Preloader />
        <Suspense fallback={null}>
          <PostHogPageview />
        </Suspense>
        <MenuProvider>
          <NavLabProvider>
            <ProjectTransitionProvider>
              <CustomCursor />
              <PageWrapper>
                <main className="min-h-screen">
                  {children}
                </main>
              </PageWrapper>
              <NavOverlay />
              <ImageTrailCursor />
              <div id="transition-portal" />
              <TransitionOverlay />
              <NavLabSwitcher />
            </ProjectTransitionProvider>
          </NavLabProvider>
        </MenuProvider>
      </LenisProvider>
    </PostHogProvider>
  )
}
