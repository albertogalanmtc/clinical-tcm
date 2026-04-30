# Guía de Migración a Supabase

Esta guía te explica cómo migrar tu aplicación de TCM de localStorage a Supabase cuando estés listo.

## 📋 Preparación Completada ✅

Tu aplicación ya está preparada para Supabase con:

1. ✅ **Tipos centralizados** en `/src/types/index.ts`
2. ✅ **Servicios abstractos** en `/src/services/api/`
3. ✅ **Hook useAsync** para manejo de estados de loading/error
4. ✅ **Variables de entorno** en `.env.example`
5. ✅ **Context de autenticación** en `/src/app/contexts/UserContext.tsx`

## 🚀 Pasos para Migrar a Supabase

### 1. Instalar Dependencias de Supabase

```bash
pnpm add @supabase/supabase-js
```

### 2. Configurar Variables de Entorno

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
3. Navega a: Settings → API
4. Copia tus credenciales a `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 3. Crear Cliente de Supabase

Crea el archivo `/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4. Crear Schema de Base de Datos

Ejecuta este SQL en Supabase Dashboard → SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  country TEXT,
  avatar_color TEXT,
  avatar_image TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'clinic')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Herbs table
CREATE TABLE public.herbs (
  herb_id TEXT PRIMARY KEY,
  pinyin_name TEXT NOT NULL,
  hanzi_name TEXT,
  pharmaceutical_name TEXT,
  english_name TEXT,
  category TEXT,
  subcategory TEXT,
  nature TEXT,
  flavor TEXT[],
  channels TEXT[],
  banned_countries TEXT[],
  actions JSONB,
  indications TEXT[],
  dui_yao JSONB,
  clinical_applications JSONB,
  cautions TEXT[],
  contraindications TEXT[],
  dose TEXT,
  toxicology TEXT[],
  pregnancy_warning JSONB,
  antagonisms TEXT[],
  incompatibilities TEXT[],
  pharmacological_effects TEXT[],
  biological_mechanisms JSONB,
  bioactive_compounds JSONB,
  detoxification JSONB,
  clinical_studies_and_research TEXT[],
  herb_drug_interactions TEXT[],
  herb_herb_interactions TEXT[],
  allergens TEXT[],
  notes TEXT[],
  references TEXT[],
  is_system_item BOOLEAN DEFAULT true,
  created_by_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formulas table
CREATE TABLE public.formulas (
  formula_id TEXT PRIMARY KEY,
  pinyin_name TEXT NOT NULL,
  hanzi_name TEXT,
  translated_name TEXT,
  alternative_names TEXT[],
  category TEXT,
  subcategory TEXT,
  source TEXT,
  thermal_action TEXT,
  composition JSONB,
  dosage TEXT[],
  preparation TEXT[],
  administration TEXT[],
  tcm_actions TEXT[],
  clinical_manifestations TEXT[],
  clinical_applications JSONB,
  modifications JSONB,
  pharmacological_effects TEXT[],
  biological_mechanisms JSONB,
  clinical_studies_and_research TEXT[],
  drug_interactions TEXT[],
  herb_interactions TEXT[],
  allergens TEXT[],
  cautions TEXT[],
  contraindications TEXT[],
  toxicology TEXT[],
  notes TEXT[],
  reference TEXT[],
  is_system_item BOOLEAN DEFAULT true,
  created_by_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE public.prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  components JSONB NOT NULL,
  comments TEXT,
  alert_mode TEXT CHECK (alert_mode IN ('all', 'filtered')),
  patient_safety_profile JSONB,
  safety_filters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('herb', 'formula')),
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Indexes for performance
CREATE INDEX herbs_category_idx ON public.herbs(category);
CREATE INDEX herbs_created_by_idx ON public.herbs(created_by_id);
CREATE INDEX formulas_category_idx ON public.formulas(category);
CREATE INDEX formulas_created_by_idx ON public.formulas(created_by_id);
CREATE INDEX prescriptions_user_id_idx ON public.prescriptions(user_id);
CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Admin policies (admins can view and update all profiles)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for herbs (public read, authenticated create/update own)
CREATE POLICY "Anyone can view herbs" 
  ON public.herbs FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create herbs" 
  ON public.herbs FOR INSERT 
  WITH CHECK (auth.uid() = created_by_id);

CREATE POLICY "Users can update their own herbs" 
  ON public.herbs FOR UPDATE 
  USING (auth.uid() = created_by_id OR is_system_item = false);

CREATE POLICY "Users can delete their own herbs" 
  ON public.herbs FOR DELETE 
  USING (auth.uid() = created_by_id);

-- RLS Policies for formulas (same as herbs)
CREATE POLICY "Anyone can view formulas" 
  ON public.formulas FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create formulas" 
  ON public.formulas FOR INSERT 
  WITH CHECK (auth.uid() = created_by_id);

CREATE POLICY "Users can update their own formulas" 
  ON public.formulas FOR UPDATE 
  USING (auth.uid() = created_by_id OR is_system_item = false);

CREATE POLICY "Users can delete their own formulas" 
  ON public.formulas FOR DELETE 
  USING (auth.uid() = created_by_id);

-- RLS Policies for prescriptions (users can only access their own)
CREATE POLICY "Users can view their own prescriptions" 
  ON public.prescriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prescriptions" 
  ON public.prescriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions" 
  ON public.prescriptions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions" 
  ON public.prescriptions FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view their own favorites" 
  ON public.favorites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
  ON public.favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON public.favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_herbs_updated_at BEFORE UPDATE ON public.herbs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_formulas_updated_at BEFORE UPDATE ON public.formulas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### 5. Crear Primera Cuenta de Administrador

**IMPORTANTE:** Después de ejecutar el schema, necesitas crear tu primera cuenta de administrador.

#### Opción A: Crear Admin Manualmente en Supabase (RECOMENDADO)

1. **Regístrate normalmente** en tu aplicación con tu email de admin:
   - Ve a la página de registro de tu app
   - Completa el formulario con tu email (ej: `alberto.galan@tudominio.com`)
   - Esto creará un usuario normal en la tabla `profiles` con `role = 'user'`

2. **Promover a Admin en Supabase Dashboard**:
   - Ve a Supabase Dashboard → Table Editor → `profiles`
   - Encuentra tu usuario por email
   - Edita el campo `role` de `'user'` a `'admin'`
   - Guarda los cambios

3. **Cierra sesión y vuelve a iniciar sesión** en tu app para que los cambios surtan efecto

#### Opción B: Crear Admin con SQL

Ejecuta este SQL en Supabase Dashboard → SQL Editor (reemplaza con tus datos):

```sql
-- IMPORTANTE: Primero regístrate en la app para crear el usuario en auth.users
-- Luego ejecuta este SQL reemplazando el email con el tuyo

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tu-email-de-admin@tudominio.com';
```

#### Gestión de Roles desde Admin Panel (Futuro)

En una futura versión, podrás gestionar roles de usuario directamente desde el Admin Panel. Incluirá:
- Ver todos los usuarios registrados
- Cambiar role de `user` a `admin` y viceversa
- Ver estadísticas de administradores

### 6. Actualizar Servicios

Ahora actualiza cada servicio en `/src/services/api/` para usar Supabase en lugar de localStorage.

#### 6.1 Actualizar `authService.ts`

En `/src/services/api/authService.ts`, descomenta el código de Supabase y comenta el código mock:

```typescript
import { supabase } from '@/lib/supabase';

export async function signUp(email: string, password: string, profile: Partial<UserProfile>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        country: profile.country,
      }
    }
  });

  if (error) {
    return {
      success: false,
      error: { message: error.message, code: error.code || 'SIGNUP_ERROR' }
    };
  }

  return { success: true, data: data.user as any };
}

// ... y así para todas las funciones
```

#### 6.2 Actualizar `herbsService.ts`

```typescript
import { supabase } from '@/lib/supabase';

export async function getAllHerbs(filters?: FilterParams, pagination?: PaginationParams) {
  let query = supabase
    .from('herbs')
    .select('*', { count: 'exact' });

  if (filters?.category && filters.category.length > 0) {
    query = query.in('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(`pinyin_name.ilike.%${filters.search}%,pharmaceutical_name.ilike.%${filters.search}%`);
  }

  if (pagination?.limit) {
    const from = ((pagination.page || 1) - 1) * pagination.limit;
    query = query.range(from, from + pagination.limit - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    return {
      success: false,
      error: { message: error.message, code: 'FETCH_HERBS_ERROR' }
    };
  }

  return {
    success: true,
    data: data || [],
    meta: { total: count || 0, page: pagination?.page || 1, limit: pagination?.limit || count || 0 }
  };
}

// ... y así para todas las funciones
```

### 7. Migrar Datos Existentes

Para migrar los datos de localStorage a Supabase:

```typescript
// Script de migración (ejecutar una sola vez)
import { supabase } from '@/lib/supabase';
import { herbsData } from '@/app/data/herbs';
import { formulasData } from '@/app/data/formulas';

async function migrateData() {
  // Migrar hierbas
  const { error: herbsError } = await supabase
    .from('herbs')
    .insert(herbsData);

  if (herbsError) console.error('Error migrating herbs:', herbsError);

  // Migrar fórmulas
  const { error: formulasError } = await supabase
    .from('formulas')
    .insert(formulasData);

  if (formulasError) console.error('Error migrating formulas:', formulasError);

  console.log('Migration complete!');
}
```

### 8. Actualizar UserContext

Actualiza `/src/app/contexts/UserContext.tsx` para usar el servicio de autenticación:

```typescript
import { getCurrentUser, onAuthStateChange } from '@/services/api';

export function UserProvider({ children }: { children: ReactNode }) {
  // ... state declarations ...

  useEffect(() => {
    // Load current user on mount
    getCurrentUser().then(result => {
      if (result.success && result.data) {
        const user = result.data;
        setEmail(user.email);
        setFirstName(user.profile.firstName);
        setLastName(user.profile.lastName);
        // ... etc
      }
    });

    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange(session => {
      if (session?.user) {
        // Update state with new user data
      } else {
        // Clear state on logout
      }
    });

    return unsubscribe;
  }, []);

  // ... rest of component
}
```

## 🔒 Configurar Stripe Webhooks

Para la integración con Stripe (suscripciones):

1. **Instalar Stripe CLI**: https://stripe.com/docs/stripe-cli
2. **Crear Webhook Endpoint** en Supabase Edge Functions
3. **Configurar eventos**: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

## 🚢 Desplegar en Vercel

1. **Push a GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/tcm-platform.git
git push -u origin main
```

2. **Importar en Vercel**:
   - Ve a https://vercel.com/new
   - Importa tu repositorio de GitHub
   - Agrega las variables de entorno de `.env`
   - Deploy!

## ✅ Checklist de Migración

- [ ] Supabase proyecto creado
- [ ] Variables de entorno configuradas
- [ ] Cliente de Supabase creado (`/src/lib/supabase.ts`)
- [ ] Schema de base de datos ejecutado
- [ ] **Primera cuenta de administrador creada y promovida a role='admin'**
- [ ] `authService.ts` actualizado
- [ ] `herbsService.ts` actualizado
- [ ] `formulasService.ts` actualizado
- [ ] `prescriptionsService.ts` actualizado
- [ ] `UserContext.tsx` actualizado
- [ ] Datos migrados a Supabase
- [ ] Stripe webhooks configurados
- [ ] Aplicación desplegada en Vercel
- [ ] DNS configurado (si aplica)

## 🆘 Troubleshooting

**Error: "Missing environment variables"**
- Verifica que `.env` existe y tiene las variables correctas
- En Vercel, verifica que agregaste todas las variables con prefijo `VITE_`

**Error: "RLS policy violation"**
- Verifica que las políticas RLS están creadas correctamente
- Verifica que el usuario está autenticado antes de hacer queries

**Error: "Invalid JWT"**
- Verifica que estás usando las keys correctas (URL y anon key)
- Verifica que el token no ha expirado

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Integration](https://stripe.com/docs/billing/subscriptions/overview)
