import { MarkdownPromptLoader, ParsedPrompt } from './markdown-loader'
import path from 'path'

export interface ElevenLabsPromptData {
  baseTemplate: string
  moodMappings: Record<string, string>
  energyMappings: Record<string, string>
  truncationPriority: string[]
}

export class ElevenLabsPromptLoader extends MarkdownPromptLoader {
  constructor() {
    super(path.join(process.cwd(), 'src/lib/prompts/elevenlabs'))
  }

  /**
   * Load prompt by version (assumes naming convention: music-v{version}.md)
   */
  loadPromptByVersion(version: string): ParsedPrompt | null {
    const filename = `music-v${version}.md`
    return this.loadPrompt(filename)
  }

  /**
   * Parse ElevenLabs-specific prompt data from markdown content
   */
  parseElevenLabsPrompt(prompt: ParsedPrompt): ElevenLabsPromptData {
    const content = prompt.content
    const sections = content.split('\n#').map(s => s.trim())
    
    // Find base template section
    const baseTemplateSection = sections.find(s => s.startsWith('Base Template'))
    const baseTemplate = baseTemplateSection 
      ? baseTemplateSection.split('\n').slice(2).join(' ').trim()
      : ''

    // Parse mood mappings
    const moodSection = sections.find(s => s.startsWith('Mood Mappings'))
    const moodMappings: Record<string, string> = {}
    if (moodSection) {
      const lines = moodSection.split('\n').slice(2)
      lines.forEach(line => {
        const match = line.match(/^-\s*(\w+):\s*(.+)$/)
        if (match) {
          moodMappings[match[1]] = match[2]
        }
      })
    }

    // Parse energy mappings
    const energySection = sections.find(s => s.startsWith('Energy Mappings'))
    const energyMappings: Record<string, string> = {}
    if (energySection) {
      const lines = energySection.split('\n').slice(2)
      lines.forEach(line => {
        const match = line.match(/^-\s*(\w+):\s*(.+)$/)
        if (match) {
          energyMappings[match[1]] = match[2]
        }
      })
    }

    // Parse truncation priority
    const truncationSection = sections.find(s => s.startsWith('Truncation Priority'))
    const truncationPriority: string[] = []
    if (truncationSection) {
      const lines = truncationSection.split('\n').slice(2)
      lines.forEach(line => {
        const match = line.match(/^\d+\.\s*(.+)$/)
        if (match) {
          truncationPriority.push(match[1])
        }
      })
    }

    return {
      baseTemplate,
      moodMappings,
      energyMappings,
      truncationPriority
    }
  }

  /**
   * Build a prompt from template and input values
   */
  buildPromptFromTemplate(template: string, input: Record<string, unknown>): string {
    // Simple template replacement - handles {{variable}} and {{#condition}}...{{/condition}}
    let result = template

    // Replace simple variables
    Object.entries(input).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        const pattern = new RegExp(`{{${key}(?:\\|([^}]+))?}}`, 'g')
        result = result.replace(pattern, (_, defaultValue) => {
          return value || defaultValue || ''
        })
      }
    })

    // Handle conditionals
    Object.entries(input).forEach(([key, value]) => {
      // Positive conditionals {{#key}}...{{/key}}
      const positivePattern = new RegExp(`{{#${key}}}(.+?){{/${key}}}`, 'gs')
      result = result.replace(positivePattern, value ? '$1' : '')

      // Negative conditionals {{^key}}...{{/key}}
      const negativePattern = new RegExp(`{{\\^${key}}}(.+?){{/${key}}}`, 'gs')
      result = result.replace(negativePattern, !value ? '$1' : '')
    })

    // Clean up any remaining template syntax
    result = result.replace(/{{[^}]+}}/g, '')

    return result.trim()
  }
}

// Singleton instance
let elevenLabsLoaderInstance: ElevenLabsPromptLoader | null = null

export function getElevenLabsPromptLoader(): ElevenLabsPromptLoader {
  if (!elevenLabsLoaderInstance) {
    elevenLabsLoaderInstance = new ElevenLabsPromptLoader()
  }
  return elevenLabsLoaderInstance
}