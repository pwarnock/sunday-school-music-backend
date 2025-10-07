-- Fix: Credits should only be deducted when generating music, not when saving song lyrics
-- Create a new function to save songs without deducting credits

CREATE OR REPLACE FUNCTION save_song_without_credit_deduction(
  p_user_id UUID,
  p_title TEXT,
  p_lyrics TEXT,
  p_theme TEXT
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  title TEXT,
  lyrics TEXT,
  theme TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
DECLARE
  new_song_id UUID;
BEGIN
  -- Generate new UUID for song
  new_song_id := gen_random_uuid();
  
  -- Insert song without deducting credits
  INSERT INTO songs (id, user_id, title, lyrics, theme)
  VALUES (new_song_id, p_user_id, p_title, p_lyrics, p_theme);
  
  -- Return the created song
  RETURN QUERY
  SELECT s.id, s.user_id, s.title, s.lyrics, s.theme, s.audio_url, s.created_at
  FROM songs s
  WHERE s.id = new_song_id;
END;
$$;