-- ====================================================================
-- SUPABASE MIGRATION SCRIPT
-- Compatible con la versión actual de la app
-- ====================================================================
-- Ejecuta esto en: Supabase Dashboard > SQL Editor > New Query
-- ====================================================================

-- 1. TABLA USERS
-- ====================================================================
-- Crea la tabla si no existe
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  country TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'clinic')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Añade columnas si no existen (seguro para tablas existentes)
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Añade restricciones si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_plan_type_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_plan_type_check CHECK (plan_type IN ('free', 'pro', 'clinic'));
  END IF;
END $$;

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo pueden ver su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Se puede insertar un perfil al registrarse
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. TABLA HERBS (hierbas personalizadas)
-- ====================================================================
CREATE TABLE IF NOT EXISTS herbs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pinyin TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE herbs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE herbs ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE herbs ADD COLUMN IF NOT EXISTS pinyin TEXT;
ALTER TABLE herbs ADD COLUMN IF NOT EXISTS data JSONB;
ALTER TABLE herbs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE herbs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Row Level Security
ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own herbs" ON herbs;
CREATE POLICY "Users can view own herbs" ON herbs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own herbs" ON herbs;
CREATE POLICY "Users can insert own herbs" ON herbs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own herbs" ON herbs;
CREATE POLICY "Users can update own herbs" ON herbs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own herbs" ON herbs;
CREATE POLICY "Users can delete own herbs" ON herbs
  FOR DELETE USING (auth.uid() = user_id);


-- 3. TABLA FORMULAS (fórmulas personalizadas)
-- ====================================================================
CREATE TABLE IF NOT EXISTS formulas (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pinyin TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE formulas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE formulas ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE formulas ADD COLUMN IF NOT EXISTS pinyin TEXT;
ALTER TABLE formulas ADD COLUMN IF NOT EXISTS data JSONB;
ALTER TABLE formulas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE formulas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Row Level Security
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own formulas" ON formulas;
CREATE POLICY "Users can view own formulas" ON formulas
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own formulas" ON formulas;
CREATE POLICY "Users can insert own formulas" ON formulas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own formulas" ON formulas;
CREATE POLICY "Users can update own formulas" ON formulas
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own formulas" ON formulas;
CREATE POLICY "Users can delete own formulas" ON formulas
  FOR DELETE USING (auth.uid() = user_id);


-- 4. TABLA PRESCRIPTIONS (prescripciones guardadas)
-- ====================================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS data JSONB;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Row Level Security
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own prescriptions" ON prescriptions;
CREATE POLICY "Users can view own prescriptions" ON prescriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own prescriptions" ON prescriptions;
CREATE POLICY "Users can insert own prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own prescriptions" ON prescriptions;
CREATE POLICY "Users can update own prescriptions" ON prescriptions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own prescriptions" ON prescriptions;
CREATE POLICY "Users can delete own prescriptions" ON prescriptions
  FOR DELETE USING (auth.uid() = user_id);


-- 5. FUNCIÓN PARA AUTO-ACTUALIZAR updated_at
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_herbs_updated_at ON herbs;
CREATE TRIGGER update_herbs_updated_at
  BEFORE UPDATE ON herbs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_formulas_updated_at ON formulas;
CREATE TRIGGER update_formulas_updated_at
  BEFORE UPDATE ON formulas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ====================================================================
-- ✅ LISTO!
-- ====================================================================
-- Este script es IDEMPOTENTE: puedes ejecutarlo varias veces sin problemas.
-- Solo añade columnas/políticas que no existen, no borra datos.
-- ====================================================================
