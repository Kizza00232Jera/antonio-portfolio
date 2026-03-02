import { getFeaturedProjects, getLatestBlogPosts } from '@/lib/sanity/queries'
import { ThemeScope } from '@/components/providers/ThemeScope'
import HeroSection from '@/components/sections/HeroSection'
import JourneyIntroSection from '@/components/sections/JourneyIntroSection'
import JourneyAccordionSection from '@/components/sections/JourneyAccordionSection'
import ProjectsIntroSection from '@/components/sections/ProjectsIntroSection'
import ProjectShowcaseSection from '@/components/sections/ProjectShowcaseSection'
import TechStackSection from '@/components/sections/TechStackSection'
import LatestPostsSection from '@/components/sections/LatestPostsSection'

export default async function HomePage() {
  const [projects, posts] = await Promise.all([
    getFeaturedProjects(),
    getLatestBlogPosts(3),
  ])

  return (
    <div className="projects-theme projects-theme-bg">
      <ThemeScope className="projects-theme" />
      <HeroSection />
      <JourneyIntroSection />
      <JourneyAccordionSection />
      <ProjectsIntroSection />
      <ProjectShowcaseSection projects={projects} />
      <TechStackSection />
      <LatestPostsSection posts={posts} />
    </div>
  )
}
