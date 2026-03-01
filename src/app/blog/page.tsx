import type { Metadata } from 'next'
import BlogPostCard from '@/components/ui/BlogPostCard'
import { getAllBlogPosts } from '@/lib/sanity/queries'

export const metadata: Metadata = {
  title: 'Blog | Antonio',
  description: 'Thoughts on development, design, and building for the web.',
}

export default async function BlogPage() {
  const posts = await getAllBlogPosts()

  return (
    <section className="mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]">
      <div className="mb-10">
        <p className="mb-3 font-ui text-sm text-text-muted uppercase tracking-widest">
          Writing
        </p>
        <h1
          className="font-heading font-bold text-text leading-tight text-[length:var(--text-display)]"
        >
          All posts
        </h1>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-text-muted pt-6 border-t border-border">
          Posts coming soon.
        </p>
      ) : (
        <ul className="list-none m-0 p-0">
          {posts.map((post) => (
            <li key={post._id}>
              <BlogPostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
