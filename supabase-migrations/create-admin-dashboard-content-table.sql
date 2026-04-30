-- ====================================================================
-- CREATE ADMIN DASHBOARD CONTENT TABLE
-- ====================================================================
-- This table stores dashboard content (messages, slides, carousels)
-- ====================================================================

-- Create admin_dashboard_content table
CREATE TABLE IF NOT EXISTS admin_dashboard_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL UNIQUE, -- Original ID from the content
  content_type TEXT NOT NULL, -- 'message', 'slide', 'quickActions', 'community'
  title TEXT,
  content_data JSONB NOT NULL, -- The full content object
  display_order INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  countries TEXT[], -- Filter by countries (ISO codes)
  date_range_start DATE,
  date_range_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_dashboard_content_type ON admin_dashboard_content(content_type);
CREATE INDEX IF NOT EXISTS idx_admin_dashboard_content_enabled ON admin_dashboard_content(enabled);
CREATE INDEX IF NOT EXISTS idx_admin_dashboard_content_order ON admin_dashboard_content(display_order);

-- Enable RLS
ALTER TABLE admin_dashboard_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view dashboard content"
  ON admin_dashboard_content
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert dashboard content"
  ON admin_dashboard_content
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dashboard content"
  ON admin_dashboard_content
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete dashboard content"
  ON admin_dashboard_content
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_admin_dashboard_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS admin_dashboard_content_updated_at ON admin_dashboard_content;
CREATE TRIGGER admin_dashboard_content_updated_at
  BEFORE UPDATE ON admin_dashboard_content
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_dashboard_content_updated_at();

-- ====================================================================
-- CREATE CAROUSEL SETTINGS TABLE
-- ====================================================================
-- This table stores carousel configuration
-- ====================================================================

CREATE TABLE IF NOT EXISTS admin_carousel_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  desktop_ratio TEXT NOT NULL DEFAULT '16:9',
  mobile_ratio TEXT NOT NULL DEFAULT '4:3',
  transition_interval INTEGER NOT NULL DEFAULT 5000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_carousel_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view carousel settings"
  ON admin_carousel_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert carousel settings"
  ON admin_carousel_settings
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update carousel settings"
  ON admin_carousel_settings
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_admin_carousel_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS admin_carousel_settings_updated_at ON admin_carousel_settings;
CREATE TRIGGER admin_carousel_settings_updated_at
  BEFORE UPDATE ON admin_carousel_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_carousel_settings_updated_at();

-- Insert default carousel settings (only one row should exist)
INSERT INTO admin_carousel_settings (desktop_ratio, mobile_ratio, transition_interval)
VALUES ('16:9', '4:3', 5000)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- DONE! ✅
-- ====================================================================
