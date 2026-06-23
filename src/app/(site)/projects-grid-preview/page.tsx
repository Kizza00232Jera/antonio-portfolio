import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { ThemeScope } from '@/components/providers/ThemeScope'
import { getAllProjects } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { getThumbnailUrl } from '@/utils/project'

export const metadata: Metadata = {
  title: 'Projects (Grid Preview) | Antonio',
  robots: { index: false, follow: false },
}

// How many tech-stack chips before "+N"
const MAX_TECH = 4

export default async function ProjectsGridPreviewPage() {
  const projects = await getAllProjects()

  return (
    <div className="projects-theme min-h-dvh bg-bg">
      <ThemeScope className="projects-theme" />
      <Header />

      <main className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-10 md:pt-36">
        {/* Intro */}
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
            Grid preview &mdash; not your live page
          </p>
        </header>

        {/* Uniform grid: every cell identical, rows auto-align across columns */}
        <ul className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const thumb = getThumbnailUrl(project)
            const tech = project.techStackRefs ?? []
            const shownTech = tech.slice(0, MAX_TECH)
            const extraTech = tech.length - shownTech.length

            return (
              <li key={project._id} className="group flex flex-col">
                {/* IMAGE — fixed aspect ratio = perfect alignment across all cards */}
                <Link
                  href={`/projects/${project.slug.current}`}
                  className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-bg-alt"
                >
                  {thumb && (
                    <Image
                      src={thumb}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  )}
                </Link>

                {/* META — fixed order. Title sits at the same baseline in every
                    card because the image above is a fixed aspect ratio. */}
                <div className="mt-4 flex flex-1 flex-col">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-body text-lg font-medium leading-snug text-text">
                      <Link
                        href={`/projects/${project.slug.current}`}
                        className="hover:underline"
                      >
                        {project.title}
                      </Link>
                    </h2>
                    {project.tags?.[0] && (
                      <span className="shrink-0 font-ui text-[0.625rem] uppercase tracking-widest text-text-muted">
                        {project.tags[0].name}
                      </span>
                    )}
                  </div>

                  {project.tagline && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
                      {project.tagline}
                    </p>
                  )}

                  {tech.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                      {shownTech.map((t) => (
                        <span
                          key={t._id}
                          className="flex items-center gap-1.5 font-ui text-[0.7rem] text-text-muted"
                          title={t.name}
                        >
                          {t.icon && (
                            <Image
                              src={urlFor(t.icon).width(20).height(20).url()}
                              alt={t.name}
                              width={16}
                              height={16}
                              className="h-4 w-4 object-contain"
                            />
                          )}
                          {t.name}
                        </span>
                      ))}
                      {extraTech > 0 && (
                        <span className="font-ui text-[0.7rem] text-text-muted">
                          +{extraTech}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </main>
    </div>
  )
}
