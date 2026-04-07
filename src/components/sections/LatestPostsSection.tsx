import Link from 'next/link'
import { BlogListClient } from '@/components/ui/BlogListClient'
import type { BlogPost } from '@/lib/sanity/types'

interface LatestPostsSectionProps {
  posts: BlogPost[]
}

export default function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  return (
    <section data-theme="dark" className="sticky top-0 min-h-screen max-h-screen overflow-hidden">
      <div className="mx-auto max-w-(--max-width) px-6 py-(--section-gap)">
        <div className="flex items-center justify-end mb-6">
          <Link
            href="/blog"
            className="shrink-0 text-sm font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
          >
            View all posts →
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-text-muted pt-6 border-t border-border">Posts coming soon.</p>
        ) : (
          <BlogListClient posts={posts} mobileLimit={6} />
        )}
      </div>
    </section>
  )
}
