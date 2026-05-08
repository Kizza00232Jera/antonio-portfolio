import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import ThemeObserver from '@/components/providers/ThemeObserver'
import PortableTextRenderer from '@/components/sanity/PortableTextRenderer'
import { getBlogPostBySlug, getRelatedPosts } from '@/lib/sanity/queries'
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

  const tagIds = post.tags?.map(t => t._id) ?? []
  const relatedPosts = await getRelatedPosts(slug, tagIds)

  return (
    <div data-theme="dark">
      <ThemeObserver />
      <Header />
      <article className="px-[clamp(1rem,3vw,3.5rem)] pt-[clamp(6rem,10vw,10rem)] pb-[clamp(3rem,6vw,6rem)]">
        <div className="mx-auto max-w-4xl">

          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text transition-colors mb-10"
          >
            ← Back to blogs
          </Link>

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

              {post.author && (
                <span className="font-ui">By {post.author.name}</span>
              )}

              {post.tags && post.tags.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {post.tags.filter(Boolean).map((tag) => (
                    <span
                      key={tag._id}
                      className="rounded-full border border-border px-3 py-0.5 font-ui text-xs"
                    >
                      {tag.name}
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

          {post.body && (
            <div>
              <PortableTextRenderer value={post.body} />
            </div>
          )}

          {relatedPosts.length > 0 && (
            <section className="mt-16 pt-8 border-t border-border">
              <h2 className="font-heading text-lg font-semibold text-text mb-4">Related posts</h2>
              <ul className="flex flex-col gap-2">
                {relatedPosts.map((rp) => (
                  <li key={rp._id}>
                    <Link
                      href={`/blog/${rp.slug.current}`}
                      className="text-sm font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
                    >
                      {rp.title} ↗
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
              {post.author?.githubUrl && (
                <a
                  href={post.author.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
                >
                  GitHub ↗
                </a>
              )}
              {post.author?.linkedinUrl && (
                <a
                  href={post.author.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
                >
                  LinkedIn ↗
                </a>
              )}
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text transition-colors mt-8"
            >
              ← All blogs
            </Link>
          </footer>
        </div>
      </article>
    </div>
  )
}
