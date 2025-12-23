#!/usr/bin/env node

/**
 * Display the current ElevenLabs prompt version
 */

const fs = require('fs')
const path = require('path')

const version = process.env.ELEVENLABS_PROMPT_VERSION || '1.0'
const promptPath = path.join(__dirname, '..', 'src', 'lib', 'prompts', 'elevenlabs', `music-v${version}.md`)

console.log(`\n🎵 ElevenLabs Prompt Version: ${version}`)
console.log(`📄 File: ${promptPath}`)

if (fs.existsSync(promptPath)) {
  console.log('✅ Prompt file exists\n')
  
  // Read and display the base template
  const content = fs.readFileSync(promptPath, 'utf8')
  const templateMatch = content.match(/# Base Template\s*\n\s*\n(.+?)(?=\n\s*#|$)/s)
  
  if (templateMatch) {
    console.log('📝 Base Template:')
    console.log('-'.repeat(60))
    console.log(templateMatch[1].trim())
    console.log('-'.repeat(60))
  }
} else {
  console.log(`❌ Prompt file not found!`)
  console.log(`\nAvailable versions:`)
  
  const promptsDir = path.dirname(promptPath)
  if (fs.existsSync(promptsDir)) {
    const files = fs.readdirSync(promptsDir)
      .filter(f => f.startsWith('music-v') && f.endsWith('.md'))
      .map(f => f.replace('music-v', '').replace('.md', ''))
      .sort()
    
    files.forEach(v => console.log(`  - ${v}`))
  }
}