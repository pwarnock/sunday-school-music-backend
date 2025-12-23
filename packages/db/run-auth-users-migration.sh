#!/bin/bash

source .env

echo "Executing streak tracking migration with auth.users reference..."

# Read the SQL file
SQL_CONTENT=$(cat streak-tables-auth-users.sql)

# Execute via Supabase REST API
echo "Creating tables via REST API..."

# Split SQL into individual statements and execute each
IFS=';' read -ra STATEMENTS <<< "$SQL_CONTENT"

count=1
total=${#STATEMENTS[@]}

for statement in "${STATEMENTS[@]}"; do
    # Skip empty statements
    if [[ -z "${statement// }" ]]; then
        continue
    fi
    
    echo -n "Executing statement $count/$total... "
    
    # Execute the statement
    response=$(curl -s -X POST \
        "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$statement;\"}" 2>&1)
    
    if [[ $? -eq 0 ]]; then
        echo "✓"
    else
        echo "✗"
        echo "Error: $response"
    fi
    
    ((count++))
done

echo -e "\nMigration complete! Verifying tables..."
./verify-tables.sh