#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

console.log('=== PROMPT VERIFICATION TEST ===\n')

// Check environment
const envVersion = process.env.SUNDAY_SCHOOL_PROMPT_VERSION
const defaultVersion = 'v2.1'
console.log(`Environment Variable: ${envVersion || 'not set'}`)
console.log(`Default Version: ${defaultVersion}`)
console.log(`Effective Version: ${envVersion || defaultVersion}\n`)

// Check what files actually exist
const promptsDir = path.join(__dirname, '../src/lib/prompts/markdown')
console.log(`Checking directory: ${promptsDir}`)

try {
  const files = fs.readdirSync(promptsDir).filter(f => f.endsWith('.md'))
  console.log(`Found ${files.length} prompt files:`)
  files.forEach(file => console.log(`  - ${file}`))
  console.log('')

  // Try to load the expected version
  const expectedVersion = envVersion || defaultVersion
  const expectedFile = `sunday-school-${expectedVersion}.md`
  const expectedPath = path.join(promptsDir, expectedFile)
  
  console.log(`Looking for: ${expectedFile}`)
  
  if (fs.existsSync(expectedPath)) {
    console.log('✅ File exists!')
    const content = fs.readFileSync(expectedPath, 'utf8')
    const parsed = matter(content)
    
    console.log(`\nMetadata:`)
    console.log(`  Version: ${parsed.data.version}`)
    console.log(`  Description: ${parsed.data.description}`)
    console.log(`  Author: ${parsed.data.author}`)
    console.log(`  Features: ${parsed.data.features?.length || 0}`)
    
    console.log(`\nFirst 300 characters of prompt:`)
    console.log(parsed.content.substring(0, 300))
    console.log('...\n')
  } else {
    console.log('❌ File does NOT exist!')
    console.log(`Expected path: ${expectedPath}`)
  }

} catch (error) {
  console.error('Error:', error.message)
}