-- Create table to track email resend attempts
CREATE TABLE IF NOT EXISTS public.email_resend_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('confirmation', 'password_reset')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_email_resend_attempts_email_created 
ON email_resend_attempts(email, created_at DESC);

-- Create index for rate limiting checks
CREATE INDEX idx_email_resend_attempts_email_type_created 
ON email_resend_attempts(email, attempt_type, created_at DESC);

-- RLS policies
ALTER TABLE email_resend_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (for security)
CREATE POLICY "Service role can insert resend attempts" 
ON email_resend_attempts 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Service role can read all attempts
CREATE POLICY "Service role can read resend attempts" 
ON email_resend_attempts 
FOR SELECT 
TO service_role 
USING (true);