# 🚀 Resend Auth Email Feature - Implementation Plan

## Overview
Implement a feature to resend confirmation emails for users who have registered but not yet confirmed their email addresses. This will be integrated into the login flow and support both email confirmation and password reset emails.

## Feature Requirements
1. **Email Confirmation Strategy**: Enable email confirmation for new signups + password resets
2. **User Experience**: Show "Resend Email" option on login page when user tries to login with unconfirmed email
3. **Rate Limiting**: Use Supabase's built-in rate limiting
4. **Error Handling**: 
   - Email already confirmed: Don't reveal, proceed with normal login error
   - Email doesn't exist: Show generic "Check your email" message
   - Rate limit exceeded: Show clear message with retry time
   - Network/server errors: User-friendly error with retry option
5. **Security**: CAPTCHA after 5 attempts
6. **Implementation**: Use Supabase's built-in `resend` method
7. **UI Flow**: User tries to login → Gets "unconfirmed" error → Shows resend option
8. **Analytics**: Track resend attempts, success/failure rates, timing

## Implementation Steps

### 1. Enable Email Confirmations in Supabase Config

**File: `supabase/config.toml`**
```toml
[auth.email]
enable_confirmations = true  # Change from false to true
```

### 2. Database Schema Updates

Create a migration to track resend attempts:

**File: `supabase/migrations/[timestamp]_add_email_resend_tracking.sql`**
```sql
-- Create table to track email resend attempts
CREATE TABLE IF NOT EXISTS public.email_resend_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('confirmation', 'password_reset')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_email_resend_attempts_email_created 
ON email_resend_attempts(email, created_at DESC);

-- Create index for rate limiting checks
CREATE INDEX idx_email_resend_attempts_email_type_created 
ON email_resend_attempts(email, attempt_type, created_at DESC);

-- RLS policies
ALTER TABLE email_resend_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (for security)
CREATE POLICY "Service role can insert resend attempts" 
ON email_resend_attempts 
FOR INSERT 
TO service_role 
USING (true);

-- Service role can read all attempts
CREATE POLICY "Service role can read resend attempts" 
ON email_resend_attempts 
FOR SELECT 
TO service_role 
USING (true);
```

### 3. Update Login Component

**File: `frontend/src/app/login/page.tsx`**

