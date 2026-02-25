import { ThemeScope } from '@/components/providers/ThemeScope'

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="projects-theme projects-theme-bg">
      <ThemeScope className="projects-theme" />
      <div className="relative">{children}</div>
    </div>
  )
}
