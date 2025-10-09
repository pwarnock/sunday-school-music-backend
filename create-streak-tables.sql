-- IMPORTANT: Run this SQL in your Supabase Dashboard SQL Editor
-- Go to: https://supabase.com/dashboard/project/rxnusbfhazatuklqoyot/sql/new
-- Paste this entire SQL and click "Run"

-- First, drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS activity_events CASCADE;
DROP TABLE IF EXISTS daily_activities CASCADE;
DROP TABLE IF EXISTS user_streaks CASCADE;

-- Create the streak tracking tables
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE TABLE daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE TABLE activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('visit', 'message_sent', 'song_generated', 'chat_started', 'session_ended')),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_daily_activities_user_date ON daily_activities(user_id, activity_date);
CREATE INDEX idx_activity_events_user_type ON activity_events(user_id, event_type);
CREATE INDEX idx_activity_events_created_at ON activity_events(created_at);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily activities" ON daily_activities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity events" ON activity_events
  FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON user_streaks TO authenticated;
GRANT ALL ON daily_activities TO authenticated;
GRANT ALL ON activity_events TO authenticated;

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_activities_updated_at BEFORE UPDATE ON daily_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT 'Tables created successfully!' as status;