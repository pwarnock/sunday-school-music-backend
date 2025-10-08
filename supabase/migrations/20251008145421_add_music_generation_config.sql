-- Create system configuration table for music generation settings
CREATE TABLE IF NOT EXISTS public.music_generation_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  max_duration_seconds INTEGER NOT NULL DEFAULT 60 CHECK (max_duration_seconds IN (30, 60, 90, 120)),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default configuration
INSERT INTO music_generation_config (max_duration_seconds) VALUES (60);

-- Add duration tracking to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS requested_duration_seconds INTEGER DEFAULT 60;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS generated_duration_seconds INTEGER;

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_songs_duration ON songs(requested_duration_seconds, generated_duration_seconds);

-- RLS policies for configuration
ALTER TABLE music_generation_config ENABLE ROW LEVEL SECURITY;

-- Only admins can view/update config (implement admin role check as needed)
CREATE POLICY "Config viewable by authenticated users" ON music_generation_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Track duration selection attempts
CREATE TABLE IF NOT EXISTS public.music_generation_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  requested_duration INTEGER NOT NULL,
  allowed_duration INTEGER NOT NULL,
  was_limited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX idx_generation_attempts_user_created 
ON music_generation_attempts(user_id, created_at DESC);

-- RLS for attempts table
ALTER TABLE music_generation_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts" ON music_generation_attempts
  FOR SELECT USING (auth.uid() = user_id);