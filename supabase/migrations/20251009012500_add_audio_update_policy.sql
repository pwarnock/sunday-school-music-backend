-- Add UPDATE policy for audio files to allow regeneration
CREATE POLICY "Users can update their own audio files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  ) WITH CHECK (
    bucket_id = 'audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );