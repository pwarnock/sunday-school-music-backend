interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

class TokenManager {
  private token: string | null = null
  private expiresAt: number = 0
  private refreshPromise: Promise<string> | null = null

  async getValidToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.token && Date.now() < this.expiresAt - 60000) { // Refresh 1 minute early
      return this.token
    }

    // If we're already refreshing, wait for that
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // Start a new refresh
    this.refreshPromise = this.refreshToken()
    
    try {
      const token = await this.refreshPromise
      return token
    } finally {
      this.refreshPromise = null
    }
  }

  private async refreshToken(): Promise<string> {
    try {
      const response = await fetch('/api/gloo/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const data: TokenResponse = await response.json()
      
      this.token = data.access_token
      this.expiresAt = Date.now() + (data.expires_in * 1000)
      
      return this.token
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  clearToken() {
    this.token = null
    this.expiresAt = 0
  }
}

export const tokenManager = new TokenManager()