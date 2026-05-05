import { getFeaturedProjects, getLatestBlogPosts } from '@/lib/sanity/queries'
import Header from '@/components/layout/Header'
import HeroSection from '@/components/sections/HeroSection'
import JourneyScrollSection from '@/components/sections/JourneyScrollSection'
import ProjectShowcaseSection from '@/components/sections/ProjectShowcaseSection'
import LatestPostsSection from '@/components/sections/LatestPostsSection'
import ContactSection from '@/components/sections/ContactSection'
import SectionTitle from '@/components/ui/SectionTitle'
import ThemeObserver from '@/components/providers/ThemeObserver'

export default async function HomePage() {
  const [projects, posts] = await Promise.all([
    getFeaturedProjects(),
    getLatestBlogPosts(6),
  ])

  return (
    <div>
      <ThemeObserver />
      <Header />
      <HeroSection />
      <SectionTitle title="MY JOURNEY" theme="light" />
      <JourneyScrollSection />
      <SectionTitle title="MY PROJECTS" theme="dark" />
      <ProjectShowcaseSection projects={projects} />
      <SectionTitle title="BLOGS" theme="dark" />
      <LatestPostsSection posts={posts} />
      <ContactSection />
    </div>
  )
}
