-- Update credits for testing purposes
-- This will give you 99 credits while keeping the default at 3 for new users

-- First, let's check your current user
SELECT id, email, credits_remaining 
FROM users_profile 
WHERE email = 'YOUR_EMAIL_HERE';

-- Update your credits to 99
-- Replace 'YOUR_EMAIL_HERE' with your actual email
UPDATE users_profile 
SET credits_remaining = 99 
WHERE email = 'YOUR_EMAIL_HERE';

-- Verify the update
SELECT id, email, credits_remaining 
FROM users_profile 
WHERE email = 'YOUR_EMAIL_HERE';

-- Note: The default for new users remains 3 credits as defined in the schema