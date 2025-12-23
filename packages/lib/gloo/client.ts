import OpenAI from 'openai'

interface GlooMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface GlooResponse {
  message: string
  error?: string
}

class GlooClient {
  private token: string | null = null
  private tokenExpiry: number = 0

  private async getToken(): Promise<string> {
    // Check if we have a valid token (with 5 minute buffer)
    if (this.token && Date.now() < this.tokenExpiry - 300000) {
      return this.token
    }

    // Get fresh token via OAuth
    try {
      const clientId = process.env.GLOO_CLIENT_ID
      const clientSecret = process.env.GLOO_CLIENT_SECRET
      
      if (!clientId || !clientSecret) {
        throw new Error('Gloo credentials not configured')
      }
      
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

      const response = await fetch('https://platform.ai.gloo.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'scope': 'api/access'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Token request failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      this.token = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000)
      
      if (!this.token) {
        throw new Error('Authentication failed: No access token received')
      }
      return this.token
    } catch (error) {
      console.error('Token fetch error:', error)
      throw error
    }
  }



  async chat(messages: GlooMessage[], systemPrompt?: string): Promise<GlooResponse> {
    try {
      const token = await this.getToken()
      
      const fullMessages = systemPrompt 
        ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
        : messages

      const requestBody = {
        model: process.env.GLOO_MODEL || 'us.anthropic.claude-sonnet-4-20250514-v1:0',
        messages: fullMessages,
        max_tokens: 1000,
        temperature: 0.7
      }

      console.log('Sending to Gloo API:', requestBody)

      const response = await fetch('https://platform.ai.gloo.com/ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`API error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('API response:', data)

      return {
        message: data.choices?.[0]?.message?.content || 'No response received'
      }
    } catch (error) {
      console.error('Gloo API error:', error)
      
      // Log more details for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          cause: (error as Error & { cause?: unknown }).cause
        })
      }
      
      // Clear token on auth errors to force refresh
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403') || error.message.includes('422'))) {
        console.log('Clearing token due to error')
        this.token = null
        this.tokenExpiry = 0
      }
      
      return {
        message: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async generateSongLyrics(prompt: string): Promise<GlooResponse> {
    // Simplified approach - test with minimal request first
    try {
      const token = await this.getToken()
      
      const model = process.env.NEXT_PUBLIC_GLOO_MODEL || process.env.GLOO_MODEL || 'us.anthropic.claude-sonnet-4-20250514-v1:0'
      
      const systemPrompt = `You are a Sunday School song creator. Format all songs with proper markdown:
- Use **Song Title:** for the title
- Use **Verse 1:**, **Verse 2:**, etc. for verses  
- Use **Chorus:** for the chorus
- Use **Bridge:** for bridge sections if needed
- Include line breaks between sections
- Create simple, memorable melodies for children
- Include biblical themes and positive messages`

      const requestBody = {
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Create a simple Sunday School song about: ${prompt}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }

      console.log('Direct API call with:', requestBody)

      const response = await fetch('https://platform.ai.gloo.com/ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`API error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('API response:', data)

      return {
        message: data.choices?.[0]?.message?.content || 'No response received'
      }
    } catch (error) {
      console.error('Direct API error:', error)
      return {
        message: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

export const glooClient = new GlooClient()