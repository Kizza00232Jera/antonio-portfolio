import { getFeaturedProjects, getLatestBlogPosts } from '@/lib/sanity/queries'
import HeroSection from '@/components/sections/HeroSection'
import JourneyIntroSection from '@/components/sections/JourneyIntroSection'
import JourneyScrollSection from '@/components/sections/JourneyScrollSection'
import ProjectShowcaseSection from '@/components/sections/ProjectShowcaseSection'
import TechStackSection from '@/components/sections/TechStackSection'
import LatestPostsSection from '@/components/sections/LatestPostsSection'
import ScrollSnap from '@/components/ui/ScrollSnap'
import SectionReveal from '@/components/ui/SectionReveal'
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
      <ScrollSnap />
      <HeroSection />
      <JourneyIntroSection />
      <div aria-hidden className="h-[40vh]" />
      <JourneyScrollSection />
      <div aria-hidden className="h-[40vh]" />
      <ProjectShowcaseSection projects={projects} />
      <div aria-hidden className="h-[40vh]" />
      <TechStackSection />
      <div aria-hidden className="h-[40vh]" />
      <LatestPostsSection posts={posts} />
    </div>
  )
}
