-- Create function to save song and deduct credit atomically
CREATE OR REPLACE FUNCTION save_song_with_credit_deduction(
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
  current_credits INTEGER;
  new_song_id UUID;
BEGIN
  -- Check current credits
  SELECT credits_remaining INTO current_credits
  FROM users_profile
  WHERE users_profile.id = p_user_id;
  
  -- Ensure user has credits
  IF current_credits IS NULL OR current_credits <= 0 THEN
    RAISE EXCEPTION 'No credits remaining';
  END IF;
  
  -- Generate new UUID for song
  new_song_id := gen_random_uuid();
  
  -- Insert song
  INSERT INTO songs (id, user_id, title, lyrics, theme)
  VALUES (new_song_id, p_user_id, p_title, p_lyrics, p_theme);
  
  -- Deduct credit
  UPDATE users_profile
  SET credits_remaining = credits_remaining - 1
  WHERE users_profile.id = p_user_id;
  
  -- Return the created song
  RETURN QUERY
  SELECT s.id, s.user_id, s.title, s.lyrics, s.theme, s.audio_url, s.created_at
  FROM songs s
  WHERE s.id = new_song_id;
END;
$$;