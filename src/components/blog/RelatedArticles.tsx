import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/lib/sanity/types'
import { urlFor } from '@/lib/sanity/image'

interface RelatedArticlesProps {
  posts: BlogPost[]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (posts.length === 0) return null

  return (
    <section aria-label="Related articles">
      <h2 className="mb-6 font-heading text-xl font-bold text-text">
        More articles
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug.current}`}
            className="group block overflow-hidden rounded-lg border border-border transition-colors hover:border-accent"
          >
            {post.heroImage?.asset && (
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={urlFor(post.heroImage).width(600).height(338).quality(80).url()}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-heading text-base font-semibold text-text leading-snug group-hover:text-accent transition-colors line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-2 text-sm text-text-muted leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              {post.publishedAt && (
                <p className="mt-2 font-ui text-xs text-text-muted">
                  {formatDate(post.publishedAt)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
