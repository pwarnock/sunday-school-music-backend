import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get client credentials from environment variables
    const clientId = process.env.GLOO_CLIENT_ID?.trim()
    const clientSecret = process.env.GLOO_CLIENT_SECRET?.trim()
    
    console.log('Environment check:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdPrefix: clientId ? clientId.substring(0, 8) : 'missing',
      secretLength: clientSecret ? clientSecret.length : 0
    })
    
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Gloo credentials not configured' },
        { status: 500 }
      )
    }

    // Create Basic Auth header (exactly like Gloo docs TypeScript example)
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch(
      'https://platform.ai.gloo.com/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'scope': 'api/access'
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Token request failed:', response.status, errorText)
      console.error('Request details:', {
        url: 'https://platform.ai.gloo.com/oauth2/token',
        clientId: clientId?.substring(0, 8) + '...',
        clientIdFull: clientId,
        hasSecret: !!clientSecret,
        secretLength: clientSecret.length,
        authHeaderLength: auth.length
      })
      return NextResponse.json(
        { error: `Token request failed: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const tokenData = await response.json()
    
    return NextResponse.json(tokenData)

  } catch (error) {
    console.error('Token API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}