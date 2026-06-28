import type { Metadata } from 'next'
import ThemeObserver from '@/components/providers/ThemeObserver'
import { BlogListClient } from '@/components/ui/BlogListClient'
import { getAllBlogPosts } from '@/lib/sanity/queries'
import { buildPageMetadata, titleWithName } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: titleWithName('Blog'),
  description:
    'Writing by Antonio Jerković on development, design, and building for the web.',
  path: '/blog',
})

export default async function BlogPage() {
  const posts = await getAllBlogPosts()

  return (
    <div data-theme="dark">
      <ThemeObserver />
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
