#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

/**
 * CLI tool for validating and managing prompt files
 */

class MarkdownPromptLoader {
  constructor(promptsDir) {
    this.promptsDir = promptsDir || path.join(process.cwd(), 'src/lib/prompts/markdown')
    this.cache = new Map()
  }

  loadPrompt(filename) {
    try {
      if (this.cache.has(filename)) {
        return this.cache.get(filename)
      }

      const filePath = path.join(this.promptsDir, filename)
      
      if (!fs.existsSync(filePath)) {
        console.warn(`Prompt file not found: ${filePath}`)
        return null
      }

      const fileContent = fs.readFileSync(filePath, 'utf8')
      const parsed = matter(fileContent)

      const promptData = {
        content: parsed.content.trim(),
        metadata: {
          version: parsed.data.version || 'unknown',
          description: parsed.data.description || '',
          createdAt: parsed.data.createdAt || new Date().toISOString().split('T')[0],
          author: parsed.data.author || 'Unknown',
          features: Array.isArray(parsed.data.features) ? parsed.data.features : []
        }
      }

      this.cache.set(filename, promptData)
      return promptData
    } catch (error) {
      console.error(`Error loading prompt file ${filename}:`, error)
      return null
    }
  }

  getAvailablePrompts() {
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

  validatePrompt(filename) {
    const errors = []
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

const args = process.argv.slice(2)
const command = args[0]

function showHelp() {
  console.log(`
📝 Prompt Manager CLI

Usage: node scripts/prompt-manager.js <command> [options]

Commands:
  validate [filename]  - Validate a specific prompt file or all files
  list                - List all available prompt files
  test <version>      - Test loading a specific prompt version
  help               - Show this help message

Examples:
  node scripts/prompt-manager.js validate sunday-school-v1.0.md
  node scripts/prompt-manager.js validate
  node scripts/prompt-manager.js list
  node scripts/prompt-manager.js test v1.0
`)
}

function validatePrompts(filename) {
  const loader = new MarkdownPromptLoader()
  
  if (filename) {
    // Validate specific file
    const validation = loader.validatePrompt(filename)
    console.log(`\n📄 Validating: ${filename}`)
    
    if (validation.valid) {
      console.log('✅ Valid!')
      const prompt = loader.loadPrompt(filename)
      if (prompt) {
        console.log(`   Version: ${prompt.metadata.version}`)
        console.log(`   Description: ${prompt.metadata.description}`)
        console.log(`   Features: ${prompt.metadata.features.length}`)
        console.log(`   Content length: ${prompt.content.length} characters`)
      }
    } else {
      console.log('❌ Invalid!')
      validation.errors.forEach(error => console.log(`   - ${error}`))
    }
  } else {
    // Validate all files
    const files = loader.getAvailablePrompts()
    console.log(`\n📋 Validating ${files.length} prompt files...\n`)
    
    let validCount = 0
    files.forEach(file => {
      const validation = loader.validatePrompt(file)
      if (validation.valid) {
        console.log(`✅ ${file}`)
        validCount++
      } else {
        console.log(`❌ ${file}`)
        validation.errors.forEach(error => console.log(`   - ${error}`))
      }
    })
    
    console.log(`\n📊 Summary: ${validCount}/${files.length} files are valid`)
  }
}

function listPrompts() {
  const loader = new MarkdownPromptLoader()
  const files = loader.getAvailablePrompts()
  
  console.log(`\n📋 Available Prompt Files (${files.length}):\n`)
  
  files.forEach(file => {
    const prompt = loader.loadPrompt(file)
    if (prompt) {
      console.log(`📄 ${file}`)
      console.log(`   Version: ${prompt.metadata.version}`)
      console.log(`   Description: ${prompt.metadata.description}`)
      console.log(`   Author: ${prompt.metadata.author}`)
      console.log(`   Created: ${prompt.metadata.createdAt}`)
      console.log(`   Features: ${prompt.metadata.features.length}`)
      console.log('')
    }
  })
}

function testPromptVersion(version) {
  const loader = new MarkdownPromptLoader()
  const filename = `sunday-school-${version}.md`
  
  console.log(`\n🧪 Testing prompt version: ${version}`)
  
  try {
    const prompt = loader.loadPrompt(filename)
    
    if (!prompt) {
      console.log(`❌ Could not load version ${version}`)
      return
    }
    
    console.log('✅ Successfully loaded!')
    console.log(`   Description: ${prompt.metadata.description}`)
    console.log(`   Author: ${prompt.metadata.author}`)
    console.log(`   Features: ${prompt.metadata.features.length}`)
    console.log(`   Content length: ${prompt.content.length} characters`)
    
    // Show first 200 characters
    console.log(`\n📝 Preview:`)
    console.log(prompt.content.substring(0, 200) + (prompt.content.length > 200 ? '...' : ''))
    
  } catch (error) {
    console.log(`❌ Error loading version ${version}:`, error.message)
  }
}

// Main execution
switch (command) {
  case 'validate':
    validatePrompts(args[1])
    break
  case 'list':
    listPrompts()
    break
  case 'test':
    if (!args[1]) {
      console.log('❌ Please specify a version to test')
      showHelp()
    } else {
      testPromptVersion(args[1])
    }
    break
  case 'help':
  case undefined:
    showHelp()
    break
  default:
    console.log(`❌ Unknown command: ${command}`)
    showHelp()
    break
}