-- ====================================================================
-- CREATE ADMIN BANNERS TABLE
-- ====================================================================
-- This table stores banners and surveys configuration
-- ====================================================================

-- Create admin_banners table
CREATE TABLE IF NOT EXISTS admin_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id TEXT NOT NULL UNIQUE, -- Original banner ID
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  banner_type TEXT NOT NULL, -- 'info', 'survey', 'promotion'
  display_mode TEXT NOT NULL, -- 'banner', 'modal'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'

  -- Survey fields
  survey_id TEXT,
  question TEXT,
  response_type TEXT, -- 'rating', 'multiple_choice', 'text'
  options JSONB, -- For multiple choice
  min_label TEXT,
  max_label TEXT,

  -- Display settings
  start_date DATE,
  end_date DATE,
  max_displays INTEGER,
  display_frequency TEXT, -- 'once', 'daily', 'weekly'

  -- Styling
  background_color TEXT,
  text_color TEXT,
  button_color TEXT,
  icon_type TEXT,

  -- Links
  link_url TEXT,
  link_text TEXT,

  -- Other
  dismissible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_banners_banner_id ON admin_banners(banner_id);
CREATE INDEX IF NOT EXISTS idx_admin_banners_status ON admin_banners(status);
CREATE INDEX IF NOT EXISTS idx_admin_banners_type ON admin_banners(banner_type);

-- Enable RLS
ALTER TABLE admin_banners ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view banners"
  ON admin_banners
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert banners"
  ON admin_banners
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update banners"
  ON admin_banners
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete banners"
  ON admin_banners
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_admin_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS admin_banners_updated_at ON admin_banners;
CREATE TRIGGER admin_banners_updated_at
  BEFORE UPDATE ON admin_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_banners_updated_at();

-- ====================================================================
-- DONE! ✅
-- ====================================================================
