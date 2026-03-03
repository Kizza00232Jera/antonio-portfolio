import ThemeObserver from '@/components/providers/ThemeObserver'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div data-theme="light" className="min-h-screen">
      <ThemeObserver />
      {children}
    </div>
  )
}
