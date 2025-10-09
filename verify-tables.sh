#!/bin/bash

source .env

echo "Verifying streak tracking tables..."

# Test each table
tables=("user_streaks" "daily_activities" "activity_events")

for table in "${tables[@]}"; do
    echo -n "Checking $table table... "
    
    response=$(curl -s -X GET \
        "${SUPABASE_URL}/rest/v1/${table}?select=count" \
        -H "apikey: ${SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
        -H "Prefer: count=exact")
    
    if echo "$response" | grep -q "PGRST205"; then
        echo "❌ NOT FOUND"
    else
        echo "✅ EXISTS"
    fi
done

echo -e "\nTesting table structure..."

# Test user_streaks structure
echo -e "\nuser_streaks columns:"
curl -s -X GET \
    "${SUPABASE_URL}/rest/v1/user_streaks?limit=0" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Prefer: return=headers-only" \
    -I | grep -i "content-range" || echo "Could not fetch table info"

echo -e "\nAll done!"