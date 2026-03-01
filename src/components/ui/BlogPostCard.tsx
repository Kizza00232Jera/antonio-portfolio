import Link from 'next/link'
import { cn } from '@/utils/cn'
import type { BlogPost } from '@/lib/sanity/types'

interface BlogPostCardProps {
  post: BlogPost
  className?: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function BlogPostCard({ post, className }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className={cn(
        'group flex items-start justify-between gap-6 border-t border-border py-6 transition-colors hover:border-accent',
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <h3
          className="font-heading font-semibold text-text leading-snug group-hover:text-accent transition-colors"
          style={{ fontSize: 'clamp(1rem, 1.25vw, 1.25rem)' }}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
        {post.publishedAt && (
          <p className="font-ui text-xs text-text-muted mt-1">
            {formatDate(post.publishedAt)}
          </p>
        )}
      </div>

      <span
        className="mt-1 shrink-0 text-text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
        aria-hidden
      >
        ↗
      </span>
    </Link>
  )
}
