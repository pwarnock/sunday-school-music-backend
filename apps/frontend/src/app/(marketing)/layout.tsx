import type { Metadata } from 'next'
import { siteConfig } from '@sunday-school/lib'

export const metadata: Metadata = {
  title: `${siteConfig.name} - AI Songs for Children's Ministry`,
  description: 'Create engaging Bible-based songs for Sunday School in minutes. AI-powered tool generates lyrics and music. Perfect for teachers and children\'s ministry.',
  keywords: 'sunday school, children ministry, bible songs, christian music, AI music generator',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}