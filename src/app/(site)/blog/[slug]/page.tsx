import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import PortableTextRenderer, { extractHeadings } from '@/components/sanity/PortableTextRenderer'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { LatestArticles } from '@/components/blog/LatestArticles'
import { RelatedArticles } from '@/components/blog/RelatedArticles'
import { getBlogPostBySlug, getLatestBlogPosts, getRelatedBlogPosts } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { estimateReadingTime } from '@/utils/readingTime'

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

  const [post, latestPosts, relatedPosts] = await Promise.all([
    getBlogPostBySlug(slug),
    getLatestBlogPosts(6),
    getRelatedBlogPosts(slug, 4),
  ])

  if (!post) {
    notFound()
  }

  const headings = post.body ? extractHeadings(post.body) : []
  const readingTime = post.body ? estimateReadingTime(post.body) : 1

  return (
    <article>
      {/* ── Hero image ── */}
      {post.heroImage?.asset && (
        <div className="relative h-[280px] sm:h-[360px] md:h-[440px] w-full overflow-hidden">
          <Image
            src={urlFor(post.heroImage).width(1920).height(600).quality(85).url()}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      {/* ── Main container ── */}
      <div className="mx-auto max-w-[var(--max-width)] px-6 py-10">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text transition-colors mb-8"
        >
          ← Back to blog
        </Link>

        {/* ── Header ── */}
        <header className="mb-10">
          <h1 className="font-heading font-bold text-text leading-tight mb-4 text-[length:var(--text-display)]">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
            {/* Author */}
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.image?.asset && (
                  <Image
                    src={urlFor(post.author.image).width(64).height(64).quality(80).url()}
                    alt={post.author.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                )}
                <span className="font-ui font-medium text-text">
                  {post.author.name}
                </span>
              </div>
            )}

            {/* Separator */}
            {post.author && <span className="text-border">·</span>}

            {/* Date */}
            {post.publishedAt && (
              <time className="font-ui" dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            )}

            <span className="text-border">·</span>

            {/* Reading time */}
            <span className="font-ui">{readingTime} min read</span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-0.5 font-ui text-xs text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* ── 3-column grid: TOC | Content | Latest ── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[200px_1fr] xl:grid-cols-[200px_1fr_240px]">
          {/* Left sidebar: Table of Contents */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents headings={headings} />
            </div>
          </div>

          {/* Center: Article body */}
          <div className="min-w-0">
            {post.body && (
              <div className="max-w-prose">
                <PortableTextRenderer value={post.body} />
              </div>
            )}

            {/* Footer */}
            <footer className="mt-16 max-w-prose">
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
                  <p className="text-xs font-ui text-text-muted uppercase tracking-widest mb-2">
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

            </footer>
          </div>

          {/* Right sidebar: Latest Articles */}
          <div className="hidden xl:block">
            <div className="sticky top-24">
              <LatestArticles posts={latestPosts} currentSlug={slug} />
            </div>
          </div>
        </div>

        {/* ── Related articles (bottom) ── */}
        {relatedPosts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-border">
            <RelatedArticles posts={relatedPosts} />
          </div>
        )}
      </div>
    </article>
  )
}
