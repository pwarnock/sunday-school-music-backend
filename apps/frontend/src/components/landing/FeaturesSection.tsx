'use client'

import { motion } from 'framer-motion'

const features = [
  {
    icon: '🎯',
    title: 'Bible-Based Content',
    description: 'Every song is grounded in Scripture, ensuring theologically sound and age-appropriate content for your Sunday School.',
  },
  {
    icon: '⚡',
    title: 'Instant Generation',
    description: 'Create complete songs with lyrics and music in under 2 minutes. No waiting, no complicated processes.',
  },
  {
    icon: '🎨',
    title: 'Customizable Themes',
    description: 'Tailor songs to your lesson themes, special occasions, or specific Bible verses. Perfect for any curriculum.',
  },
  {
    icon: '🎵',
    title: 'Professional Quality',
    description: 'AI-generated music that sounds great. Download MP3 files ready to play in your classroom.',
  },
  {
    icon: '👶',
    title: 'Age Appropriate',
    description: 'Songs designed specifically for children, with simple melodies and easy-to-remember lyrics.',
  },
  {
    icon: '💾',
    title: 'Save & Organize',
    description: 'Build your own library of custom songs. Access them anytime, perfect for recurring lessons.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-black mb-6 font-poppins">
            Everything You Need to Create{' '}
            <span className="gradient-text">Amazing Songs</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform makes it easy to create engaging, 
            Bible-based songs that kids will love to sing.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 h-full border border-gray-100 dark:border-gray-700 hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
        {/* Gradient border on hover */}
        <div className="absolute inset-0 rounded-3xl p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 rounded-3xl" style={{background: 'linear-gradient(to right, hsl(119.1667, 61.0169%, 53.7255%), hsl(208.8703, 95.9839%, 48.8235%))'}} />
          <div className="absolute inset-[2px] rounded-3xl bg-white dark:bg-gray-800" />
        </div>
        
        <div className="relative z-10">
          <span className="text-5xl block mb-6">{feature.icon}</span>
          <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
          <p className="text-gray-600 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}