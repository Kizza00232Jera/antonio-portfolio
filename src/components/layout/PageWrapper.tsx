export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div id="page-wrapper" className="relative min-h-screen">
      {children}
    </div>
  )
}