Add state and logic to handle unconfirmed email errors:

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showResendOption, setShowResendOption] = useState(false)
  const [resendMessage, setResendMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [resendAttempts, setResendAttempts] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShowResendOption(false)
    setResendMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Check if error is due to unconfirmed email
      if (error.message.includes('Email not confirmed') || 
          error.status === 400 && error.message.includes('confirm')) {
        setShowResendOption(true)
        setResendMessage({
          type: 'error',
          text: 'Please confirm your email address before signing in. Check your inbox or click below to resend.'
        })
      } else {
        alert(error.message)
      }
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  const handleResendConfirmation = async () => {
    setResending(true)
    setResendMessage(null)

    // Call the API route to resend confirmation
    const response = await fetch('/api/auth/resend-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        type: 'confirmation',
        attempts: resendAttempts 
      })
    })

    const data = await response.json()

    if (response.ok) {
      setResendMessage({
        type: 'success',
        text: data.message || 'Confirmation email sent! Please check your inbox.'
      })
      setResendAttempts(prev => prev + 1)
    } else {
      setResendMessage({
        type: 'error',
        text: data.error || 'Failed to resend confirmation email. Please try again later.'
      })
    }

    setResending(false)
  }

  // ... rest of the component with updated UI
}
```

### 4. Create API Route for Resending Emails

**File: `frontend/src/app/api/auth/resend-confirmation/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, type, attempts } = await request.json()
    
    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      )
    }

    // Get request metadata for tracking
    const headersList = headers()
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    const supabase = await createClient()

    // Check if we need CAPTCHA (after 5 attempts)
    if (attempts >= 5) {
      // Return that CAPTCHA is required
      return NextResponse.json(
        { error: 'Too many attempts. Please complete the CAPTCHA.', requiresCaptcha: true },
        { status: 429 }
      )
    }

    // Use Supabase's built-in resend method
    if (type === 'confirmation') {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        // Check for rate limit error
        if (error.status === 429) {
          return NextResponse.json(
            { error: 'Too many requests. Please wait a few minutes before trying again.' },
            { status: 429 }
          )
        }
        
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    } else if (type === 'password_reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      })

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    // Track the resend attempt (requires service role key)
    // This would be done in a separate edge function or backend service
    
    return NextResponse.json({
      success: true,
      message: type === 'confirmation' 
        ? 'Confirmation email sent successfully. Please check your inbox.'
        : 'Password reset email sent successfully. Please check your inbox.'
    })

  } catch (error) {
    console.error('Resend email error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
```

### 5. Add CAPTCHA Component (for 5+ attempts)

**File: `frontend/src/components/ReCaptcha.tsx`**

```tsx
import { useEffect } from 'react'

interface ReCaptchaProps {
  onVerify: (token: string) => void
  siteKey: string
}

export default function ReCaptcha({ onVerify, siteKey }: ReCaptchaProps) {
  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    // Setup callback
    window.onRecaptchaVerify = (token: string) => {
      onVerify(token)
    }

    return () => {
      document.body.removeChild(script)
      delete window.onRecaptchaVerify
    }
  }, [onVerify])

  return (
    <div 
      className="g-recaptcha" 
      data-sitekey={siteKey}
      data-callback="onRecaptchaVerify"
    />
  )
}
```

### 6. Create Supabase Edge Function for Tracking

**File: `supabase/functions/track-email-resend/index.ts`**

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { email, attempt_type, ip_address, user_agent } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabaseClient
      .from('email_resend_attempts')
      .insert({
        email,
        attempt_type,
        ip_address,
        user_agent
      })

    if (error) throw error

    // Get count of recent attempts for analytics
    const { count } = await supabaseClient
      .from('email_resend_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .eq('attempt_type', attempt_type)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour

    return new Response(
      JSON.stringify({ success: true, recentAttempts: count }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 7. Error Handling Recommendations

Based on best practices, here's how to handle different scenarios:

1. **Email Already Confirmed**: 
   - Don't show error, just proceed with normal login error
   - Prevents email enumeration attacks

2. **Email Doesn't Exist**: 
   - Show generic "Check your email" message
   - Don't reveal if email exists in system

3. **Rate Limit Exceeded**:
   - Show clear message with retry time
   - "Too many attempts. Please try again in X minutes."

4. **Network/Server Errors**:
   - Show user-friendly error with retry option
   - Log detailed error for debugging

### 8. Analytics Dashboard Query

To track resend metrics, create these queries:

```sql
-- Daily resend attempts
SELECT 
  DATE(created_at) as date,
  attempt_type,
  COUNT(*) as total_attempts,
  COUNT(DISTINCT email) as unique_users
FROM email_resend_attempts
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), attempt_type
ORDER BY date DESC;

-- Users with most resend attempts
SELECT 
  email,
  COUNT(*) as total_attempts,
  MAX(created_at) as last_attempt
FROM email_resend_attempts
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY email
HAVING COUNT(*) > 3
ORDER BY total_attempts DESC;
```

### 9. Testing Plan

1. Enable email confirmations in Supabase
2. Test signup flow with confirmation requirement
3. Test resend functionality with rate limiting
4. Test CAPTCHA integration after 5 attempts
5. Verify analytics tracking
6. Test error scenarios

### 10. Environment Variables to Add

```env
# Add to .env and Vercel
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

## Implementation Status

- [ ] Save plan to project
- [ ] Enable email confirmations in Supabase config
- [ ] Create database migration for email resend tracking
- [ ] Update login component with resend functionality
- [ ] Create API route for resending confirmation emails
- [ ] Add reCAPTCHA component for rate limiting
- [ ] Create Supabase edge function for tracking
- [ ] Test the complete resend email flow

This implementation follows Next.js and Supabase best practices while providing a secure, user-friendly experience for handling unconfirmed emails with proper rate limiting and analytics.