#!/usr/bin/env node

/**
 * Test ElevenLabs prompt generation with actual client
 */

// Mock the environment
process.env.ELEVENLABS_API_KEY = 'test-key'

console.log('🧪 Testing ElevenLabs Prompt Generation\n')

// Test different versions by checking the prompt files directly
const fs = require('fs')
const path = require('path')

const promptsDir = path.join(__dirname, '..', 'src', 'lib', 'prompts', 'elevenlabs')

// Test v1.0
console.log('📋 Testing Version 1.0')
console.log('='.repeat(60))

const v1Path = path.join(promptsDir, 'music-v1.0.md')
if (fs.existsSync(v1Path)) {
  const v1Content = fs.readFileSync(v1Path, 'utf8')
  const templateMatch = v1Content.match(/# Base Template\s*\n\s*\n(.+?)(?=\n\s*#|$)/s)
  if (templateMatch) {
    console.log('✅ v1.0 template loaded')
    console.log('📄 Template:', templateMatch[1].substring(0, 200) + '...')
  } else {
    console.log('❌ Could not find v1.0 template')
  }
} else {
  console.log('❌ v1.0 file not found')
}

// Test v2.0
console.log('\n📋 Testing Version 2.0')
console.log('='.repeat(60))

const v2Path = path.join(promptsDir, 'music-v2.0.md')
if (fs.existsSync(v2Path)) {
  const v2Content = fs.readFileSync(v2Path, 'utf8')
  const templateMatch = v2Content.match(/# Base Template\s*\n\s*\n(.+?)(?=\n\s*#|$)/s)
  if (templateMatch) {
    console.log('✅ v2.0 template loaded')
    console.log('📄 Template:', templateMatch[1].substring(0, 200) + '...')
  } else {
    console.log('❌ Could not find v2.0 template')
  }
} else {
  console.log('❌ v2.0 file not found')
}

// Show available files
console.log('\n📁 Available files:')
const files = fs.readdirSync(promptsDir).filter(f => f.endsWith('.md'))
files.forEach(file => {
  const filePath = path.join(promptsDir, file)
  const stats = fs.statSync(filePath)
  console.log(`   ${file} (${stats.size} bytes)`)
})

console.log('\n✅ Prompt system test complete!')