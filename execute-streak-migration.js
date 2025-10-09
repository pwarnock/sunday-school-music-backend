const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'frontend', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

const sql = `
-- User streak summary table
CREATE TABLE IF NOT EXISTS user_streaks (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id)
);

-- Daily activity log table
CREATE TABLE IF NOT EXISTS daily_activities (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, activity_date)
);

-- Activity events log (detailed tracking)
CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('visit', 'message_sent', 'song_generated', 'chat_started', 'session_ended')),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_date ON daily_activities(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_activity_events_user_type ON activity_events(user_id, event_type);

-- Enable Row Level Security
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks;
CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own daily activities" ON daily_activities;
CREATE POLICY "Users can view own daily activities" ON daily_activities
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own activity events" ON activity_events;
CREATE POLICY "Users can view own activity events" ON activity_events
  FOR ALL USING (auth.uid() = user_id);
`;

async function executeMigration() {
  console.log('Executing streak tracking migration...');
  
  try {
    // Execute SQL directly using the admin API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
      console.log('✅ Migration executed successfully!');
      console.log('Tables created: user_streaks, daily_activities, activity_events');
    } else {
      const error = await response.text();
      console.error('❌ Migration failed:', error);
      console.log('\nTrying alternative approach...');
      
      // Try executing statements one by one
      const statements = sql.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec', { query: statement + ';' });
            if (error) {
              console.error('Statement failed:', error.message);
            }
          } catch (e) {
            // Continue with next statement
          }
        }
      }
    }
  } catch (error) {
    console.error('Error executing migration:', error);
    console.log('\nPlease run the SQL manually in the Supabase SQL Editor.');
  }
}

executeMigration();