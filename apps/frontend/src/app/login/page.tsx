'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@sunday-school/lib'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Alert, AlertDescription, Button } from '@sunday-school/ui'
import ReCaptcha from '@/components/ReCaptcha'
import { siteConfig } from '@sunday-school/lib'
import { PageLayout } from '@/components/PageLayout'

export const dynamic = 'force-dynamic'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showResendOption, setShowResendOption] = useState(false)
  const [resendMessage, setResendMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [resendAttempts, setResendAttempts] = useState(0)
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupabase(createClient())
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShowResendOption(false)
    setResendMessage(null)

    if (!supabase) {
      alert('Client not initialized')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      // Show resend option for email not confirmed error
      if (error.message.includes('Email not confirmed')) {
        setShowResendOption(true)
        alert('Please confirm your email address. You can request a new confirmation email below.')
      } else {
        alert(error.message)
      }
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)

    if (!supabase) {
      alert('Client not initialized')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      alert(error.message)
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!supabase || resendAttempts >= 3) {
      setResendMessage({
        type: 'error',
        text: resendAttempts >= 3 ? 'Too many resend attempts. Please try again later.' : 'Client not initialized'
      })
      return
    }

    setResending(true)
    setResendMessage(null)

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend confirmation email')
      }

      setResendMessage({
        type: 'success',
        text: 'Confirmation email sent! Please check your inbox.'
      })
      setResendAttempts(prev => prev + 1)
    } catch (error) {
      setResendMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send confirmation email'
      })
    } finally {
      setResending(false)
    }
  }

  return (
    <PageLayout showFooter={false}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center mb-6">
              <div className="relative w-[250px] h-[141px]">
                <Image 
                  src="/logo.png" 
                  alt={`${siteConfig.name} - AI-Powered Sunday School Music`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Welcome back!
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground rounded-t-md focus:outline-none focus:ring-ring focus:border-ring focus:z-10 sm:text-sm bg-background"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground rounded-b-md focus:outline-none focus:ring-ring focus:border-ring focus:z-10 sm:text-sm bg-background"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex justify-center items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>

            {showResendOption && (
              <div className="mt-4 space-y-3">
                {resendMessage && (
                  <Alert className={resendMessage.type === 'success' ? 'border-green-500' : 'border-red-500'}>
                    <AlertDescription>{resendMessage.text}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resending || resendAttempts >= 3}
                  variant="outline"
                  className="w-full"
                >
                  {resending ? 'Sending...' : 'Resend confirmation email'}
                </Button>
              </div>
            )}

            <div className="text-center">
              <Link href="/signup" className="text-primary hover:text-primary/80">
                Don't have an account? Sign up
              </Link>
            </div>
          </form>

          {/* Footer Links */}
          <div className="text-center text-sm text-muted-foreground mt-8">
            <div className="flex justify-center space-x-6">
              <Link href="/about" className="hover:text-primary">About</Link>
              <Link href="/terms" className="hover:text-primary">Terms</Link>
              <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
