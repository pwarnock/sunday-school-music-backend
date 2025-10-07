-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio',
  'audio',
  true,
  52428800, -- 50MB in bytes
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for audio bucket
CREATE POLICY "Users can view audio files" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');

CREATE POLICY "Users can upload audio files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own audio files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );