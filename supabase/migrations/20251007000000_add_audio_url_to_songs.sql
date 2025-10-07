-- Add audio_url column to songs table
ALTER TABLE songs ADD COLUMN audio_url TEXT;

-- Add index for better performance when filtering by audio_url
CREATE INDEX songs_audio_url_idx ON songs(audio_url) WHERE audio_url IS NOT NULL;