import { ThemeScope } from '@/components/providers/ThemeScope'
import { ProjectTransitionProvider } from '@/contexts/ProjectTransitionContext'
import { TransitionOverlay } from '@/components/project/TransitionOverlay'

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProjectTransitionProvider>
      <div className="projects-theme projects-theme-bg">
        <ThemeScope className="projects-theme" />
        <div className="relative">{children}</div>
      </div>
      <TransitionOverlay />
    </ProjectTransitionProvider>
  )
}
