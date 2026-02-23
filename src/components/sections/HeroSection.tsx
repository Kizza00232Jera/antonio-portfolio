import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="mx-auto max-w-[var(--max-width)] px-6 pt-24 pb-[var(--section-gap)]">
      <div className="max-w-4xl">
        <p className="mb-4 font-mono text-sm text-text-muted uppercase tracking-widest">
          Designer &amp; Web Developer
        </p>

        <h1
          className="font-heading font-bold text-text leading-[1.05] mb-8"
          style={{ fontSize: 'var(--text-hero)' }}
        >
          Hi, I&apos;m Antonio.
          <br />
          <span className="text-accent">I build things</span>
          <br />
          for the web.
        </h1>

        <p className="font-body text-text-muted max-w-xl mb-10" style={{ fontSize: 'var(--text-body)', lineHeight: '1.7' }}>
          Designer turned developer. From Croatia to Denmark to Sweden —
          building interfaces that are fast, accessible, and a little bit delightful.
        </p>

        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/projects"
            className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            View my work
          </Link>
          <Link
            href="/blog"
            className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-text transition-colors hover:border-text"
          >
            Read the blog
          </Link>
        </div>
      </div>
    </section>
  )
}
