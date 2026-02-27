import { cn } from '@/utils/cn'

interface Tech {
  name: string
  category: string
  level: number
}

const TECH: Tech[] = [
  // Frontend
  { name: 'React', category: 'Frontend', level: 4 },
  { name: 'Next.js', category: 'Frontend', level: 4 },
  { name: 'TypeScript', category: 'Frontend', level: 4 },
  { name: 'Tailwind CSS', category: 'Frontend', level: 4 },
  { name: 'GSAP', category: 'Frontend', level: 3 },
  // Backend & Tooling
  { name: 'Node.js', category: 'Backend & Tooling', level: 3 },
  { name: 'Sanity.io', category: 'Backend & Tooling', level: 3 },
  { name: 'Git', category: 'Backend & Tooling', level: 4 },
  { name: 'Docker', category: 'Backend & Tooling', level: 2 },
  // Design & Workflow
  { name: 'Figma', category: 'Design & Workflow', level: 3 },
  { name: 'Vercel', category: 'Design & Workflow', level: 4 },
]

export default function TechStackSection() {
  return (
    <section className="mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]">
      <div className="mb-10">
        <p className="mb-3 font-mono text-sm text-text-muted uppercase tracking-widest">
          Toolbox
        </p>
        <h2
          className="font-heading font-bold text-text leading-tight text-[length:var(--text-display)]"
        >
          Technologies I use
        </h2>
      </div>

      <ul className="grid grid-cols-1 gap-4 list-none m-0 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {TECH.map((tech) => (
          <li
            key={tech.name}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-bg-alt p-5"
          >
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
              {tech.category}
            </p>

            <p className="font-heading font-semibold text-text leading-snug text-lg">
              {tech.name}
            </p>

            <div className="flex gap-1.5 mt-auto pt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    i < tech.level ? 'bg-accent' : 'bg-border'
                  )}
                  aria-hidden
                />
              ))}
              <span className="sr-only">{tech.level} out of 5</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
