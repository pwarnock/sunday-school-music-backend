import matter from 'gray-matter'
import fs from 'fs'
import path from 'path'

export interface PromptMetadata {
  version: string
  description: string
  createdAt: string
  author: string
  features: string[]
}

export interface ParsedPrompt {
  content: string
  metadata: PromptMetadata
}

export class MarkdownPromptLoader {
  private promptsDir: string
  private cache = new Map<string, ParsedPrompt>()

  constructor(promptsDir?: string) {
    this.promptsDir = promptsDir || path.join(process.cwd(), 'src/lib/prompts/markdown')
  }

  /**
   * Load and parse a markdown prompt file
   */
  loadPrompt(filename: string): ParsedPrompt | null {
    try {
      // Check cache first
      if (this.cache.has(filename)) {
        return this.cache.get(filename)!
      }

      const filePath = path.join(this.promptsDir, filename)
      
      if (!fs.existsSync(filePath)) {
        console.warn(`Prompt file not found: ${filePath}`)
        return null
      }

      const fileContent = fs.readFileSync(filePath, 'utf8')
      const parsed = matter(fileContent)
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log(`Loading prompt from: ${filePath}`)
        console.log(`Parsed frontmatter:`, parsed.data)
      }

      const promptData: ParsedPrompt = {
        content: parsed.content.trim(),
        metadata: {
          version: parsed.data.version || 'unknown',
          description: parsed.data.description || '',
          createdAt: parsed.data.createdAt || new Date().toISOString().split('T')[0],
          author: parsed.data.author || 'Unknown',
          features: Array.isArray(parsed.data.features) ? parsed.data.features : []
        }
      }

      // Cache the result
      this.cache.set(filename, promptData)
      
      return promptData
    } catch (error) {
      console.error(`Error loading prompt file ${filename}:`, error)
      return null
    }
  }

  /**
   * Get all available prompt files
   */
  getAvailablePrompts(): string[] {
    try {
      if (!fs.existsSync(this.promptsDir)) {
        return []
      }

      return fs.readdirSync(this.promptsDir)
        .filter(file => file.endsWith('.md'))
        .sort()
    } catch (error) {
      console.error('Error reading prompts directory:', error)
      return []
    }
  }

  /**
   * Load prompt by version (assumes naming convention: sunday-school-v{version}.md)
   */
  loadPromptByVersion(version: string): ParsedPrompt | null {
    const filename = `sunday-school-v${version}.md`
    return this.loadPrompt(filename)
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Validate prompt file structure
   */
  validatePrompt(filename: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const prompt = this.loadPrompt(filename)

    if (!prompt) {
      return { valid: false, errors: ['File could not be loaded'] }
    }

    if (!prompt.metadata.version) {
      errors.push('Missing version in frontmatter')
    }

    if (!prompt.metadata.description) {
      errors.push('Missing description in frontmatter')
    }

    if (!prompt.content || prompt.content.length < 50) {
      errors.push('Prompt content is too short or missing')
    }

    return { valid: errors.length === 0, errors }
  }
}

// Singleton instance
let loaderInstance: MarkdownPromptLoader | null = null

export function getMarkdownPromptLoader(): MarkdownPromptLoader {
  if (!loaderInstance) {
    loaderInstance = new MarkdownPromptLoader()
  }
  return loaderInstance
}