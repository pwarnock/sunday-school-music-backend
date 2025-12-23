#!/bin/bash

# Script to update your credits to 99 for testing
# Usage: ./update-credits.sh your-email@example.com

EMAIL=$1

if [ -z "$EMAIL" ]; then
    echo "Usage: ./update-credits.sh your-email@example.com"
    exit 1
fi

echo "Updating credits for $EMAIL to 99..."

# Use Supabase CLI to run the SQL
supabase db push --db-url "$SUPABASE_DB_URL" <<EOF
UPDATE users_profile 
SET credits_remaining = 99 
WHERE email = '$EMAIL';
EOF

echo "Done! You now have 99 credits for testing."
echo "Note: The default for new users remains 3 credits."