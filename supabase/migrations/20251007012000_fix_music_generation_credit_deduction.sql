-- Fix the generate_music_with_credit_deduction function to actually deduct credits
CREATE OR REPLACE FUNCTION generate_music_with_credit_deduction(
  p_user_id UUID,
  p_song_id UUID,
  p_audio_url TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Check current credits
  SELECT credits_remaining INTO current_credits
  FROM users_profile
  WHERE id = p_user_id;
  
  -- Ensure user has credits
  IF current_credits IS NULL OR current_credits <= 0 THEN
    RAISE EXCEPTION 'No credits remaining for music generation';
  END IF;
  
  -- Update the song with the audio URL
  UPDATE songs
  SET audio_url = p_audio_url,
      updated_at = NOW()
  WHERE id = p_song_id AND user_id = p_user_id;
  
  -- Check if the song update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Song not found or user does not have permission';
  END IF;
  
  -- Deduct credit for music generation
  UPDATE users_profile
  SET credits_remaining = credits_remaining - 1
  WHERE id = p_user_id;
END;
$$;