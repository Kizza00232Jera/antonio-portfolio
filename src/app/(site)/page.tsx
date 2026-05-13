import { getFeaturedProjects, getSiteSettings } from '@/lib/sanity/queries'
import Header from '@/components/layout/Header'
import HeroSection from '@/components/sections/HeroSection'
import JourneyScrollSection from '@/components/sections/JourneyScrollSection'
import ProjectShowcaseSection from '@/components/sections/ProjectShowcaseSection'
import ContactSection from '@/components/sections/ContactSection'
import SectionTitle from '@/components/ui/SectionTitle'
import ThemeObserver from '@/components/providers/ThemeObserver'
import { HashScrollHandler } from '@/components/providers/HashScrollHandler'

export default async function HomePage() {
  const [projects, siteSettings] = await Promise.all([
    getFeaturedProjects(),
    getSiteSettings(),
  ])

  const author = siteSettings?.author

  return (
    <div>
      <ThemeObserver />
      <HashScrollHandler />
      <Header />
      <HeroSection />
      <SectionTitle title="MY JOURNEY" theme="light" />
      <JourneyScrollSection />
      <SectionTitle title="MY PROJECTS" theme="dark" />
      <ProjectShowcaseSection projects={projects} />
      <ContactSection
        phoneCroatian={author?.phoneCroatian}
        phoneSwedish={author?.phoneSwedish}
        email={author?.email}
        linkedinUrl={author?.linkedinUrl}
        githubUrl={author?.githubUrl}
      />
    </div>
  )
}
