import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import ThemeObserver from '@/components/providers/ThemeObserver'
import PortableTextRenderer from '@/components/sanity/PortableTextRenderer'
import { getBlogPostBySlug } from '@/lib/sanity/queries'
import { formatDateFull } from '@/utils/format'

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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div data-theme="dark">
      <ThemeObserver />
      <Header />
    <article className="px-[clamp(1rem,3vw,3.5rem)] pt-[clamp(6rem,10vw,10rem)] pb-[clamp(3rem,6vw,6rem)]">
      {/* Centered content column */}
      <div className="mx-auto max-w-4xl">

        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text transition-colors mb-10"
        >
          ← Back to blogs
        </Link>

        {/* Header — centered */}
        <header className="mb-12 text-center">
          <h1 className="font-heading font-bold text-text leading-tight mb-4 text-(length:--text-display)">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-text-muted">
            {post.publishedAt && (
              <time className="font-ui" dateTime={post.publishedAt}>
                {formatDateFull(post.publishedAt)}
              </time>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-3 py-0.5 font-ui text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {post.excerpt && (
            <p className="mt-6 text-text-muted leading-relaxed text-(length:--text-body)">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Body */}
        {post.body && (
          <div>
            <PortableTextRenderer value={post.body} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
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

        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-ui text-text-muted uppercase tracking-widest mb-2">
              Related posts
            </p>
            <ul className="list-none m-0 p-0 flex flex-col gap-2">
              {post.relatedPosts.map((related) => (
                <li key={related._id}>
                  <Link
                    href={`/blog/${related.slug.current}`}
                    className="group inline-flex items-center gap-2 text-text hover:text-accent transition-colors"
                  >
                    <span className="font-heading font-semibold">
                      {related.title}
                    </span>
                    <span className="text-text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                      ↗
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text transition-colors mt-8"
        >
          ← All blogs
        </Link>
        </footer>
      </div>{/* /max-w-4xl */}
    </article>
    </div>
  )
}
