-- ====================================================================
-- CREATE ADMIN SAFETY CATEGORIES TABLE
-- ====================================================================
-- This table stores custom safety categories configuration
-- ====================================================================

-- Create admin_safety_categories table
CREATE TABLE IF NOT EXISTS admin_safety_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL UNIQUE, -- Original category ID (e.g., 'pregnancy', 'lactation')
  display_name TEXT NOT NULL, -- Display name for UI
  is_active BOOLEAN NOT NULL DEFAULT true, -- Whether this category is enabled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_admin_safety_categories_category_id ON admin_safety_categories(category_id);

-- Enable RLS
ALTER TABLE admin_safety_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view safety categories"
  ON admin_safety_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert safety categories"
  ON admin_safety_categories
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update safety categories"
  ON admin_safety_categories
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete safety categories"
  ON admin_safety_categories
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_admin_safety_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS admin_safety_categories_updated_at ON admin_safety_categories;
CREATE TRIGGER admin_safety_categories_updated_at
  BEFORE UPDATE ON admin_safety_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_safety_categories_updated_at();

-- ====================================================================
-- DONE! ✅
-- ====================================================================
