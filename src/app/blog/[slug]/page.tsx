import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PortableTextRenderer from '@/components/sanity/PortableTextRenderer'
import { getBlogPostBySlug } from '@/lib/sanity/queries'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return { title: 'Post not found' }
  }

  return {
    title: `${post.title} | Antonio`,
    description: post.excerpt ?? 'A blog post by Antonio.',
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text transition-colors mb-10"
      >
        ← Back to blog
      </Link>

      {/* Header */}
      <header className="mb-12">
        <h1
          className="font-heading font-bold text-text leading-tight mb-4 text-[length:var(--text-display)]"
        >
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
          {post.publishedAt && (
            <time className="font-mono" dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-0.5 font-mono text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {post.excerpt && (
          <p
            className="mt-6 text-text-muted leading-relaxed text-[length:var(--text-body)]"
          >
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Body */}
      {post.body && (
        <div className="mx-auto max-w-3xl">
          <PortableTextRenderer value={post.body} />
        </div>
      )}

      {/* Footer */}
      <footer className="mx-auto max-w-3xl mt-16 pt-8 border-t border-border">
        <div className="flex flex-wrap gap-4">
          {post.githubUrl && (
            <a
              href={post.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
            >
              View on GitHub ↗
            </a>
          )}
          {post.appUrl && (
            <a
              href={post.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
            >
              View live app ↗
            </a>
          )}
        </div>

        {post.relatedProject && (
          <div className="mt-6">
            <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">
              Related project
            </p>
            <Link
              href={`/projects/${post.relatedProject.slug.current}`}
              className="group inline-flex items-center gap-2 text-text hover:text-accent transition-colors"
            >
              <span className="font-heading font-semibold">
                {post.relatedProject.title}
              </span>
              {post.relatedProject.tagline && (
                <span className="text-sm text-text-muted">
                  — {post.relatedProject.tagline}
                </span>
              )}
              <span className="text-text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </Link>
          </div>
        )}

        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text transition-colors mt-8"
        >
          ← All posts
        </Link>
      </footer>
    </article>
  )
}
