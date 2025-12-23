#!/bin/bash

# Navigate to frontend directory to access .env.local
cd frontend

# Extract environment variables
SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d'=' -f2 | head -1)
SUPABASE_SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d'=' -f2 | head -1)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "Error: Missing Supabase credentials in .env.local"
    exit 1
fi

echo "Using Supabase URL: ${SUPABASE_URL:0:30}..."
echo "Executing streak tracking migration..."

# SQL statements to execute
SQL_STATEMENTS=(
'CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
  current_visit_streak INTEGER DEFAULT 0,
  longest_visit_streak INTEGER DEFAULT 0,
  current_activity_streak INTEGER DEFAULT 0,
  longest_activity_streak INTEGER DEFAULT 0,
  last_visit_date DATE,
  last_activity_date DATE,
  total_visits INTEGER DEFAULT 0,
  total_activities INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('\''utc'\''::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('\''utc'\''::text, now()),
  UNIQUE(user_id)
)'

'CREATE TABLE IF NOT EXISTS daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  visit_count INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  songs_generated INTEGER DEFAULT 0,
  chat_sessions INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  first_visit_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('\''utc'\''::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('\''utc'\''::text, now()),
  UNIQUE(user_id, activity_date)
)'

'CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('\''visit'\'', '\''message_sent'\'', '\''song_generated'\'', '\''chat_started'\'', '\''session_ended'\'')),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('\''utc'\''::text, now())
)'

'CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id)'
'CREATE INDEX IF NOT EXISTS idx_daily_activities_user_date ON daily_activities(user_id, activity_date)'
'CREATE INDEX IF NOT EXISTS idx_activity_events_user_type ON activity_events(user_id, event_type)'

'ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY'
'ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY'
'ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY'

'DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks'
'CREATE POLICY "Users can view own streaks" ON user_streaks FOR ALL USING (auth.uid() = user_id)'

'DROP POLICY IF EXISTS "Users can view own daily activities" ON daily_activities'
'CREATE POLICY "Users can view own daily activities" ON daily_activities FOR ALL USING (auth.uid() = user_id)'

'DROP POLICY IF EXISTS "Users can view own activity events" ON activity_events'
'CREATE POLICY "Users can view own activity events" ON activity_events FOR ALL USING (auth.uid() = user_id)'
)

# Try to execute each statement
echo "Attempting to create tables via REST API..."

for i in "${!SQL_STATEMENTS[@]}"; do
    echo -n "Executing statement $((i+1))/${#SQL_STATEMENTS[@]}... "
    
    # Try using the query endpoint
    RESPONSE=$(curl -s -X POST \
        "${SUPABASE_URL}/rest/v1/rpc/query" \
        -H "apikey: ${SUPABASE_SERVICE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"${SQL_STATEMENTS[$i]}\"}" 2>&1)
    
    if [ $? -eq 0 ]; then
        echo "✓"
    else
        echo "✗"
    fi
done

echo ""
echo "Migration attempt complete!"
echo ""
echo "To verify the tables were created:"
echo "1. Go to: https://supabase.com/dashboard/project/rxnusbfhazatuklqoyot/editor"
echo "2. Click on 'Table Editor' in the left sidebar"
echo "3. Look for: user_streaks, daily_activities, and activity_events tables"
echo ""
echo "If the tables don't exist, please:"
echo "1. Go to the SQL Editor in Supabase"
echo "2. Copy the SQL from: simple-streak-tables.sql"
echo "3. Run it manually"