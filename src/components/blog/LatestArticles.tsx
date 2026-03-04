import Link from 'next/link'
import type { BlogPost } from '@/lib/sanity/types'

interface LatestArticlesProps {
  posts: BlogPost[]
  currentSlug: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function LatestArticles({ posts, currentSlug }: LatestArticlesProps) {
  const filtered = posts.filter((p) => p.slug.current !== currentSlug).slice(0, 5)

  if (filtered.length === 0) return null

  return (
    <aside aria-label="Latest articles" className="hidden xl:block">
      <p className="mb-3 font-ui text-xs uppercase tracking-widest text-text-muted">
        Latest articles
      </p>
      <ul className="space-y-4">
        {filtered.map((post) => (
          <li key={post._id} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <Link
              href={`/blog/${post.slug.current}`}
              className="group block"
            >
              <p className="text-sm font-medium text-text leading-snug group-hover:text-accent transition-colors line-clamp-2">
                {post.title}
              </p>
              {post.publishedAt && (
                <p className="mt-1 font-ui text-xs text-text-muted">
                  {formatDate(post.publishedAt)}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
