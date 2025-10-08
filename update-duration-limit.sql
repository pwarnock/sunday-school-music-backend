-- Script to update music generation duration limit
-- Run this in Supabase SQL editor or via command line

-- View current configuration
SELECT * FROM music_generation_config;

-- Update to allow up to 120 seconds
UPDATE music_generation_config 
SET max_duration_seconds = 120,
    updated_at = NOW()
WHERE id = (SELECT id FROM music_generation_config LIMIT 1);

-- Verify the change
SELECT * FROM music_generation_config;