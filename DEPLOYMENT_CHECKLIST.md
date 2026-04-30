# Checklist de Deployment (GitHub + Vercel + Stripe + Supabase)

## 📋 Resumen
Esta aplicación actualmente es **100% frontend** con datos mock. Para producción necesitas:
1. **Backend API** (Node.js/Express recomendado)
2. **Base de datos** (Supabase)
3. **Integración Stripe** (para pagos)
4. **Autenticación real** (Supabase Auth o Clerk)

---

## 1️⃣ ARCHIVOS A CREAR

### `.gitignore`
```
# Dependencies
node_modules/
.pnpm-store/

# Environment variables
.env
.env.local
.env.production.local
.env.development.local

# Build output
dist/
build/
.vite/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
.cache/
```

### `.env.example`
```env
# Stripe Keys (obtener de https://dashboard.stripe.com/apikeys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (obtener de https://supabase.com/dashboard/project/_/settings/api)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API URL
VITE_API_URL=http://localhost:3001
# En producción: VITE_API_URL=https://your-api.vercel.app

# App URLs (para Stripe redirects)
VITE_APP_URL=http://localhost:5173
# En producción: VITE_APP_URL=https://your-app.vercel.app
```

### `vercel.json` (para el frontend)
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### `README.md` actualizado
```markdown
# TCM Platform

## Setup Local

1. Clonar el repositorio:
\`\`\`bash
git clone https://github.com/tu-usuario/tcm-platform.git
cd tcm-platform
\`\`\`

2. Instalar dependencias:
\`\`\`bash
pnpm install
\`\`\`

3. Copiar variables de entorno:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Completar las variables en `.env` con tus claves

5. Correr el proyecto:
\`\`\`bash
pnpm dev
\`\`\`

## Deployment

Ver `DEPLOYMENT_CHECKLIST.md` para deployment completo.
```

---

## 2️⃣ BACKEND API (Necesario Crear)

### Estructura Recomendada
```
/api
  /routes
    auth.js          # Login, register, forgot password
    plans.js         # Get plans, update plan
    stripe.js        # Checkout, verify, webhooks
    invoices.js      # Get user invoices
    users.js         # User management
  /middleware
    auth.js          # JWT verification
  server.js          # Express app
  package.json
```

### Endpoints Críticos Necesarios

#### Autenticación
- `POST /api/auth/register` - Crear cuenta
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `GET /api/auth/me` - Obtener usuario actual

#### Stripe
- `POST /api/stripe/create-checkout-session` - Crear sesión de pago
- `POST /api/stripe/verify-session` - Verificar pago completado
- `POST /api/stripe/webhook` - Recibir eventos de Stripe
- `POST /api/stripe/create-portal-session` - Portal de gestión de Stripe
- `POST /api/stripe/update-subscription` - Cambiar plan (upgrade/downgrade)

#### Invoices
- `GET /api/invoices` - Obtener facturas del usuario

#### Plans
- `GET /api/plans` - Obtener planes disponibles (público)

---

## 3️⃣ BASE DE DATOS (Supabase)

### Tablas Necesarias

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  country TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'clinic')),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `subscriptions`
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan_type TEXT CHECK (plan_type IN ('free', 'pro', 'clinic')),
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `invoices` (opcional, Stripe ya guarda esto)
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  amount_paid INTEGER, -- en centavos
  currency TEXT DEFAULT 'usd',
  status TEXT,
  invoice_pdf TEXT, -- URL del PDF
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4️⃣ CONFIGURACIÓN STRIPE

### Dashboard Settings
1. **Ir a:** https://dashboard.stripe.com/

2. **Crear Productos y Precios:**
   - Product: "Practitioner Plan"
     - Monthly Price: $9/mo → Copiar Price ID
     - Yearly Price: $90/yr → Copiar Price ID
   - Product: "Clinical Plan"
     - Monthly Price: $19/mo → Copiar Price ID
     - Yearly Price: $190/yr → Copiar Price ID

3. **Configurar Webhooks:**
   - URL: `https://your-api.vercel.app/api/stripe/webhook`
   - Eventos a escuchar:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. **Actualizar Price IDs en el código:**
   - Ir a Admin Panel → Plan Management
   - Editar cada plan y pegar los Price IDs de Stripe

---

## 5️⃣ CÓDIGO A CAMBIAR

### Archivos que usan datos MOCK (necesitan conectar con backend):

#### `/src/app/pages/Login.tsx`
```typescript
// ANTES (mock):
const user = getUserByEmail(email);
if (user && user.password === password) { ... }

// DESPUÉS (real):
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { user, token } = await response.json();
localStorage.setItem('authToken', token);
```

#### `/src/app/pages/SelectMembership.tsx`
```typescript
// Ya está preparado, solo cambiar:
const API_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`;
```

#### `/src/app/pages/PaymentSuccess.tsx`
```typescript
// Ya está preparado, solo cambiar:
const API_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/stripe/verify-session`;
```

#### `/src/app/pages/MembershipPage.tsx`
```typescript
// Cambiar getInvoices() mock por llamada real:
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});
const invoices = await response.json();
```

#### `/src/app/services/planService.ts`
```typescript
// Opción: Cargar planes desde backend en lugar de localStorage
// O mantener localStorage pero sincronizar con backend
```

