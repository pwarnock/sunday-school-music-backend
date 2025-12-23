'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@sunday-school/ui'
import { siteConfig } from '@sunday-school/lib'

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
          <Link href="/" className="flex items-center group">
            <div className="relative w-[200px] h-[113px] lg:w-[200px] lg:h-[113px] md:w-[150px] md:h-[84px] group-hover:scale-105 transition-transform">
              <Image 
                src="/images/logo-200.png" 
                alt={`${siteConfig.name} - AI-Powered Sunday School Music`}
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <            Link 
              href="#features" 
              className="text-gray-600 hover:text-green-500 transition-colors font-medium"
            >
              Features
            </Link>
            <            Link 
              href="#how-it-works" 
              className="text-gray-600 hover:text-green-500 transition-colors font-medium"
            >
              How It Works
            </Link>
            <            Link 
              href="#pricing" 
              className="text-gray-600 hover:text-green-500 transition-colors font-medium"
            >
              Pricing
            </Link>
            
            <div className="flex items-center gap-4 ml-4">
              <ThemeToggle />
              <              Link 
                href="/login" 
                className="text-gray-700 hover:text-green-500 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                style={{background: 'linear-gradient(to right, hsl(119.1667, 61.0169%, 53.7255%), hsl(142.0859, 70.5628%, 45.2941%))'}}
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