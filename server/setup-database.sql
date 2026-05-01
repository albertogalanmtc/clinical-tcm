-- Script SQL para agregar columnas de Stripe a la tabla users
-- Ejecutar este script en tu proyecto de Supabase

-- Agregar columnas si no existen
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_plan_type ON users(plan_type);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN users.plan_type IS 'Plan del usuario: free, pro, clinic';
COMMENT ON COLUMN users.stripe_customer_id IS 'ID del cliente en Stripe (cus_xxx)';
COMMENT ON COLUMN users.stripe_subscription_id IS 'ID de la suscripción en Stripe (sub_xxx)';
COMMENT ON COLUMN users.subscription_status IS 'Estado de la suscripción: inactive, active, past_due, cancelled';
COMMENT ON COLUMN users.onboarding_completed IS 'Marks whether the user has finished the onboarding flow';

-- Verificar que las columnas se crearon correctamente
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('plan_type', 'stripe_customer_id', 'stripe_subscription_id', 'subscription_status', 'onboarding_completed')
ORDER BY column_name;
