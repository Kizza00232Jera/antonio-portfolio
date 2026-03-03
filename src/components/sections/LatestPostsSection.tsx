import Link from 'next/link'
import BlogPostCard from '@/components/ui/BlogPostCard'
import type { BlogPost } from '@/lib/sanity/types'

interface LatestPostsSectionProps {
  posts: BlogPost[]
}

export default function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  return (
    <section className="sticky top-0 min-h-screen projects-theme-bg">
      <div className="mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]">
      <div className="flex items-end justify-between gap-4 mb-2">
        <div>
          <p className="mb-3 font-ui text-sm text-text-muted uppercase tracking-widest">
            Writing
          </p>
          <h2
            className="font-heading font-bold text-text leading-tight text-[length:var(--text-display)]"
          >
            Latest posts
          </h2>
        </div>

        <Link
          href="/blog"
          className="shrink-0 text-sm font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
        >
          All posts →
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-text-muted pt-6 border-t border-border">Posts coming soon.</p>
      ) : (
        <ul className="list-none m-0 p-0">
          {posts.map((post) => (
            <li key={post._id}>
              <BlogPostCard post={post} />
            </li>
          ))}
        </ul>
      )}
      </div>
    </section>
  )
}
