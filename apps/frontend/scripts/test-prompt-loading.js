#!/usr/bin/env node

// Test what the actual chat API would load
const path = require('path')

// Set up the environment like Next.js would
process.env.NODE_ENV = 'development'
process.cwd = () => path.join(__dirname, '..')

// Now test the actual loading mechanism
async function testPromptLoading() {
  try {
    console.log('=== TESTING ACTUAL PROMPT LOADING ===\n')
    
    // Import the modules (using dynamic import for ESM)
    const { createPromptManager } = await import('../src/lib/prompts/index.js')
    
    console.log('Creating prompt manager...')
    const manager = createPromptManager()
    
    console.log('Getting prompt...')
    const prompt = manager.getPrompt()
    const metadata = manager.getMetadata()
    
    console.log('\n=== RESULTS ===')
    console.log(`Version: ${metadata.version}`)
    console.log(`Description: ${metadata.description}`)
    console.log(`Author: ${metadata.author}`)
    console.log(`Features: ${metadata.features.length}`)
    console.log(`\nPrompt length: ${prompt.length} characters`)
    console.log(`\nFirst 400 characters:`)
    console.log(prompt.substring(0, 400))
    console.log('...\n')
    
    // Check if it contains v2.1 specific content
    if (prompt.includes('Scripture memorization specialist')) {
      console.log('✅ Contains v2.1 specific content!')
    } else {
      console.log('❌ Does NOT contain v2.1 specific content!')
    }
    
    if (prompt.includes('Which specific Bible verse would you like children to memorize?')) {
      console.log('✅ Contains v2.1 initial response protocol!')
    } else {
      console.log('❌ Missing v2.1 initial response protocol!')
    }
    
  } catch (error) {
    console.error('Error testing prompt loading:', error)
  }
}

testPromptLoading()