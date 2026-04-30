-- ====================================================================
-- CREATE ADMIN PLANS TABLE
-- ====================================================================
-- This table stores plan configurations (Free, Practitioner, Advanced)
-- ====================================================================

-- Create admin_plans table
CREATE TABLE IF NOT EXISTS admin_plans (
  id TEXT PRIMARY KEY, -- Plan ID (e.g., '1', '2', '3')
  code TEXT NOT NULL UNIQUE, -- Plan code: 'free', 'practitioner', 'advanced'
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'hidden'
  stripe_price_id TEXT, -- Deprecated: use monthly/yearly
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  monthly_price NUMERIC(10,2),
  yearly_price NUMERIC(10,2),
  is_popular BOOLEAN DEFAULT false,
  badge_icon_svg TEXT, -- SVG content for badge icon
  features JSONB NOT NULL, -- All feature flags
  herb_detail_permissions JSONB, -- Herb detail view permissions
  formula_detail_permissions JSONB, -- Formula detail view permissions
  limits JSONB NOT NULL, -- Monthly formulas, max prescriptions
  offer JSONB, -- Special offer configuration
  membership_display JSONB, -- Custom features for membership page
  safety_engine_mode TEXT DEFAULT 'disabled', -- 'disabled', 'basic', 'advanced'
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_plans_code ON admin_plans(code);

-- Enable RLS
ALTER TABLE admin_plans ENABLE ROW LEVEL SECURITY;

-- Create policies (read-only for all users, write-only for authenticated admins)
CREATE POLICY "Anyone can view plans"
  ON admin_plans
  FOR SELECT
  USING (true);

-- Only authenticated users can modify (you can add admin role check later)
CREATE POLICY "Authenticated users can insert plans"
  ON admin_plans
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update plans"
  ON admin_plans
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete plans"
  ON admin_plans
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_admin_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS admin_plans_updated_at ON admin_plans;
CREATE TRIGGER admin_plans_updated_at
  BEFORE UPDATE ON admin_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_plans_updated_at();

-- Insert default plans (Free, Practitioner, Advanced)
INSERT INTO admin_plans (id, code, name, description, status, stripe_price_id_monthly, stripe_price_id_yearly, monthly_price, yearly_price, is_popular, features, limits, safety_engine_mode, last_updated)
VALUES
  (
    '1',
    'free',
    'Free',
    'Basic access to TCM resources',
    'active',
    '',
    '',
    0,
    0,
    false,
    '{"herbLibraryAccess": "sample", "formulaLibraryAccess": "sample", "builder": false, "prescriptionLibrary": false, "statistics": false, "herbPropertyFilters": false, "formulaPropertyFilters": false, "clinicalUseFilters": false, "generalConditions": false, "medications": false, "allergies": false, "tcmRiskPatterns": false, "pharmacologicalEffectsFilter": false, "biologicalMechanismsFilter": false, "bioactiveCompoundsFilter": false, "customContent": false, "dashboardNews": true, "dashboardCommunity": true}'::jsonb,
    '{"monthlyFormulas": 0}'::jsonb,
    'disabled',
    now()
  ),
  (
    '2',
    'practitioner',
    'Practitioner',
    'Full access for individual practitioners',
    'active',
    'price_practitioner_monthly',
    'price_practitioner_yearly',
    9,
    90,
    true,
    '{"herbLibraryAccess": "full", "formulaLibraryAccess": "full", "builder": true, "prescriptionLibrary": true, "statistics": true, "herbPropertyFilters": true, "formulaPropertyFilters": true, "clinicalUseFilters": true, "generalConditions": true, "medications": true, "allergies": true, "tcmRiskPatterns": true, "pharmacologicalEffectsFilter": true, "biologicalMechanismsFilter": true, "bioactiveCompoundsFilter": true, "customContent": false, "dashboardNews": true, "dashboardCommunity": true}'::jsonb,
    '{"monthlyFormulas": 100}'::jsonb,
    'basic',
    now()
  ),
  (
    '3',
    'advanced',
    'Advanced',
    'Advanced features for professionals',
    'active',
    'price_advanced_monthly',
    'price_advanced_yearly',
    19,
    190,
    false,
    '{"herbLibraryAccess": "full", "formulaLibraryAccess": "full", "builder": true, "prescriptionLibrary": true, "statistics": true, "herbPropertyFilters": true, "formulaPropertyFilters": true, "clinicalUseFilters": true, "generalConditions": true, "medications": true, "allergies": true, "tcmRiskPatterns": true, "pharmacologicalEffectsFilter": true, "biologicalMechanismsFilter": true, "bioactiveCompoundsFilter": true, "customContent": false, "dashboardNews": true, "dashboardCommunity": true}'::jsonb,
    '{"monthlyFormulas": null}'::jsonb,
    'advanced',
    now()
  )
ON CONFLICT (code) DO NOTHING;

-- ====================================================================
-- DONE! ✅
-- ====================================================================
