import Link from 'next/link'

const journey = [
  {
    label: 'Croatia',
    text: 'Where it started. Grew up curious about how digital things worked — started pulling websites apart to see what made them tick.',
  },
  {
    label: 'Denmark',
    text: 'Moved to Aalborg to study Medialogy. Spent three years at the intersection of design, code, and human experience. Learned that the best products come from understanding both sides.',
  },
  {
    label: 'Sweden',
    text: 'Now based in Stockholm, deepening the web development side. Building with Next.js, TypeScript, and whatever makes the end result faster and more enjoyable to use.',
  },
]

export default function AboutPreviewSection() {
  return (
    <section className="mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
        {/* Left — label + heading */}
        <div>
          <p className="mb-3 font-mono text-sm text-text-muted uppercase tracking-widest">
            About
          </p>
          <h2
            className="font-heading font-bold text-text leading-tight"
            style={{ fontSize: 'var(--text-display)' }}
          >
            Croatia → Denmark → Sweden
          </h2>
        </div>

        {/* Right — journey steps */}
        <div className="flex flex-col gap-10">
          {journey.map(({ label, text }) => (
            <div key={label} className="border-t border-border pt-6">
              <p className="mb-2 font-mono text-xs text-accent uppercase tracking-widest">
                {label}
              </p>
              <p className="font-body text-text-muted" style={{ fontSize: 'var(--text-body)', lineHeight: '1.7' }}>
                {text}
              </p>
            </div>
          ))}

          <Link
            href="/about"
            className="self-start text-sm font-medium text-text underline underline-offset-4 decoration-border hover:decoration-accent transition-colors"
          >
            Full story →
          </Link>
        </div>
      </div>
    </section>
  )
}
