import Footer from '@/components/landing/Footer'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth check is now handled by individual components (e.g., Dashboard)
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  )
}
