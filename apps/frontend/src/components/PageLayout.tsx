import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { siteConfig } from '@sunday-school/lib'

interface PageLayoutProps {
  children: React.ReactNode
  showFooter?: boolean
}

export function PageLayout({ children, showFooter = true }: PageLayoutProps) {
  return (
    <div className="flex-1 theme-gradient">
      <SiteHeader />
      
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}