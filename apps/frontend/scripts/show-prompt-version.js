#!/usr/bin/env node

// Simple script to show current prompt version configuration

const DEFAULT_VERSION = 'v2.1'
const envVersion = process.env.SUNDAY_SCHOOL_PROMPT_VERSION
const currentVersion = envVersion || DEFAULT_VERSION

console.log('\n🎯 Sunday School Prompt Configuration:')
console.log(`   Current Version: ${currentVersion}`)
console.log(`   Source: ${envVersion ? 'Environment Variable' : 'Default'}`)
console.log(`   Environment: SUNDAY_SCHOOL_PROMPT_VERSION=${envVersion || 'not set'}`)
console.log(`   Default Fallback: ${DEFAULT_VERSION}`)

if (envVersion && envVersion !== DEFAULT_VERSION) {
  console.log(`   ⚠️  Using custom version: ${envVersion}`)
} else {
  console.log(`   ✅ Using recommended version: ${currentVersion}`)
}

console.log('')