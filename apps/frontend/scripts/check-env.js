#!/usr/bin/env node

// Load environment variables from .env.local file
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GLOO_CLIENT_ID',
  'GLOO_CLIENT_SECRET',
  'ELEVENLABS_API_KEY'
];

const optionalEnvVars = [
  'GLOO_MODEL',
  'NEXT_PUBLIC_APP_URL',
  'ENABLE_SCRIPTURE_API'
];

console.log('🔍 Checking environment variables...\n');

let allGood = true;

// Check required variables
console.log('📋 Required variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allGood = false;
  }
});

// Check optional variables
console.log('\n📋 Optional variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: Not set (using default)`);
  }
});

// Security checks
console.log('\n🔒 Security checks:');
const publicVars = Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'));
const sensitiveVars = publicVars.filter(key => 
  key.includes('GLOO') || 
  key.includes('ELEVENLABS') ||
  (key.includes('SECRET') && !key.includes('SUPABASE')) ||
  (key.includes('KEY') && !key.includes('SUPABASE'))
);

if (sensitiveVars.length > 0) {
  console.log('❌ SECURITY ISSUE: Sensitive variables exposed as public:');
  sensitiveVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  allGood = false;
} else {
  console.log('✅ No sensitive variables exposed as public');
  console.log('ℹ️  Note: Supabase URL and anon key are safe to expose to browser');
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 All environment variables are properly configured!');
  process.exit(0);
} else {
  console.log('💥 Environment configuration issues found. Please fix before running the app.');
  process.exit(1);
}