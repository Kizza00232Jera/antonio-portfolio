import { ThemeScope } from '@/components/providers/ThemeScope'

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="projects-theme projects-theme-bg h-dvh overflow-hidden">
      <ThemeScope className="projects-theme" />
      <div className="relative h-full">{children}</div>
    </div>
  )
}
