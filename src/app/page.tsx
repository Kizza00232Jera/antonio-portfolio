import { getFeaturedProjects, getLatestBlogPosts } from '@/lib/sanity/queries'
import HeroSection from '@/components/sections/HeroSection'
import AboutPreviewSection from '@/components/sections/AboutPreviewSection'
import FeaturedProjectsSection from '@/components/sections/FeaturedProjectsSection'
import LatestPostsSection from '@/components/sections/LatestPostsSection'

export default async function HomePage() {
  const [projects, posts] = await Promise.all([
    getFeaturedProjects(),
    getLatestBlogPosts(3),
  ])

  return (
    <>
      <HeroSection />
      <AboutPreviewSection />
      <FeaturedProjectsSection projects={projects} />
      <LatestPostsSection posts={posts} />
    </>
  )
}
