import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import ThemeObserver from '@/components/providers/ThemeObserver'
import PortableTextRenderer from '@/components/sanity/PortableTextRenderer'
import { getBlogPostBySlug, getRelatedPosts } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { formatDateFull } from '@/utils/format'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  SITE,
  buildPageMetadata,
  titleWithName,
  blogPostingJsonLd,
  breadcrumbJsonLd,
} from '@/lib/seo'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

/** Build a 1200x630 social image from the post hero. */
function postOgImage(post: Awaited<ReturnType<typeof getBlogPostBySlug>>): string | undefined {
  if (!post) return undefined
  if (post.seo?.ogImageUrl) return post.seo.ogImageUrl
  if (post.heroImage) {
    return urlFor(post.heroImage).width(1200).height(630).fit('crop').quality(80).url()
  }
  return undefined
}

/** Smart-derived SEO for a blog post: explicit override, else title + excerpt. */
function postSeo(post: NonNullable<Awaited<ReturnType<typeof getBlogPostBySlug>>>) {
  return {
    title: post.seo?.metaTitle ?? titleWithName(post.title),
    description:
      post.seo?.metaDescription ?? post.excerpt ?? `${post.title}, written by ${SITE.name}.`,
    path: `/blog/${post.slug.current}`,
    image: postOgImage(post),
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return { title: 'Post not found' }
  }

  return buildPageMetadata({ ...postSeo(post), type: 'article', publishedTime: post.publishedAt })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const tagIds = post.tags?.map(t => t._id) ?? []
  const relatedPosts = await getRelatedPosts(slug, tagIds)

  const seo = postSeo(post)

  return (
    <div data-theme="dark">
      <JsonLd
        data={[
          blogPostingJsonLd({
            title: post.title,
            description: seo.description,
            path: seo.path,
            image: seo.image,
            datePublished: post.publishedAt,
          }),
          breadcrumbJsonLd([
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: seo.path },
          ]),
        ]}
      />
      <ThemeObserver />
      <Header />
      <article className="px-[clamp(1rem,3vw,3.5rem)] pt-[clamp(6rem,10vw,10rem)] pb-[clamp(3rem,6vw,6rem)]">
        <div className="mx-auto max-w-4xl">

          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-base font-medium text-text-muted hover:text-text transition-colors mb-10"
          >
            ← Back to blogs
          </Link>

          <header className="mb-12 text-center">
            <h1 className="font-heading font-bold text-text leading-tight mb-4 text-(length:--text-display)">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-base text-text-muted mt-4">
              {post.publishedAt && (
                <time className="font-ui" dateTime={post.publishedAt}>
                  {formatDateFull(post.publishedAt)}
                </time>
              )}
              {post.author && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-ui">By {post.author.name}</span>
                </>
              )}
              {post.author?.githubUrl && (
                <>
                  <span aria-hidden>·</span>
                  <a
                    href={post.author.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
                  >
                    GitHub ↗
                  </a>
                </>
              )}
              {post.author?.linkedinUrl && (
                <>
                  <span aria-hidden>·</span>
                  <a
                    href={post.author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
                  >
                    LinkedIn ↗
                  </a>
                </>
              )}
            </div>

            {post.tags && post.tags.filter(Boolean).length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {post.tags.filter(Boolean).map((tag) => (
                  <span
                    key={tag._id}
                    className="cursor-default rounded-full border border-border px-3.5 py-1 font-ui text-sm transition-colors hover:border-text/40 hover:bg-text/5"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {post.excerpt && (
              <p className="mt-6 text-lg md:text-xl text-text leading-relaxed">
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
              <h2 className="font-heading text-lg font-semibold text-text mb-6">Related posts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((rp) => (
                  <Link
                    key={rp._id}
                    href={`/blog/${rp.slug.current}`}
                    className="group flex flex-col border border-border rounded-lg overflow-hidden hover:border-accent transition-colors"
                  >
                    <div className="relative aspect-video bg-surface overflow-hidden">
                      {rp.heroImage ? (
                        <Image
                          src={urlFor(rp.heroImage).width(600).height(338).quality(80).url()}
                          alt={rp.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-raised" />
                      )}
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <p className="font-ui text-sm font-medium text-text leading-snug line-clamp-2">
                        {rp.title}
                      </p>
                      {rp.publishedAt && (
                        <time className="font-ui text-xs text-text-muted" dateTime={rp.publishedAt}>
                          {formatDateFull(rp.publishedAt)}
                        </time>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-16 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-4">
              {post.githubUrl && (
                <a
                  href={post.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
                >
                  View on GitHub ↗
                </a>
              )}
              {post.appUrl && (
                <a
                  href={post.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
                >
                  View live app ↗
                </a>
              )}
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-base font-medium text-text-muted hover:text-text transition-colors mt-8"
            >
              ← All blogs
            </Link>
          </footer>
        </div>
      </article>
    </div>
  )
}
