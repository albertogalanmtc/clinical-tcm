-- ====================================================================
-- CREATE ADMIN PLATFORM SETTINGS TABLE
-- ====================================================================
-- This table stores platform settings (Legal, Branding, Help, etc.)
-- ====================================================================

-- Create admin_platform_settings table
CREATE TABLE IF NOT EXISTS admin_platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE, -- 'legal_documents', 'help_support', 'company_info', 'branding', 'compliance', 'authentication', 'design_settings', 'banner_settings'
  setting_value JSONB NOT NULL, -- The actual configuration as JSON
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_platform_settings_key ON admin_platform_settings(setting_key);

-- Enable RLS
ALTER TABLE admin_platform_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view platform settings"
  ON admin_platform_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert platform settings"
  ON admin_platform_settings
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update platform settings"
  ON admin_platform_settings
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete platform settings"
  ON admin_platform_settings
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_admin_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS admin_platform_settings_updated_at ON admin_platform_settings;
CREATE TRIGGER admin_platform_settings_updated_at
  BEFORE UPDATE ON admin_platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_platform_settings_updated_at();

-- ====================================================================
-- DONE! ✅
-- ====================================================================
-- Note: Default values will be inserted by the application on first load
-- ====================================================================
