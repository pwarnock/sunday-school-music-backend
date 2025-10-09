# Landing Page Implementation - Part 7: Pricing Section

## Create Pricing Section Component

Create `frontend/src/components/landing/PricingSection.tsx`:
```tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const features = [
  '3 songs per account - forever free',
  'Full lyrics and music generation',
  'Download MP3 files',
  'Save songs to your library',
  'All Bible stories and themes',
  'No credit card required',
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-black mb-6 font-poppins">
            Start Creating{' '}
            <span className="gradient-text">Free Forever</span>
          </h2>
          <p className="text-xl text-landing-muted-foreground max-w-3xl mx-auto">
            Perfect for teachers who want to try AI-generated songs in their classroom. 
            No hidden fees, no time limits.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            {/* Badge */}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-landing-accent to-orange-500 text-landing-dark px-8 py-2 rounded-full font-extrabold text-sm shadow-lg">
                FREE FOREVER
              </div>
            </div>
            
            {/* Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-12 border-4 border-landing-primary shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-8">Free Plan</h3>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <span className="text-7xl font-black text-landing-primary">3</span>
                  <span className="text-2xl text-landing-muted-foreground font-semibold">
                    songs total
                  </span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-2xl mt-1">✅</span>
                    <span className="text-lg">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Link
                href="/signup"
                className="block w-full py-4 px-8 bg-gradient-to-r from-landing-primary to-landing-primary-dark text-white text-center font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Start Creating Now
              </Link>
              
              <p className="text-center text-sm text-landing-muted-foreground mt-6">
                No credit card required • Setup in 30 seconds
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-landing-muted-foreground mb-4">
            Need more songs? Contact us for custom plans.
          </p>
          <Link
            href="mailto:support@sundayschoolmusic.com"
            className="text-landing-primary hover:text-landing-primary-dark font-semibold text-lg transition-colors"
          >
            support@sundayschoolmusic.com
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
```

## Features:
- Single pricing card with "FREE FOREVER" badge
- Large "3" number display
- Animated feature list with checkmarks
- Gradient CTA button
- Contact information for custom plans
- Card scaling animation on view