-- ====================================================================
-- CREATE COOKIE CONSENT TABLE
-- ====================================================================
-- This table tracks user cookie consent preferences (GDPR compliant)
-- ====================================================================

-- Create cookie_consent table
CREATE TABLE IF NOT EXISTS cookie_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For non-authenticated users
  necessary BOOLEAN NOT NULL DEFAULT true, -- Always true (can't be disabled)
  functional BOOLEAN NOT NULL DEFAULT false,
  analytics BOOLEAN NOT NULL DEFAULT false,
  marketing BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE(user_id), -- One consent record per authenticated user
  UNIQUE(session_id) -- One consent record per session for non-auth users
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cookie_consent_user
ON cookie_consent(user_id);

CREATE INDEX IF NOT EXISTS idx_cookie_consent_session
ON cookie_consent(session_id);

-- Enable RLS
ALTER TABLE cookie_consent ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own consent
CREATE POLICY "Users can view own cookie consent"
  ON cookie_consent
  FOR SELECT
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Users can insert their own consent
CREATE POLICY "Users can create cookie consent"
  ON cookie_consent
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

-- Users can update their own consent
CREATE POLICY "Users can update cookie consent"
  ON cookie_consent
  FOR UPDATE
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_cookie_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS cookie_consent_updated_at ON cookie_consent;
CREATE TRIGGER cookie_consent_updated_at
  BEFORE UPDATE ON cookie_consent
  FOR EACH ROW
  EXECUTE FUNCTION update_cookie_consent_updated_at();

-- ====================================================================
-- DONE! ✅
-- ====================================================================