---

## 6️⃣ DEPLOYMENT STEPS

### A. Preparar Repositorio GitHub

1. **Crear repositorio en GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tcm-platform.git
git push -u origin main
```

2. **Archivos importantes a incluir:**
   - ✅ `.gitignore`
   - ✅ `.env.example` (sin claves reales)
   - ✅ `README.md`
   - ✅ `DEPLOYMENT_CHECKLIST.md` (este archivo)
   - ✅ `STRIPE_INTEGRATION.md` (ya existe)

### B. Deploy Frontend a Vercel

1. **Ir a:** https://vercel.com/new

2. **Importar repositorio de GitHub**

3. **Configurar:**
   - Framework Preset: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`

4. **Agregar Environment Variables:**
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   VITE_SUPABASE_URL=https://...
   VITE_SUPABASE_ANON_KEY=eyJh...
   VITE_API_URL=https://your-api.vercel.app
   VITE_APP_URL=https://your-app.vercel.app
   ```

5. **Deploy** 🚀

### C. Deploy Backend API (separado)

**Opción 1: Vercel Serverless Functions**
- Crear carpeta `/api` en el repo
- Cada archivo es un endpoint serverless
- Vercel detecta automáticamente

**Opción 2: Deploy separado (Railway, Render, Fly.io)**
- Crear repo separado para backend
- Deploy con Railway/Render
- Actualizar VITE_API_URL con la URL del backend

### D. Configurar Supabase

1. **Crear proyecto:** https://supabase.com/dashboard

2. **Ejecutar SQL para crear tablas** (ver sección 3)

3. **Copiar credenciales:**
   - Project URL
   - Anon key
   - Service role key

4. **Configurar Authentication:**
   - Enable Email/Password
   - Configure redirect URLs:
     - `http://localhost:5173/auth/callback`
     - `https://your-app.vercel.app/auth/callback`

### E. Configurar Stripe (Producción)

1. **Cambiar a Live Mode** en Stripe Dashboard

2. **Actualizar claves** en Vercel:
   - `VITE_STRIPE_PUBLISHABLE_KEY` → pk_live_...
   - `STRIPE_SECRET_KEY` (backend) → sk_live_...

3. **Crear productos y precios en LIVE mode**

4. **Configurar webhook** apuntando a producción

---

## 7️⃣ TESTING PRE-PRODUCCIÓN

### Checklist Final

- [ ] **Autenticación funciona**
  - [ ] Registro de usuario
  - [ ] Login
  - [ ] Logout
  - [ ] Forgot password

- [ ] **Stripe funciona**
  - [ ] Crear checkout session (monthly)
  - [ ] Crear checkout session (yearly)
  - [ ] Pago completa correctamente
  - [ ] Redirect a /payment-success funciona
  - [ ] Plan se guarda en BD
  - [ ] Upgrade de plan funciona
  - [ ] Downgrade de plan funciona
  - [ ] Invoices se muestran correctamente

- [ ] **Permisos funcionan**
  - [ ] Free plan: acceso limitado
  - [ ] Pro plan: acceso completo
  - [ ] Clinic plan: acceso completo + ilimitado

- [ ] **Admin Panel funciona**
  - [ ] Solo accesible por admins
  - [ ] Editar planes se refleja en frontend

---

## 8️⃣ MONITOREO POST-DEPLOYMENT

### Herramientas Recomendadas

1. **Vercel Analytics** (incluido gratis)
   - Performance monitoring
   - Error tracking

2. **Stripe Dashboard**
   - Ver pagos
   - Ver subscripciones
   - Ver webhooks (logs)

3. **Supabase Dashboard**
   - Ver logs de queries
   - Monitorear uso de BD

4. **Sentry** (opcional)
   - Error tracking avanzado
   - Performance monitoring

---

## 9️⃣ COSTOS ESTIMADOS

### Servicios

- **Vercel:** Free (hasta 100GB bandwidth)
- **Supabase:** Free (hasta 500MB BD, 2GB storage)
- **Stripe:** 2.9% + $0.30 por transacción
- **Backend (Railway/Render):** ~$5-20/mes

### Cuando crecer

- Vercel Pro: $20/mes (más bandwidth)
- Supabase Pro: $25/mes (más BD, más storage)
- Backend escalado: según uso

---

## 🆘 PROBLEMAS COMUNES

### CORS Errors
**Problema:** Frontend no puede llamar al backend
**Solución:** Configurar CORS en backend:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Stripe Webhook no funciona
**Problema:** Eventos no llegan
**Solución:**
1. Verificar URL correcta en Stripe Dashboard
2. Verificar firma del webhook
3. Ver logs en Stripe Dashboard → Webhooks

### Variables de entorno no funcionan
**Problema:** `import.meta.env.VITE_...` es undefined
**Solución:**
1. Reiniciar dev server
2. Verificar que empiezan con `VITE_`
3. En Vercel, redeploy después de agregar variables

---

## 📞 PRÓXIMOS PASOS

1. **Crear backend API** (más urgente)
2. **Conectar Supabase** (base de datos)
3. **Integrar Stripe en backend** (pagos)
4. **Cambiar login/register** a real
5. **Testing completo**
6. **Deploy a producción**

¿Necesitas ayuda con algún paso específico? 🚀
