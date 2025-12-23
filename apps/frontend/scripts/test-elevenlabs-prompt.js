#!/usr/bin/env node

/**
 * Test script for ElevenLabs prompt loading
 * Usage: node scripts/test-elevenlabs-prompt.js
 */

const path = require('path')

// Import the loader classes
async function loadModules() {
  const { ElevenLabsPromptLoader } = await import('../src/lib/prompts/elevenlabs-loader.ts')
  return { ElevenLabsPromptLoader }
}

async function testPromptLoading() {
  console.log('🧪 Testing ElevenLabs Prompt Loading\n')
  
  try {
    const { ElevenLabsPromptLoader } = await loadModules()
    const loader = new ElevenLabsPromptLoader()
    
    // Test both versions
    const versions = ['1.0', '2.0']
    
    for (const version of versions) {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`📄 Loading prompt version ${version}...`)
      const prompt = loader.loadPromptByVersion(version)
      
      if (!prompt) {
        console.error(`❌ Failed to load prompt version ${version}`)
        continue
      }
    
      console.log('✅ Successfully loaded prompt!')
      console.log(`   Version: ${prompt.metadata.version}`)
      console.log(`   Description: ${prompt.metadata.description}`)
      console.log(`   Author: ${prompt.metadata.author}`)
      console.log(`   Created: ${prompt.metadata.createdAt}`)
      console.log(`   Features: ${prompt.metadata.features.length}`)
      
      // Parse ElevenLabs-specific data
      console.log('\n📋 Parsing ElevenLabs prompt data...')
      const promptData = loader.parseElevenLabsPrompt(prompt)
      
      console.log('\n🎵 Base Template:')
      console.log(promptData.baseTemplate.substring(0, 200) + '...')
      
      console.log('\n😊 Mood Mappings:')
      Object.entries(promptData.moodMappings).forEach(([mood, mapping]) => {
        console.log(`   ${mood}: ${mapping}`)
      })
      
      console.log('\n⚡ Energy Mappings:')
      Object.entries(promptData.energyMappings).forEach(([energy, mapping]) => {
        console.log(`   ${energy}: ${mapping}`)
      })
      
      console.log('\n📝 Truncation Priority:')
      promptData.truncationPriority.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item}`)
      })
      
      // Test building a prompt
      console.log('\n🔨 Testing prompt building...')
      const testInput = {
        theme: 'God\'s Love',
        bibleReference: 'John 3:16',
        mood: 'happy',
        energy: 'high',
        instrumental: false,
        lyrics: 'God loves me, this I know\nFor the Bible tells me so',
        ageGroup: '5-10'
      }
      
      const builtPrompt = loader.buildPromptFromTemplate(promptData.baseTemplate, {
        ...testInput,
        mood: promptData.moodMappings[testInput.mood] || testInput.mood,
        energy: promptData.energyMappings[testInput.energy] || testInput.energy
      })
      
      console.log('\n📄 Built Prompt:')
      console.log(builtPrompt)
      console.log(`\n📏 Length: ${builtPrompt.length} characters`)
      
      // Test with instrumental
      console.log('\n🎹 Testing instrumental version...')
      const instrumentalInput = { ...testInput, instrumental: true }
      const instrumentalPrompt = loader.buildPromptFromTemplate(promptData.baseTemplate, {
        ...instrumentalInput,
        mood: promptData.moodMappings[instrumentalInput.mood] || instrumentalInput.mood,
        energy: promptData.energyMappings[instrumentalInput.energy] || instrumentalInput.energy
      })
      
      console.log('📄 Instrumental Prompt:')
      console.log(instrumentalPrompt)
      console.log(`📏 Length: ${instrumentalPrompt.length} characters`)
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
  }
}

// Run the test
testPromptLoading().catch(console.error)