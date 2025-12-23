import { getElevenLabsPromptLoader, ElevenLabsPromptData } from '../prompts/elevenlabs-loader'
import { glooClient } from '../gloo/client'

interface ElevenLabsConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
  promptVersion?: string
}

interface SundaySchoolMusicInput {
  lyrics: string
  theme?: string
  mood?: string
  energy?: string
  tempo?: string
  ageGroup?: string
  bibleReference?: string
  instrumental?: boolean
}

interface MusicGenerationParams {
  prompt?: string
  duration: number
  model_id?: string
  instrumental?: boolean
}

// Response is binary audio data, no interface needed

class ElevenLabsMusicClient {
  private apiKey: string
  private baseUrl: string
  private timeout: number
  private maxRetries: number
  private promptVersion: string
  private promptData: ElevenLabsPromptData | null = null

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || process.env.ELEVENLABS_MOCK_URL || 'https://api.elevenlabs.io'
    this.timeout = config.timeout || 120000 // 2 minutes
    this.maxRetries = config.maxRetries || 3
    this.promptVersion = config.promptVersion || '1.0'
    this.loadPromptData()
    
    if (process.env.ELEVENLABS_MOCK_URL) {
      console.log(`🔧 Using mock ElevenLabs server: ${this.baseUrl}`)
    }
  }

  private loadPromptData(): void {
    const loader = getElevenLabsPromptLoader()
    const prompt = loader.loadPromptByVersion(this.promptVersion)
    
    if (prompt) {
      this.promptData = loader.parseElevenLabsPrompt(prompt)
      console.log(`Loaded ElevenLabs prompt version ${this.promptVersion}`)
    } else {
      console.warn(`Failed to load ElevenLabs prompt version ${this.promptVersion}, using fallback`)
    }
  }

  async generateMusic(input: SundaySchoolMusicInput, duration: number): Promise<Buffer> {
    // For v2.0+, use chat-based extraction
    let processedInput = input
    if (this.promptVersion >= '2.0') {
      processedInput = await this.extractStructuredInput(input)
    }
    
    const prompt = this.buildPrompt(processedInput)
    
    // Validate prompt length
    if (prompt.length > 2000) {
      console.error('Prompt exceeds 2000 character limit after truncation:', prompt.length)
      throw new Error('Song description is too long. Please shorten the lyrics or theme.')
    }
    
    const params: MusicGenerationParams = {
      prompt,
      duration,
      model_id: 'music_v1',
      instrumental: processedInput.instrumental
    }

    return this.callMusicAPI(params)
  }

  private async extractStructuredInput(input: SundaySchoolMusicInput): Promise<SundaySchoolMusicInput> {
    try {
      // glooClient is already imported at the top
      
      // Create a prompt to extract structured data
      const extractionPrompt = `Extract the following information from this Sunday School song request. Return ONLY a JSON object with these fields:
{
  "theme": "main theme or topic",
  "mood": "happy/peaceful/excited/reflective/worship",
  "energy": "high/medium/low/calm",
  "bibleReference": "exact Bible verse reference if mentioned",
  "ageGroup": "age range (default: 5-10)",
  "instrumental": boolean (true if instrumental requested)
}

Song request:
Theme: ${input.theme || 'not specified'}
Bible Reference: ${input.bibleReference || 'not specified'}
Mood: ${input.mood || 'not specified'}
Energy: ${input.energy || 'not specified'}
Age Group: ${input.ageGroup || '5-10'}
Instrumental: ${input.instrumental ? 'yes' : 'no'}
Lyrics: ${input.lyrics ? 'provided' : 'not provided'}

Respond with ONLY the JSON object.`

      const response = await glooClient.chat([
        {
          role: 'user',
          content: extractionPrompt
        }
      ], 'You are a JSON extraction assistant. Return only valid JSON.')

      const extracted = JSON.parse(response.message)
      
      // Merge extracted data with original input, preserving lyrics
      return {
        ...input,
        theme: extracted.theme || input.theme,
        mood: extracted.mood || input.mood,
        energy: extracted.energy || input.energy,
        bibleReference: extracted.bibleReference || input.bibleReference,
        ageGroup: extracted.ageGroup || input.ageGroup || '5-10',
        instrumental: extracted.instrumental ?? input.instrumental
      }
    } catch (error) {
      console.warn('Failed to extract structured input, using original:', error)
      return input
    }
  }

  // Public method to check prompt length without generating
  checkPromptLength(input: SundaySchoolMusicInput): { length: number; isValid: boolean; prompt: string } {
    const prompt = this.buildPrompt(input)
    return {
      length: prompt.length,
      isValid: prompt.length <= 2000,
      prompt
    }
  }

  private buildPrompt(input: SundaySchoolMusicInput): string {
    // Use versioned prompt if available
    if (this.promptData?.baseTemplate) {
      return this.buildPromptFromTemplate(input)
    }
    
    // Fallback to hardcoded prompt
    return this.buildPromptFallback(input)
  }

  private buildPromptFromTemplate(input: SundaySchoolMusicInput): string {
    const loader = getElevenLabsPromptLoader()
    
    // Prepare input with mapped values
    const templateInput = {
      ...input,
      mood: input.mood ? this.mapMood(input.mood) : null,
      energy: input.energy ? this.mapEnergy(input.energy) : null
    }
    
    const prompt = loader.buildPromptFromTemplate(this.promptData!.baseTemplate, templateInput)
    
    // Check if prompt exceeds 2000 characters
    if (prompt.length > 2000) {
      return this.truncatePromptFromTemplate(prompt, input)
    }
    
    return prompt
  }

  private mapMood(mood: string): string {
    if (!this.promptData?.moodMappings) {
      return this.mapMoodToSundaySchool(mood) || mood
    }
    return this.promptData.moodMappings[mood.toLowerCase()] || mood
  }

  private mapEnergy(energy: string): string {
    if (!this.promptData?.energyMappings) {
      return this.mapEnergyToSundaySchool(energy) || energy
    }
    return this.promptData.energyMappings[energy.toLowerCase()] || energy
  }

  private buildPromptFallback(input: SundaySchoolMusicInput): string {
    const parts: string[] = []
    
    // Base context for Sunday School music
    parts.push('Create a Sunday School song for children aged 5-10')
    
    // Add theme if provided
    if (input.theme) {
      parts.push(`with the theme: "${input.theme}"`)
    }
    
    // Add Bible reference context
    if (input.bibleReference) {
      parts.push(`based on the Bible verse: ${input.bibleReference}`)
    }
    
    // Add mood and energy with Sunday School appropriate language
    const mood = this.mapMoodToSundaySchool(input.mood)
    const energy = this.mapEnergyToSundaySchool(input.energy)
    
    if (mood) parts.push(`with a ${mood} feeling`)
    if (energy) parts.push(`that is ${energy}`)
    
    // Add instrumental preference
    if (input.instrumental) {
      parts.push('as an instrumental piece suitable for singing along')
    } else {
      parts.push('with vocals included')
    }
    
    // Add lyrics if provided and not instrumental
    if (input.lyrics && !input.instrumental) {
      parts.push(`Lyrics: "${input.lyrics}"`)
    }
    
    // Add age-appropriate guidance
    parts.push('Make it simple, engaging, and appropriate for young children in a Christian educational setting')
    
    const fullPrompt = parts.join(', ')
    
    // Check if prompt exceeds 2000 characters
    if (fullPrompt.length > 2000) {
      return this.truncatePrompt(parts, input)
    }
    
    return fullPrompt
  }

  private mapMoodToSundaySchool(mood?: string): string | null {
    if (!mood) return null
    
    const moodMap: Record<string, string> = {
      'happy': 'joyful and uplifting',
      'peaceful': 'calm and peaceful', 
      'excited': 'enthusiastic and celebratory',
      'reflective': 'gentle and thoughtful',
      'worship': 'reverent and worshipful'
    }
    
    return moodMap[mood.toLowerCase()] || mood
  }

  private mapEnergyToSundaySchool(energy?: string): string | null {
    if (!energy) return null
    
    const energyMap: Record<string, string> = {
      'high': 'energetic and fun',
      'medium': 'moderately paced',
      'low': 'gentle and soothing',
      'calm': 'peaceful and relaxing'
    }
    
    return energyMap[energy.toLowerCase()] || energy
  }

  private truncatePromptFromTemplate(prompt: string, input: SundaySchoolMusicInput): string {
    // For template-based prompts, we'll need to rebuild with truncated lyrics
    if (!input.lyrics || prompt.length <= 2000) {
      return prompt
    }
    
    // Calculate how much we need to truncate
    const excess = prompt.length - 2000 + 50 // 50 char buffer
    const lyricsInPrompt = input.lyrics
    const targetLyricsLength = Math.max(100, lyricsInPrompt.length - excess)
    
    // Truncate lyrics intelligently
    let truncatedLyrics = lyricsInPrompt
    
    if (lyricsInPrompt.length > targetLyricsLength) {
      // Try to truncate at verse boundary
      const verses = lyricsInPrompt.split('\n\n')
      let includedLyrics = ''
      
      for (const verse of verses) {
        if ((includedLyrics + verse).length <= targetLyricsLength - 3) {
          includedLyrics += (includedLyrics ? '\n\n' : '') + verse
        } else {
          break
        }
      }
      
      if (includedLyrics) {
        truncatedLyrics = includedLyrics + '...'
      } else {
        // If no complete verse fits, truncate at sentence
        const sentences = lyricsInPrompt.match(/[^.!?]+[.!?]+/g) || []
        includedLyrics = ''
        
        for (const sentence of sentences) {
          if ((includedLyrics + sentence).length <= targetLyricsLength - 3) {
            includedLyrics += sentence
          } else {
            break
          }
        }
        
        truncatedLyrics = includedLyrics ? includedLyrics + '...' : lyricsInPrompt.substring(0, targetLyricsLength - 3) + '...'
      }
    }
    
    // Rebuild prompt with truncated lyrics
    const truncatedInput = { ...input, lyrics: truncatedLyrics }
    const loader = getElevenLabsPromptLoader()
    const templateInput = {
      ...truncatedInput,
      mood: truncatedInput.mood ? this.mapMood(truncatedInput.mood) : null,
      energy: truncatedInput.energy ? this.mapEnergy(truncatedInput.energy) : null
    }
    
    const truncatedPrompt = loader.buildPromptFromTemplate(this.promptData!.baseTemplate, templateInput)
    
    // Log truncation for monitoring
    console.warn('ElevenLabs prompt truncated:', {
      originalLength: prompt.length,
      truncatedLength: truncatedPrompt.length,
      originalLyricsLength: input.lyrics.length,
      truncatedLyricsLength: truncatedLyrics.length
    })
    
    return truncatedPrompt
  }

  private truncatePrompt(parts: string[], input: SundaySchoolMusicInput): string {
    // Priority order for parts (keep most important)
    const essentialParts: string[] = []
    
    // 1. Always keep base context (highest priority)
    essentialParts.push(parts[0]) // Base context
    
    // 2. Keep age-appropriate guidance (essential)
    essentialParts.push(parts[parts.length - 1]) // Age guidance
    
    // 3. Add theme and Bible reference if space allows
    let currentLength = essentialParts.join(', ').length
    const maxLength = 2000
    const buffer = 50 // Safety buffer
    
    // Helper to check if we can add a part
    const canAddPart = (part: string): boolean => {
      return currentLength + part.length + 2 < (maxLength - buffer) // +2 for ", "
    }
    
    // Add theme
    if (input.theme) {
      const themePart = `with the theme: "${input.theme}"`
      if (canAddPart(themePart)) {
        essentialParts.splice(1, 0, themePart)
        currentLength = essentialParts.join(', ').length
      }
    }
    
    // Add Bible reference
    if (input.bibleReference) {
      const biblePart = `based on the Bible verse: ${input.bibleReference}`
      if (canAddPart(biblePart)) {
        essentialParts.splice(essentialParts.length - 1, 0, biblePart)
        currentLength = essentialParts.join(', ').length
      }
    }
    
    // Add mood and energy
    const mood = this.mapMoodToSundaySchool(input.mood)
    const energy = this.mapEnergyToSundaySchool(input.energy)
    
    if (mood) {
      const moodPart = `with a ${mood} feeling`
      if (canAddPart(moodPart)) {
        essentialParts.splice(essentialParts.length - 1, 0, moodPart)
        currentLength = essentialParts.join(', ').length
      }
    }
    
    if (energy) {
      const energyPart = `that is ${energy}`
      if (canAddPart(energyPart)) {
        essentialParts.splice(essentialParts.length - 1, 0, energyPart)
        currentLength = essentialParts.join(', ').length
      }
    }
    
    // Add instrumental preference
    const instrumentalPart = input.instrumental 
      ? 'as an instrumental piece suitable for singing along'
      : 'with vocals included'
    if (canAddPart(instrumentalPart)) {
      essentialParts.splice(essentialParts.length - 1, 0, instrumentalPart)
      currentLength = essentialParts.join(', ').length
    }
    
    // Add truncated lyrics if space allows
    if (input.lyrics && !input.instrumental) {
      const lyricsPrefix = 'Lyrics: "'
      const lyricsSuffix = '"'
      const availableSpace = maxLength - currentLength - lyricsPrefix.length - lyricsSuffix.length - buffer - 2
      
      if (availableSpace > 100) { // Only add lyrics if we have meaningful space
        let truncatedLyrics = input.lyrics
        
        if (truncatedLyrics.length > availableSpace) {
          // Try to truncate at verse boundary
          const verses = truncatedLyrics.split('\n\n')
          let includedLyrics = ''
          
          for (const verse of verses) {
            if ((includedLyrics + verse).length <= availableSpace - 3) { // -3 for "..."
              includedLyrics += (includedLyrics ? '\n\n' : '') + verse
            } else {
              break
            }
          }
          
          if (includedLyrics) {
            truncatedLyrics = includedLyrics + '...'
          } else {
            // If no complete verse fits, truncate at sentence
            const sentences = truncatedLyrics.match(/[^.!?]+[.!?]+/g) || []
            includedLyrics = ''
            
            for (const sentence of sentences) {
              if ((includedLyrics + sentence).length <= availableSpace - 3) {
                includedLyrics += sentence
              } else {
                break
              }
            }
            
            truncatedLyrics = includedLyrics ? includedLyrics + '...' : truncatedLyrics.substring(0, availableSpace - 3) + '...'
          }
        }
        
        essentialParts.splice(essentialParts.length - 1, 0, `${lyricsPrefix}${truncatedLyrics}${lyricsSuffix}`)
      }
    }
    
    const finalPrompt = essentialParts.join(', ')
    
    // Log truncation for monitoring
    console.warn('ElevenLabs prompt truncated:', {
      originalLength: parts.join(', ').length,
      truncatedLength: finalPrompt.length,
      truncatedLyrics: input.lyrics && input.lyrics.length > 500
    })
    
    return finalPrompt
  }

  private async callMusicAPI(params: MusicGenerationParams): Promise<Buffer> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)
        
        const response = await fetch(`${this.baseUrl}/v1/music?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          body: JSON.stringify({
            prompt: params.prompt,
            music_length_ms: params.duration * 1000,
            model_id: 'music_v1',
            force_instrumental: params.instrumental || false
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`)
        }
        
        // The response is already binary audio data (MP3)
        const audioBuffer = Buffer.from(await response.arrayBuffer())
        return audioBuffer
        
      } catch (error) {
        lastError = error as Error
        console.error(`ElevenLabs API attempt ${attempt} failed:`, error)
        
        if (attempt === this.maxRetries) {
          break
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
    
    throw this.mapError(lastError!)
  }

  private mapError(error: Error): Error {
    const message = error.message.toLowerCase()
    
    if (message.includes('timeout') || message.includes('aborted')) {
      return new Error('Music generation is taking longer than expected. Please try again.')
    }
    
    if (message.includes('401') || message.includes('unauthorized')) {
      return new Error('Authentication failed. Please contact support.')
    }
    
    if (message.includes('429') || message.includes('rate limit')) {
      return new Error('Too many requests. Please wait a moment and try again.')
    }
    
    if (message.includes('400') || message.includes('bad request')) {
      return new Error('Invalid song parameters. Please check your inputs and try again.')
    }
    
    if (message.includes('500') || message.includes('internal server')) {
      return new Error('Music service temporarily unavailable. Please try again in a few minutes.')
    }
    
    return new Error('Failed to generate music. Please try again.')
  }
}

// Export singleton instance
let elevenLabsClient: ElevenLabsMusicClient | null = null

export function getElevenLabsClient(): ElevenLabsMusicClient {
  if (!elevenLabsClient) {
    const apiKey = process.env.ELEVENLABS_API_KEY
    
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required')
    }
    
    elevenLabsClient = new ElevenLabsMusicClient({
      apiKey,
      timeout: 120000, // 2 minutes
      maxRetries: 3,
      promptVersion: process.env.ELEVENLABS_PROMPT_VERSION || '1.0'
    })
  }
  
  return elevenLabsClient
}

export type { SundaySchoolMusicInput, ElevenLabsConfig }