import { getFeaturedProjects, getLatestBlogPosts } from '@/lib/sanity/queries'
import Header from '@/components/layout/Header'
import HeroSection from '@/components/sections/HeroSection'
import JourneyScrollSection from '@/components/sections/JourneyScrollSection'
import ProjectShowcaseSection from '@/components/sections/ProjectShowcaseSection'
import TechStackSection from '@/components/sections/TechStackSection'
import LatestPostsSection from '@/components/sections/LatestPostsSection'
import SectionReveal from '@/components/ui/SectionReveal'
import SectionTitle from '@/components/ui/SectionTitle'
import ThemeObserver from '@/components/providers/ThemeObserver'

export default async function HomePage() {
  const [projects, posts] = await Promise.all([
    getFeaturedProjects(),
    getLatestBlogPosts(30),
  ])

  return (
    <div>
      <ThemeObserver />
      <SectionReveal />
      <Header />
      <HeroSection />
      <SectionTitle title="MY JOURNEY" theme="light" />
      <JourneyScrollSection />
      <SectionTitle title="MY PROJECTS" theme="dark" />
      <ProjectShowcaseSection projects={projects} />
      <TechStackSection />
      <LatestPostsSection posts={posts} />
    </div>
  )
}
