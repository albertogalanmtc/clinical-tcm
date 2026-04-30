-- ====================================================================
-- PLANS CONFIGURATION TABLE - Centralized Plan Management
-- ====================================================================
-- This table stores plan configurations so changes in Admin Panel
-- affect ALL users immediately (not just localStorage)
-- ====================================================================

-- ====================================================================
-- 1. PLANS TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT UNIQUE NOT NULL CHECK (plan_type IN ('free', 'pro', 'practitioner', 'clinic', 'advanced')),
  name TEXT NOT NULL,
  description TEXT,

  -- Features (JSON object with all plan features)
  features JSONB NOT NULL DEFAULT '{
    "herbLibraryAccess": "none",
    "formulaLibraryAccess": "none",
    "builder": false,
    "prescriptionLibrary": false,
    "statistics": false,
    "herbPropertyFilters": false,
    "formulaPropertyFilters": false,
    "clinicalUseFilters": false,
    "generalConditions": false,
    "medications": false,
    "allergies": false,
    "tcmRiskPatterns": false,
    "pharmacologicalEffectsFilter": false,
    "biologicalMechanismsFilter": false,
    "bioactiveCompoundsFilter": false,
    "customContent": false,
    "safetyEngineMode": "disabled",
    "monthlyFormulas": null
  }'::jsonb,

  -- Pricing
  monthly_price DECIMAL(10,2),
  yearly_price DECIMAL(10,2),

  -- Display
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plans_plan_type ON plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_display_order ON plans(display_order);

-- ====================================================================
-- 2. INSERT DEFAULT PLANS
-- ====================================================================

INSERT INTO plans (plan_type, name, description, features, monthly_price, yearly_price, display_order)
VALUES
  -- FREE PLAN
  (
    'free',
    'Free',
    'Basic access to explore TCM resources',
    '{
      "herbLibraryAccess": "sample",
      "formulaLibraryAccess": "sample",
      "builder": false,
      "prescriptionLibrary": false,
      "statistics": false,
      "herbPropertyFilters": false,
      "formulaPropertyFilters": false,
      "clinicalUseFilters": false,
      "generalConditions": false,
      "medications": false,
      "allergies": false,
      "tcmRiskPatterns": false,
      "pharmacologicalEffectsFilter": false,
      "biologicalMechanismsFilter": false,
      "bioactiveCompoundsFilter": false,
      "customContent": false,
      "safetyEngineMode": "disabled",
      "monthlyFormulas": null
    }'::jsonb,
    0.00,
    0.00,
    1
  ),

  -- PRACTITIONER PLAN
  (
    'practitioner',
    'Practitioner',
    'Professional tools for TCM practitioners',
    '{
      "herbLibraryAccess": "full",
      "formulaLibraryAccess": "full",
      "builder": true,
      "prescriptionLibrary": true,
      "statistics": true,
      "herbPropertyFilters": true,
      "formulaPropertyFilters": true,
      "clinicalUseFilters": true,
      "generalConditions": true,
      "medications": true,
      "allergies": true,
      "tcmRiskPatterns": true,
      "pharmacologicalEffectsFilter": true,
      "biologicalMechanismsFilter": true,
      "bioactiveCompoundsFilter": false,
      "customContent": false,
      "safetyEngineMode": "basic",
      "monthlyFormulas": 100
    }'::jsonb,
    29.99,
    299.99,
    2
  ),

  -- ADVANCED PLAN
  (
    'advanced',
    'Advanced',
    'Complete platform access with advanced features',
    '{
      "herbLibraryAccess": "full",
      "formulaLibraryAccess": "full",
      "builder": true,
      "prescriptionLibrary": true,
      "statistics": true,
      "herbPropertyFilters": true,
      "formulaPropertyFilters": true,
      "clinicalUseFilters": true,
      "generalConditions": true,
      "medications": true,
      "allergies": true,
      "tcmRiskPatterns": true,
      "pharmacologicalEffectsFilter": true,
      "biologicalMechanismsFilter": true,
      "bioactiveCompoundsFilter": true,
      "customContent": true,
      "safetyEngineMode": "advanced",
      "monthlyFormulas": null
    }'::jsonb,
    99.99,
    999.99,
    3
  )
ON CONFLICT (plan_type) DO NOTHING;

-- ====================================================================
-- 3. RLS POLICIES
-- ====================================================================

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Anyone can read active plans
DROP POLICY IF EXISTS "Anyone can read active plans" ON plans;
CREATE POLICY "Anyone can read active plans" ON plans
  FOR SELECT USING (is_active = true);

-- Admins can manage all plans
DROP POLICY IF EXISTS "Admins can manage all plans" ON plans;
CREATE POLICY "Admins can manage all plans" ON plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ====================================================================
-- 4. AUTO-UPDATE TIMESTAMP TRIGGER
-- ====================================================================

DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 5. HELPER FUNCTION - Get features for a plan type
-- ====================================================================

CREATE OR REPLACE FUNCTION get_plan_features(p_plan_type TEXT)
RETURNS JSONB AS $$
DECLARE
  plan_features JSONB;
BEGIN
  SELECT features INTO plan_features
  FROM plans
  WHERE plan_type = p_plan_type
  AND is_active = true;

  RETURN COALESCE(plan_features, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- DONE! ✅
-- ====================================================================
-- Now you can:
-- 1. Modify plan features in Admin Panel
-- 2. Changes are stored in Supabase (plans table)
-- 3. ALL users with that plan see changes immediately
-- ====================================================================
