# Landing Page Implementation - Part 6: How It Works Section

## Create How It Works Section Component

Create `frontend/src/components/landing/HowItWorksSection.tsx`:
```tsx
'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    number: '1',
    emoji: '📖',
    title: 'Choose Your Content',
    description: 'Select a Bible story, verse, or theme. Our AI understands hundreds of biblical narratives.',
    color: 'from-landing-primary to-landing-primary-dark',
  },
  {
    number: '2',
    emoji: '✏️',
    title: 'Customize Your Song',
    description: 'Add specific details, choose the mood, and specify age group. Make it perfect for your class.',
    color: 'from-landing-secondary to-blue-600',
  },
  {
    number: '3',
    emoji: '🎵',
    title: 'Generate Music',
    description: 'Our AI creates both lyrics and music. Get a complete song with professional audio quality.',
    color: 'from-purple-500 to-purple-700',
  },
  {
    number: '4',
    emoji: '🎉',
    title: 'Use in Class',
    description: 'Download your song and play it in Sunday School. Watch kids engage with God\'s Word through music!',
    color: 'from-landing-accent to-orange-500',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-black mb-6 font-poppins">
            Create Songs in{' '}
            <span className="gradient-text">4 Simple Steps</span>
          </h2>
          <p className="text-xl text-landing-muted-foreground max-w-3xl mx-auto">
            No musical experience needed. Our AI handles the complex parts 
            while you focus on your ministry.
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-landing-primary via-landing-secondary to-landing-accent opacity-30" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, index }: { step: typeof steps[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="text-center"
    >
      {/* Number circle */}
      <div className="relative inline-block mb-8">
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-5xl font-black shadow-xl`}>
          {step.number}
        </div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.5,
          }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} blur-xl opacity-50`}
        />
      </div>
      
      <span className="text-5xl block mb-4">{step.emoji}</span>
      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
      <p className="text-landing-muted-foreground leading-relaxed">
        {step.description}
      </p>
    </motion.div>
  )
}
```

## Features:
- 4-step process with numbered circles
- Gradient backgrounds for each step
- Connecting line between steps (desktop)
- Pulsing glow effects on circles
- Staggered entrance animations
- Responsive grid layout