# Landing Page Implementation - Part 4: Hero Section Component

## Create Hero Section Component

Create `frontend/src/components/landing/HeroSection.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center relative pt-24 bg-gradient-to-b from-landing-primary/10 via-landing-light to-white dark:from-landing-primary/5 dark:via-gray-900 dark:to-black">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-landing-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-landing-secondary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6 font-poppins">
              Create Epic Songs for{' '}
              <span className="gradient-text">Sunday School</span>
            </h1>
            <p className="text-xl text-landing-muted-foreground mb-8 leading-relaxed">
              Transform any Bible story into engaging, memorable songs with AI. 
              Complete with lyrics and music. No musical experience needed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-landing-primary to-landing-primary-dark rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                🚀 Start Creating Free
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-landing-dark dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-landing-primary hover:text-landing-primary transition-all duration-200"
              >
                See How It Works
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🎵</span>
                <div>
                  <div className="text-sm text-landing-muted-foreground">Songs Created</div>
                  <div className="text-xl font-bold">1,000+</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">⭐</span>
                <div>
                  <div className="text-sm text-landing-muted-foreground">Happy Teachers</div>
                  <div className="text-xl font-bold">500+</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Demo Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <DemoCard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function DemoCard() {
  return (
    <div className="relative">
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, -1, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-2xl font-bold mb-6">Create Your First Song</h3>
        
        <div className="space-y-4">
          <StepItem
            icon="📖"
            title="Choose a Bible Story"
            description="Noah's Ark, David & Goliath, etc."
            bgColor="bg-blue-50 dark:bg-blue-900/20"
          />
          <StepItem
            icon="✨"
            title="AI Creates Lyrics"
            description="Age-appropriate and engaging"
            bgColor="bg-green-50 dark:bg-green-900/20"
          />
          <StepItem
            icon="🎵"
            title="Generate Music"
            description="Professional quality audio"
            bgColor="bg-purple-50 dark:bg-purple-900/20"
          />
          <StepItem
            icon="🎉"
            title="Share & Sing!"
            description="Download and use in class"
            bgColor="bg-yellow-50 dark:bg-yellow-900/20"
          />
        </div>
      </motion.div>
    </div>
  )
}

function StepItem({ icon, title, description, bgColor }: {
  icon: string
  title: string
  description: string
  bgColor: string
}) {
  return (
    <div className={`${bgColor} rounded-2xl p-4 flex items-center gap-4 hover:translate-x-2 transition-transform`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-landing-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
```

## Features:
- Animated hero text and demo card
- Floating demo card with 4-step process
- Gradient background with decorative blurs
- Interactive step items with hover effects
- Statistics display
- Dark mode support