-- Create function to generate music and update song atomically
CREATE OR REPLACE FUNCTION generate_music_with_credit_deduction(
  p_user_id UUID,
  p_song_id UUID,
  p_audio_url TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the song with the audio URL
  UPDATE songs
  SET audio_url = p_audio_url,
      updated_at = NOW()
  WHERE id = p_song_id AND user_id = p_user_id;
  
  -- Check if the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Song not found or user does not have permission';
  END IF;
END;
$$;