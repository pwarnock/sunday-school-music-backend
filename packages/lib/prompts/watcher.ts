import fs from 'fs'
import path from 'path'
import { getMarkdownPromptLoader } from './markdown-loader'

export class PromptFileWatcher {
  private watchers: fs.FSWatcher[] = []
  private promptsDir: string

  constructor(promptsDir?: string) {
    this.promptsDir = promptsDir || path.join(process.cwd(), 'src/lib/prompts/markdown')
  }

  /**
   * Start watching for changes in prompt files
   */
  startWatching(): void {
    if (!fs.existsSync(this.promptsDir)) {
      console.warn(`Prompts directory does not exist: ${this.promptsDir}`)
      return
    }

    const loader = getMarkdownPromptLoader()

    try {
      // Watch the entire directory
      const watcher = fs.watch(this.promptsDir, { recursive: false }, (eventType, filename) => {
        if (filename && filename.endsWith('.md')) {
          console.log(`📝 Prompt file ${eventType}: ${filename}`)
          
          // Clear cache for hot-reloading
          loader.clearCache()
          
          // Validate the changed file
          if (eventType === 'change') {
            const validation = loader.validatePrompt(filename)
            if (!validation.valid) {
              console.warn(`⚠️  Prompt validation errors in ${filename}:`)
              validation.errors.forEach(error => console.warn(`   - ${error}`))
            } else {
              console.log(`✅ Prompt ${filename} is valid`)
            }
          }
        }
      })

      this.watchers.push(watcher)
      console.log(`👀 Watching for prompt changes in: ${this.promptsDir}`)
    } catch (error) {
      console.error('Error setting up prompt file watcher:', error)
    }
  }

  /**
   * Stop watching for changes
   */
  stopWatching(): void {
    this.watchers.forEach(watcher => watcher.close())
    this.watchers = []
    console.log('🛑 Stopped watching prompt files')
  }
}

// Development helper - only enable in development
let fileWatcher: PromptFileWatcher | null = null

export function enablePromptWatching(): void {
  if (process.env.NODE_ENV === 'development' && !fileWatcher) {
    fileWatcher = new PromptFileWatcher()
    fileWatcher.startWatching()
    
    // Cleanup on process exit
    process.on('SIGINT', () => {
      if (fileWatcher) {
        fileWatcher.stopWatching()
      }
      process.exit(0)
    })
  }
}

export function disablePromptWatching(): void {
  if (fileWatcher) {
    fileWatcher.stopWatching()
    fileWatcher = null
  }
}