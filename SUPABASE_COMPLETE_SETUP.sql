-- ====================================================================
-- SUPABASE COMPLETE SETUP - Make App Fully Functional
-- ====================================================================
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- This script is IDEMPOTENT - safe to run multiple times
-- ====================================================================

-- ====================================================================
-- 1. ENHANCE USERS TABLE
-- ====================================================================

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_subscription_renewal BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_latest_updates BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_community_replies BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_community_new_posts BOOLEAN NOT NULL DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_plan_type ON users(plan_type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update plan_type constraint to include 'practitioner' and 'advanced'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_type_check;
ALTER TABLE users ADD CONSTRAINT users_plan_type_check
  CHECK (plan_type IN ('free', 'pro', 'clinic', 'practitioner', 'advanced', 'admin'));

-- ====================================================================
-- 2. USER DISMISSED ITEMS (Messages, Banners, Surveys)
-- ====================================================================

CREATE TABLE IF NOT EXISTS user_dismissed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('message', 'banner', 'survey')),
  item_id TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_dismissed_items_user ON user_dismissed_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dismissed_items_type ON user_dismissed_items(item_type);

-- RLS Policies
ALTER TABLE user_dismissed_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own dismissed items" ON user_dismissed_items;
CREATE POLICY "Users can view own dismissed items" ON user_dismissed_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own dismissed items" ON user_dismissed_items;
CREATE POLICY "Users can create own dismissed items" ON user_dismissed_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own dismissed items" ON user_dismissed_items;
CREATE POLICY "Users can delete own dismissed items" ON user_dismissed_items
  FOR DELETE USING (auth.uid() = user_id);

-- ====================================================================
-- 3. UPDATE DASHBOARD_MESSAGES TABLE
-- ====================================================================

-- Remove old type/priority columns and add new highlighted/closeable
ALTER TABLE dashboard_messages DROP COLUMN IF EXISTS type;
ALTER TABLE dashboard_messages DROP COLUMN IF EXISTS priority;
ALTER TABLE dashboard_messages ADD COLUMN IF NOT EXISTS highlighted BOOLEAN DEFAULT FALSE;
ALTER TABLE dashboard_messages ADD COLUMN IF NOT EXISTS closeable BOOLEAN DEFAULT TRUE;
ALTER TABLE dashboard_messages ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Enable RLS for dashboard_messages
ALTER TABLE dashboard_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read active messages
DROP POLICY IF EXISTS "Anyone can read active messages" ON dashboard_messages;
CREATE POLICY "Anyone can read active messages" ON dashboard_messages
  FOR SELECT USING (status = 'active');

-- Only admins can manage messages
DROP POLICY IF EXISTS "Admins can manage messages" ON dashboard_messages;
CREATE POLICY "Admins can manage messages" ON dashboard_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ====================================================================
-- 4. UPDATE SURVEYS TABLE
-- ====================================================================

-- Add missing columns
ALTER TABLE surveys DROP COLUMN IF EXISTS display_mode;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS thank_you_emoji TEXT DEFAULT '🎉';
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS show_thank_you_emoji BOOLEAN DEFAULT TRUE;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- Anyone can read active surveys
DROP POLICY IF EXISTS "Anyone can read active surveys" ON surveys;
CREATE POLICY "Anyone can read active surveys" ON surveys
  FOR SELECT USING (status = 'active');

-- Admins can manage
DROP POLICY IF EXISTS "Admins can manage surveys" ON surveys;
CREATE POLICY "Admins can manage surveys" ON surveys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Survey responses RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own responses" ON survey_responses;
CREATE POLICY "Users can view own responses" ON survey_responses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create responses" ON survey_responses;
CREATE POLICY "Users can create responses" ON survey_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all responses
DROP POLICY IF EXISTS "Admins can view all responses" ON survey_responses;
CREATE POLICY "Admins can view all responses" ON survey_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ====================================================================
-- 5. UPDATE BANNERS TABLE
-- ====================================================================

ALTER TABLE banners ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active banners" ON banners;
CREATE POLICY "Anyone can read active banners" ON banners
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage banners" ON banners;
CREATE POLICY "Admins can manage banners" ON banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ====================================================================
-- 6. ENABLE RLS ON ALL CONTENT TABLES (for admin access)
-- ====================================================================

-- Community Posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active posts" ON community_posts;
CREATE POLICY "Anyone can read active posts" ON community_posts
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
CREATE POLICY "Users can create posts" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
CREATE POLICY "Users can update own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can manage all posts" ON community_posts;
CREATE POLICY "Admins can manage all posts" ON community_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ====================================================================
-- 7. CREATE ADMIN HELPER FUNCTIONS
-- ====================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user's plan access
CREATE OR REPLACE FUNCTION has_plan_access(user_id UUID, required_plan TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  plan_hierarchy INTEGER;
  required_hierarchy INTEGER;
BEGIN
  -- Admin has access to everything
  IF is_admin(user_id) THEN
    RETURN TRUE;
  END IF;

  -- Get user's plan
  SELECT plan_type INTO user_plan
  FROM users
  WHERE id = user_id;

  -- Define plan hierarchy
  plan_hierarchy := CASE user_plan
    WHEN 'admin' THEN 999
    WHEN 'clinic' THEN 3
    WHEN 'advanced' THEN 3
    WHEN 'pro' THEN 2
    WHEN 'practitioner' THEN 2
    WHEN 'free' THEN 1
    ELSE 0
  END;

  required_hierarchy := CASE required_plan
    WHEN 'clinic' THEN 3
    WHEN 'advanced' THEN 3
    WHEN 'pro' THEN 2
    WHEN 'practitioner' THEN 2
    WHEN 'free' THEN 1
    ELSE 0
  END;

  RETURN plan_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 8. TRIGGER TO AUTO-CREATE USER PROFILE ON SIGNUP
-- ====================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, role, plan_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ====================================================================
-- ✅ VERIFICATION QUERIES
-- ====================================================================
-- Run these to verify setup:

-- Check if users table has all columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';

-- Check if policies are set
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('users', 'dashboard_messages', 'surveys', 'banners');

-- Test admin check
-- SELECT is_admin(auth.uid());

-- Test plan access
-- SELECT has_plan_access(auth.uid(), 'pro');

-- ====================================================================
-- 🎉 SETUP COMPLETE!
-- ====================================================================
