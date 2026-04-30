-- ====================================================================
-- CREATE MESSAGE DISMISSALS TABLE
-- ====================================================================
-- This table tracks which dashboard messages each user has dismissed
-- so they won't see them again across devices/browsers
-- ====================================================================

-- Create message_dismissals table to track when users dismiss dashboard messages
CREATE TABLE IF NOT EXISTS message_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_message_dismissals_message_user
ON message_dismissals(message_id, user_id);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_message_dismissals_user
ON message_dismissals(user_id);

-- Enable RLS
ALTER TABLE message_dismissals ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own dismissals
CREATE POLICY "Users can view own message dismissals"
  ON message_dismissals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own dismissals
CREATE POLICY "Users can dismiss messages"
  ON message_dismissals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own dismissals (if they want to see a message again)
CREATE POLICY "Users can delete own message dismissals"
  ON message_dismissals
  FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- DONE! ✅
-- ====================================================================
-- Now when users dismiss dashboard messages:
-- - It saves to their Supabase account (not just localStorage)
-- - They won't see dismissed messages on other devices/browsers
-- - If they clear cookies, dismissed messages stay dismissed
-- ====================================================================
