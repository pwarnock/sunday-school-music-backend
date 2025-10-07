#!/bin/bash

# Sunday School Music Creator - Environment Setup Script
# This script sets up environment variables for different deployment environments

set -e

echo "🎵 Sunday School Music Creator - Environment Setup"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it first with your credentials."
    exit 1
fi

# Load environment variables from .env file
source .env

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm i -g supabase"
    exit 1
fi

# Function to set Vercel environment variables
set_vercel_env() {
    local env_name=$1
    echo "🔧 Setting up $env_name environment variables in Vercel..."
    
    # Set environment variables in Vercel
    echo "  📝 Setting NEXT_PUBLIC_SUPABASE_URL..."
    echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL $env_name --force
    
    echo "  📝 Setting NEXT_PUBLIC_SUPABASE_ANON_KEY..."
    echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY $env_name --force
    
    echo "  📝 Setting GLOO_CLIENT_ID..."
    echo "$GLOO_CLIENT_ID" | vercel env add GLOO_CLIENT_ID $env_name --force
    
    echo "  📝 Setting GLOO_CLIENT_SECRET..."
    echo "$GLOO_CLIENT_SECRET" | vercel env add GLOO_CLIENT_SECRET $env_name --force
    
    echo "  📝 Setting ELEVENLABS_API_KEY..."
    echo "$ELEVENLABS_API_KEY" | vercel env add ELEVENLABS_API_KEY $env_name --force
    
    echo "✅ $env_name environment variables set successfully!"
}

# Function to create local .env file
create_local_env() {
    echo "🔧 Setting up local .env file..."
    
    cd frontend
    
    # Create .env.local file
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Gloo AI Configuration
GLOO_CLIENT_ID=$GLOO_CLIENT_ID
GLOO_CLIENT_SECRET=$GLOO_CLIENT_SECRET

# ElevenLabs Configuration
ELEVENLABS_API_KEY=$ELEVENLABS_API_KEY

# Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    
    echo "✅ Local .env.local file created successfully!"
    cd ..
}

# Function to link Vercel project
link_vercel() {
    echo "🔗 Linking Vercel project..."
    cd frontend
    
    if [ ! -f .vercel/project.json ]; then
        echo "  📝 Project not linked. Running vercel link..."
        vercel link --yes
    else
        echo "  ✅ Project already linked to Vercel"
    fi
    
    cd ..
}

# Function to check Supabase connection
check_supabase() {
    echo "🔍 Checking Supabase connection..."
    
    # Check if project is linked
    if supabase status 2>/dev/null | grep -q "RUNNING"; then
        echo "  ✅ Local Supabase is running"
    else
        echo "  ⚠️  Local Supabase is not running. Start with: supabase start"
    fi
    
    # Check remote link
    if [ -f supabase/.temp/project-ref ]; then
        PROJECT_REF=$(cat supabase/.temp/project-ref)
        echo "  📝 Remote project linked: $PROJECT_REF"
    else
        echo "  ⚠️  Remote project not linked. Link with: supabase link --project-ref YOUR_PROJECT_REF"
    fi
}

# Main menu
echo ""
echo "What would you like to set up?"
echo "1) Local development environment (.env.local)"
echo "2) Vercel production environment"
echo "3) Link Vercel project"
echo "4) Check Supabase status"
echo "5) All of the above"
echo ""
read -p "Choose an option (1-5): " choice

case $choice in
    1)
        create_local_env
        ;;
    2)
        link_vercel
        set_vercel_env "production"
        ;;
    3)
        link_vercel
        ;;
    4)
        check_supabase
        ;;
    5)
        create_local_env
        link_vercel
        set_vercel_env "production"
        check_supabase
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. If Supabase is not linked, run: supabase link --project-ref YOUR_PROJECT_REF"
echo "2. To deploy to Vercel: vercel --prod"
echo "3. To start local development: cd frontend && npm run dev"