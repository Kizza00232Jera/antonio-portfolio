import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import { ThemeScope } from '@/components/providers/ThemeScope'
import { getAllProjects } from '@/lib/sanity/queries'
import { BentoGridPreview } from '@/components/preview/BentoGridPreview'

export const metadata: Metadata = {
  title: 'Projects (Bento Preview) | Antonio',
  robots: { index: false, follow: false },
}

export default async function ProjectsBentoPreviewPage() {
  const projects = await getAllProjects()

  return (
    <div className="projects-theme min-h-dvh bg-bg">
      <ThemeScope className="projects-theme" />
      <Header />

      <main className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-10 md:pt-36">
        <header className="mb-12 md:mb-16">
          <h1
            className="font-heading font-bold uppercase leading-none text-text"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
          >
            Selected Work
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-text-muted">
            Every project is a journey. From the first spark of an idea to a
            polished product, with passion, precision, and a focus on building
            things that work beautifully.
          </p>
          <p className="mt-6 text-[0.7rem] uppercase tracking-widest text-text-muted">
            Bento preview (Direction B), not your live page
          </p>
        </header>

        <BentoGridPreview projects={projects} />
      </main>
    </div>
  )
}
