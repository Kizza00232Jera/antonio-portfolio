import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import ThemeObserver from '@/components/providers/ThemeObserver'
import { BlogListClient } from '@/components/ui/BlogListClient'
import { getAllBlogPosts } from '@/lib/sanity/queries'

export const metadata: Metadata = {
  title: 'Blog | Antonio',
  description: 'Thoughts on development, design, and building for the web.',
}

export default async function BlogPage() {
  const posts = await getAllBlogPosts()

  return (
    <div data-theme="dark">
      <ThemeObserver />
      <Header />
      <section className="px-[clamp(1rem,3vw,3.5rem)] pt-[clamp(6rem,10vw,10rem)] pb-[clamp(3rem,6vw,6rem)]">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-text leading-none text-[length:var(--text-display)]">
            All blogs{' '}
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
      </section>
    </div>
  )
}
