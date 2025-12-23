#!/usr/bin/env node

/**
 * Demo of ElevenLabs prompt generation
 * Shows what the actual prompts look like when generated
 */

console.log('🎵 ElevenLabs Prompt Generation Demo\n')

// Simulate the template processing for both versions
const fs = require('fs')
const path = require('path')

const promptsDir = path.join(__dirname, '..', 'src', 'lib', 'prompts', 'elevenlabs')

// Test input data
const testInput = {
  theme: "God's Love",
  bibleReference: "John 3:16",
  mood: "happy",
  energy: "high",
  lyrics: "God loves me, this I know\nFor the Bible tells me so",
  instrumental: false,
  ageGroup: "5-10"
}

// Simple template processor (simulating the actual loader)
function processTemplate(template, data) {
  let result = template

  // Replace simple variables
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      const pattern = new RegExp(`{{${key}(?:\\|([^}]+))?}}`, 'g')
      result = result.replace(pattern, (_, defaultValue) => {
        return value || defaultValue || ''
      })
    }
  })

  // Handle conditionals
  Object.entries(data).forEach(([key, value]) => {
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

// Test v1.0
console.log('📋 Version 1.0 Generated Prompt')
console.log('='.repeat(60))

const v1Path = path.join(promptsDir, 'music-v1.0.md')
if (fs.existsSync(v1Path)) {
  const v1Content = fs.readFileSync(v1Path, 'utf8')
  const templateMatch = v1Content.match(/# Base Template\s*\n\s*\n(.+?)(?=\n\s*#|$)/s)
  if (templateMatch) {
    const template = templateMatch[1].trim()
    const generatedPrompt = processTemplate(template, testInput)
    console.log('📄 Generated Prompt:')
    console.log(generatedPrompt)
    console.log(`\n📏 Length: ${generatedPrompt.length} characters`)
  }
}

// Test v2.0
console.log('\n📋 Version 2.0 Generated Prompt')
console.log('='.repeat(60))

const v2Path = path.join(promptsDir, 'music-v2.0.md')
if (fs.existsSync(v2Path)) {
  const v2Content = fs.readFileSync(v2Path, 'utf8')
  const templateMatch = v2Content.match(/# Base Template\s*\n\s*\n(.+?)(?=\n\s*#|$)/s)
  if (templateMatch) {
    const template = templateMatch[1].trim()
    const generatedPrompt = processTemplate(template, testInput)
    console.log('📄 Generated Prompt:')
    console.log(generatedPrompt)
    console.log(`\n📏 Length: ${generatedPrompt.length} characters`)
  }
}

console.log('\n✅ Demo complete!')

// Show the difference
console.log('\n🔍 Key Differences:')
console.log('v1.0: Uses inline template syntax with comma-separated structure')
console.log('v2.0: Uses clearer structure with explicit sections and better formatting')