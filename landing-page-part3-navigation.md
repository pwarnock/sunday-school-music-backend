# Landing Page Implementation - Part 3: Navigation Component

## Create Navigation Component

Create `frontend/src/components/landing/Navigation.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-3xl group-hover:scale-110 transition-transform">🎵</span>
            <span className="text-xl font-extrabold">Sunday School Music</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link 
              href="#features" 
              className="text-landing-muted-foreground hover:text-landing-primary transition-colors font-medium"
            >
              Features
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-landing-muted-foreground hover:text-landing-primary transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link 
              href="#pricing" 
              className="text-landing-muted-foreground hover:text-landing-primary transition-colors font-medium"
            >
              Pricing
            </Link>
            
            <div className="flex items-center gap-4 ml-4">
              <ThemeToggle />
              <Link 
                href="/login" 
                className="text-landing-dark hover:text-landing-primary transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-landing-primary to-landing-primary-dark text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started Free
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
```

## Features:
- Sticky navigation with blur effect on scroll
- Theme toggle integration
- Smooth scroll anchor links
- Mobile responsive design
- Gradient CTA button
- Logo with hover animation