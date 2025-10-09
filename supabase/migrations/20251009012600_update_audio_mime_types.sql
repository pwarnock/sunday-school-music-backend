-- Update allowed MIME types for audio bucket to include all WAV variants
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave']
WHERE id = 'audio';