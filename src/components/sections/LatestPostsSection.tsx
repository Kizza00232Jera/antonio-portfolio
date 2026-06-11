import Link from 'next/link'
import { BlogListClient } from '@/components/ui/BlogListClient'
import type { BlogPost } from '@/lib/sanity/types'

interface LatestPostsSectionProps {
  posts: BlogPost[]
}

export default function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  return (
    <section data-theme="dark" style={{ backgroundColor: '#0d0d0d' }} className="sticky top-0 min-h-screen md:max-h-screen md:overflow-hidden">
      <div className="px-[clamp(1.25rem,4vw,4rem)] py-[var(--section-gap)]">
      <div className="flex items-end justify-end gap-4 mb-6">
          <Link
            href="/blog"
            className="shrink-0 text-sm font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
          >
            <span className="hidden md:inline">All posts</span>
            <span className="md:hidden">Show all blogs</span>
          </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-text-muted pt-6 border-t border-border">Posts coming soon.</p>
      ) : (
        <BlogListClient posts={posts} mobileLimit={4} fitHeight />
      )}
      </div>
    </section>
  )
}
