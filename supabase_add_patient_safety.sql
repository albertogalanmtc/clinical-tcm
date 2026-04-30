-- Add patient_safety_profile column to prescriptions table
-- Run this in Supabase SQL Editor

-- Add the column (JSONB for flexible JSON storage)
ALTER TABLE prescriptions
ADD COLUMN IF NOT EXISTS patient_safety_profile JSONB DEFAULT '{}'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_safety
ON prescriptions USING gin(patient_safety_profile);

-- Example of what will be stored:
-- {
--   "pregnancy": true,
--   "breastfeeding": false,
--   "anticoagulants": true,
--   "shellfish": true,
--   "qi_deficiency": true,
--   ...
-- }
