-- Streak Tracking Database Schema
-- Tracks daily visits and activities for streak calculations

-- User streak summary table
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('visit', 'message_sent', 'song_generated', 'chat_started', 'session_ended')),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_date ON daily_activities(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_daily_activities_date ON daily_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_activity_events_user_type ON activity_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_activity_events_created ON activity_events(created_at);

-- Enable Row Level Security
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own streak data
CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily activities" ON daily_activities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity events" ON activity_events
  FOR ALL USING (auth.uid() = user_id);

-- Function to update streak calculations
CREATE OR REPLACE FUNCTION calculate_streaks(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  v_yesterday DATE := p_date - INTERVAL '1 day';
  v_current_visit_streak INTEGER := 0;
  v_current_activity_streak INTEGER := 0;
  v_last_visit_date DATE;
  v_last_activity_date DATE;
  v_has_visit BOOLEAN := FALSE;
  v_has_activity BOOLEAN := FALSE;
BEGIN
  -- Check if user had activity today
  SELECT 
    visit_count > 0,
    (messages_sent + songs_generated + chat_sessions) > 0
  INTO v_has_visit, v_has_activity
  FROM daily_activities 
  WHERE user_id = p_user_id AND activity_date = p_date;
  
  -- Get current streak data
  SELECT last_visit_date, last_activity_date, current_visit_streak, current_activity_streak
  INTO v_last_visit_date, v_last_activity_date, v_current_visit_streak, v_current_activity_streak
  FROM user_streaks 
  WHERE user_id = p_user_id;
  
  -- Calculate visit streak
  IF v_has_visit THEN
    IF v_last_visit_date = v_yesterday THEN
      -- Continue streak
      v_current_visit_streak := v_current_visit_streak + 1;
    ELSIF v_last_visit_date = p_date THEN
      -- Same day, no change
      v_current_visit_streak := v_current_visit_streak;
    ELSE
      -- New streak starts
      v_current_visit_streak := 1;
    END IF;
    v_last_visit_date := p_date;
  ELSE
    -- No visit today, check if streak should be broken
    IF v_last_visit_date < v_yesterday THEN
      v_current_visit_streak := 0;
    END IF;
  END IF;
  
  -- Calculate activity streak
  IF v_has_activity THEN
    IF v_last_activity_date = v_yesterday THEN
      -- Continue streak
      v_current_activity_streak := v_current_activity_streak + 1;
    ELSIF v_last_activity_date = p_date THEN
      -- Same day, no change
      v_current_activity_streak := v_current_activity_streak;
    ELSE
      -- New streak starts
      v_current_activity_streak := 1;
    END IF;
    v_last_activity_date := p_date;
  ELSE
    -- No activity today, check if streak should be broken
    IF v_last_activity_date < v_yesterday THEN
      v_current_activity_streak := 0;
    END IF;
  END IF;
  
  -- Update or insert streak data
  INSERT INTO user_streaks (
    user_id, current_visit_streak, current_activity_streak,
    last_visit_date, last_activity_date,
    longest_visit_streak, longest_activity_streak
  ) VALUES (
    p_user_id, v_current_visit_streak, v_current_activity_streak,
    v_last_visit_date, v_last_activity_date,
    GREATEST(v_current_visit_streak, COALESCE((SELECT longest_visit_streak FROM user_streaks WHERE user_id = p_user_id), 0)),
    GREATEST(v_current_activity_streak, COALESCE((SELECT longest_activity_streak FROM user_streaks WHERE user_id = p_user_id), 0))
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_visit_streak = v_current_visit_streak,
    current_activity_streak = v_current_activity_streak,
    last_visit_date = v_last_visit_date,
    last_activity_date = v_last_activity_date,
    longest_visit_streak = GREATEST(v_current_visit_streak, user_streaks.longest_visit_streak),
    longest_activity_streak = GREATEST(v_current_activity_streak, user_streaks.longest_activity_streak),
    updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activity and update daily stats
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_now TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
BEGIN
  -- Log the event
  INSERT INTO activity_events (user_id, event_type, event_data, created_at)
  VALUES (p_user_id, p_event_type, p_event_data, v_now);
  
  -- Update daily activity stats
  INSERT INTO daily_activities (
    user_id, activity_date,
    visit_count, messages_sent, songs_generated, chat_sessions,
    first_visit_at, last_activity_at
  ) VALUES (
    p_user_id, v_today,
    CASE WHEN p_event_type = 'visit' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'message_sent' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'song_generated' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'chat_started' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'visit' THEN v_now ELSE NULL END,
    v_now
  )
  ON CONFLICT (user_id, activity_date) DO UPDATE SET
    visit_count = daily_activities.visit_count + CASE WHEN p_event_type = 'visit' THEN 1 ELSE 0 END,
    messages_sent = daily_activities.messages_sent + CASE WHEN p_event_type = 'message_sent' THEN 1 ELSE 0 END,
    songs_generated = daily_activities.songs_generated + CASE WHEN p_event_type = 'song_generated' THEN 1 ELSE 0 END,
    chat_sessions = daily_activities.chat_sessions + CASE WHEN p_event_type = 'chat_started' THEN 1 ELSE 0 END,
    first_visit_at = CASE 
      WHEN p_event_type = 'visit' AND daily_activities.first_visit_at IS NULL THEN v_now
      ELSE daily_activities.first_visit_at
    END,
    last_activity_at = v_now,
    updated_at = v_now;
  
  -- Update total counters in user_streaks
  UPDATE user_streaks SET
    total_visits = total_visits + CASE WHEN p_event_type = 'visit' THEN 1 ELSE 0 END,
    total_activities = total_activities + CASE WHEN p_event_type IN ('message_sent', 'song_generated', 'chat_started') THEN 1 ELSE 0 END,
    updated_at = v_now
  WHERE user_id = p_user_id;
  
  -- Recalculate streaks
  PERFORM calculate_streaks(p_user_id, v_today);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;