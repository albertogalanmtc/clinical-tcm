-- Create banner_dismissals table to track when users permanently dismiss banners
CREATE TABLE IF NOT EXISTS banner_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL REFERENCES banners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(banner_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_banner_dismissals_banner_user
ON banner_dismissals(banner_id, user_id);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_banner_dismissals_user
ON banner_dismissals(user_id);

-- Enable RLS
ALTER TABLE banner_dismissals ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own dismissals
CREATE POLICY "Users can view own dismissals"
  ON banner_dismissals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own dismissals
CREATE POLICY "Users can dismiss banners"
  ON banner_dismissals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own dismissals (if they want to see a banner again)
CREATE POLICY "Users can delete own dismissals"
  ON banner_dismissals
  FOR DELETE
  USING (auth.uid() = user_id);
