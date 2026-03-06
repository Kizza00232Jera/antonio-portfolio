import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import { BlogListClient } from '@/components/ui/BlogListClient'
import { getAllBlogPosts } from '@/lib/sanity/queries'

export const metadata: Metadata = {
  title: 'Blog | Antonio',
  description: 'Thoughts on development, design, and building for the web.',
}

export default async function BlogPage() {
  const posts = await getAllBlogPosts()

  return (
    <section className="relative mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-text leading-none text-[length:var(--text-display)]">
          Blogs{' '}
          <span className="text-text-muted align-super" style={{ fontSize: '0.4em' }}>
            ({posts.length})
          </span>
        </h1>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-text-muted pt-6 border-t border-border">
          Posts coming soon.
        </p>
      ) : (
        <BlogListClient posts={posts} />
      )}
      <Header />
    </section>
  )
}
