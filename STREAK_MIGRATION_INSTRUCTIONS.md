# Streak Tracking Migration Instructions

Since we're having connectivity issues with the Supabase CLI, please follow these steps to manually create the streak tracking tables:

## Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/rxnusbfhazatuklqoyot
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the following SQL:

```sql
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
```

5. Click "Run" to execute the SQL
6. You should see "Success. No rows returned" or similar confirmation

## Option 2: Test Without Database Tables

If you want to test the app without the streak tracking for now:

1. Comment out the StreakDisplay component in Dashboard.tsx
2. The app will run normally without streak tracking

## Verification

Once the tables are created, you can verify by:

1. Going to the "Table Editor" in Supabase dashboard
2. You should see three new tables: `user_streaks`, `daily_activities`, and `activity_events`

## Next Steps

After creating the tables:
1. The app should run at http://localhost:3000
2. Log in and use the app - streak tracking will happen automatically
3. Check the StreakDisplay component in the dashboard to see your streaks grow

Let me know once you've run the SQL and I can help test the streak tracking functionality!