import { Suspense } from 'react'
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
  )
}
