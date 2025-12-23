'use client'

import Link from 'next/link'
import { Button, ThemeToggle } from '@sunday-school/ui'
import { siteConfig } from '@sunday-school/lib'

export function SiteHeader() {
  return (
    <nav className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              🎵 {siteConfig.name}
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost">Back to App</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}