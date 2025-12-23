#!/bin/bash

# Sunday School Music Creator - Vercel Deployment Script

echo "🎵 Deploying Sunday School Music Creator to Vercel..."

# First, let's push the code to GitHub (you'll need to create the repo first)
echo ""
echo "📝 Step 1: Create GitHub Repository"
echo "Go to: https://github.com/new"
echo "Repository name: sunday-school-music-creator"
echo "Description: AI-powered tool for creating Sunday School songs with lyrics and music generation"
echo "✅ Check 'Private'"
echo "❌ Don't initialize with README"
echo ""
echo "After creating the repo, press Enter to continue..."
read -p ""

# Connect to GitHub
echo "🔗 Connecting to GitHub..."
cd frontend
git remote add origin https://github.com/$(git config user.name)/sunday-school-music-creator.git
git branch -M main
git push -u origin main

echo "✅ Code pushed to GitHub!"

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🔧 Now you need to add environment variables in Vercel dashboard:"
echo ""
echo "Go to your Vercel dashboard → Project → Settings → Environment Variables"
echo ""
echo "Add these variables:"
echo "================================"
echo "NEXT_PUBLIC_SUPABASE_URL=https://rxnusbfhazatuklqoyot.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4bnVzYmZoYXphdHVrbHFveW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2OTE0MjUsImV4cCI6MjA3NTI2NzQyNX0.vpsms9ociauLFz6BOnvnYF7vQWEw5cZTedKW_40sHFk"
echo "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4bnVzYmZoYXphdHVrbHFveW90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY5MTQyNSwiZXhwIjoyMDc1MjY3NDI1fQ.54o9H33N6MuL_PDLTVMS52-IWOV21fcLH4Gm2BBiPrc"
echo "CLIENT_ACCESS_TOKEN=3q4qr6qhhue497haa0nmibmqjlgrl0jnkcn43nf1ee1ncr15n66"
echo "ELEVENLABS_API_KEY=sk_d67c8d3d267334ca81d3ac2eee7a0c997b1d8404b2c11521"
echo "================================"
echo ""
echo "After adding the environment variables, redeploy by running:"
echo "vercel --prod"
echo ""
echo "🎉 Your Sunday School Music Creator will be live and ready to share!"