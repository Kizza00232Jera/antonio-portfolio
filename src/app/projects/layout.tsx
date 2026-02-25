export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark-projects dark-projects-bg min-h-screen">
      <div className="relative z-10">{children}</div>
    </div>
  )
}
