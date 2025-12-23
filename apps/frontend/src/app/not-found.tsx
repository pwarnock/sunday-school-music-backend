'use client'

import Link from 'next/link'
import { Button } from '@sunday-school/ui'
import { Home, Music } from 'lucide-react'
import { useState } from 'react'

export default function NotFound() {
  const [videoError, setVideoError] = useState(false)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-lg w-full mx-auto p-8 text-center space-y-6">
        {/* Video with fallback */}
        <div className="relative w-full max-w-sm mx-auto rounded-lg overflow-hidden shadow-lg bg-muted/10 aspect-video">
          {!videoError ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onError={() => setVideoError(true)}
            >
              <source src="/404.mp4" type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/10">
              <div className="text-8xl font-bold text-muted-foreground/30">
                404
              </div>
            </div>
          )}
        </div>
        
        {/* Main heading */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">
            You&apos;re a Little Lost... But Not Forgotten
          </h1>
          
          <p className="text-muted-foreground">
            Just like the lost sheep in the parable, it&apos;s easy to wander off the path sometimes. 
            But don&apos;t worry—here, you&apos;re never truly lost.
          </p>
        </div>

        {/* Navigation */}
        <div className="space-y-4 pt-4">
          <p className="font-medium">
            Let us help you find your way back home.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                Head back to our Home Page
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <Music className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer message */}
        <div className="pt-8 max-w-md mx-auto">
          <p className="text-sm text-muted-foreground">
            Remember, just as the shepherd rejoices over the one lost sheep found, 
            we rejoice when you find what you need here. You matter to us, 
            and we&apos;re here to guide you every step of the way.
          </p>
        </div>
      </div>
    </div>
  )
}