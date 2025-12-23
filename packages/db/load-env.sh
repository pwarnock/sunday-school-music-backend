#!/bin/bash

# Load credentials from 1Password using op run
echo "Loading credentials from 1Password..."

# Check if op is installed
if ! command -v op &> /dev/null; then
    echo "1Password CLI (op) is not installed. Please install it first."
    exit 1
fi

# Execute the command with 1Password injection
if [ $# -gt 0 ]; then
    echo "Executing with 1Password: $@"
    op run -- "$@"
else
    echo "Usage: ./load-env.sh <command>"
    echo ""
    echo "Examples:"
    echo "  ./load-env.sh supabase link --project-ref YOUR_PROJECT_REF"
    echo "  ./load-env.sh supabase db push"
    echo "  ./load-env.sh supabase start"
    echo "  ./load-env.sh npm run dev"
fi