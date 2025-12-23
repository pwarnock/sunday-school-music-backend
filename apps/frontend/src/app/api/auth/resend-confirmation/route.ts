import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sunday-school/lib'
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

    // Get request metadata for tracking (for future use)
    const headersList = await headers()
    const _ipAddress = headersList.get('x-forwarded-for') || 'unknown'
    const _userAgent = headersList.get('user-agent') || 'unknown'

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
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
      })

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    // TODO: Track the resend attempt in the database
    // This would require using the service role key
    // For now, we'll rely on Supabase's built-in rate limiting
    
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