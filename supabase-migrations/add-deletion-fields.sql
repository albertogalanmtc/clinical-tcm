-- Add columns for account deletion functionality
-- Run this in your Supabase SQL Editor

ALTER TABLE users
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_token TEXT;

-- Add index on deletion_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_deletion_token ON users(deletion_token);

-- Optional: Add a function to clean up expired deletion requests (older than 24 hours without confirmation)
-- This can be run as a cron job
CREATE OR REPLACE FUNCTION cleanup_expired_deletion_requests()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users
  SET deletion_requested_at = NULL,
      deletion_token = NULL
  WHERE deletion_requested_at IS NOT NULL
    AND deletion_requested_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Comment explaining the columns
COMMENT ON COLUMN users.deletion_requested_at IS 'Timestamp when user requested account deletion';
COMMENT ON COLUMN users.deletion_token IS 'Unique token for confirming account deletion via email link';
