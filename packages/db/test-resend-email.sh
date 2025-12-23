#!/bin/bash

# Test script for resend auth email functionality
# This script tests the complete flow of the resend email feature

echo "🧪 Testing Resend Auth Email Feature"
echo "====================================="

# Test 1: Test the API endpoint directly
echo ""
echo "1. Testing API endpoint directly..."

# Test with missing email
echo "   Testing with missing email (should fail)..."
curl -s -X POST http://localhost:3000/api/auth/resend-confirmation \
  -H "Content-Type: application/json" \
  -d '{"type": "confirmation"}' \
  | jq -r '.error // "Success"'

# Test with missing type
echo "   Testing with missing type (should fail)..."
curl -s -X POST http://localhost:3000/api/auth/resend-confirmation \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}' \
  | jq -r '.error // "Success"'

# Test with valid data but non-existent email
echo "   Testing with valid data but non-existent email..."
curl -s -X POST http://localhost:3000/api/auth/resend-confirmation \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@example.com", "type": "confirmation", "attempts": 0}' \
  | jq -r '.message // .error'

# Test 2: Check if login page loads
echo ""
echo "2. Testing login page accessibility..."
curl -s http://localhost:3000/login | grep -q "Sunday School Music Creator" && echo "   ✅ Login page loads correctly" || echo "   ❌ Login page failed to load"

# Test 3: Check if signup page loads  
echo ""
echo "3. Testing signup page accessibility..."
curl -s http://localhost:3000/signup | grep -q "Create your account" && echo "   ✅ Signup page loads correctly" || echo "   ❌ Signup page failed to load"

echo ""
echo "🎯 Manual Testing Instructions:"
echo "==============================="
echo "1. Go to http://localhost:3000/signup"
echo "2. Create a new account with a real email address"
echo "3. Try to login with the unconfirmed account"
echo "4. You should see the resend confirmation option"
echo "5. Click 'Resend Confirmation Email' and check your inbox"
echo ""
echo "Expected behavior:"
echo "- After 5 failed attempts, reCAPTCHA should appear"
echo "- Supabase rate limiting should prevent too many requests"
echo "- Success messages should appear after sending"

echo ""
echo "🔍 Database Check:"
echo "=================="
echo "Check the email_resend_attempts table in Supabase to see tracking data"