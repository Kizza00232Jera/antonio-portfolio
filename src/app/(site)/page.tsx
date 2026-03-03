import { getFeaturedProjects, getLatestBlogPosts } from '@/lib/sanity/queries'
import { ThemeScope } from '@/components/providers/ThemeScope'
import HeroSection from '@/components/sections/HeroSection'
import JourneyIntroSection from '@/components/sections/JourneyIntroSection'
import JourneyAccordionSection from '@/components/sections/JourneyAccordionSection'
import ProjectsIntroSection from '@/components/sections/ProjectsIntroSection'
import ProjectShowcaseSection from '@/components/sections/ProjectShowcaseSection'
import TechStackSection from '@/components/sections/TechStackSection'
import LatestPostsSection from '@/components/sections/LatestPostsSection'
import ScrollSnap from '@/components/ui/ScrollSnap'

export default async function HomePage() {
  const [projects, posts] = await Promise.all([
    getFeaturedProjects(),
    getLatestBlogPosts(3),
  ])

  return (
    <div className="projects-theme projects-theme-bg">
      <ThemeScope className="projects-theme" />
      <ScrollSnap />
      <HeroSection />
      {/* Scroll spacers between sticky sections create "dwell time" —
          the pinned section covers the spacer while it scrolls behind,
          so nothing visual changes, but the user gets extra scroll
          distance before the next section slides up. */}
      <div aria-hidden className="h-[40vh]" />
      <JourneyIntroSection />
      <div aria-hidden className="h-[40vh]" />
      <JourneyAccordionSection />
      <div aria-hidden className="h-[40vh]" />
      <ProjectsIntroSection />
      <div aria-hidden className="h-[40vh]" />
      <ProjectShowcaseSection projects={projects} />
      <div aria-hidden className="h-[40vh]" />
      <TechStackSection />
      <div aria-hidden className="h-[40vh]" />
      <LatestPostsSection posts={posts} />
    </div>
  )
}
