# 🚀 Guía de Configuración de Stripe

Esta guía te llevará paso a paso para activar los pagos con Stripe en tu aplicación.

## 📋 Requisitos Previos

- [ ] Cuenta de Stripe (https://dashboard.stripe.com/register)
- [ ] Proyecto Supabase configurado
- [ ] Node.js 18+ instalado
- [ ] pnpm o npm instalado

## 🔧 Paso 1: Configurar Stripe

### 1.1 Crear Productos y Precios en Stripe

1. Ve a https://dashboard.stripe.com/test/products
2. Crea dos productos:

**Producto 1: Practitioner**
- Name: Practitioner Plan
- Description: Professional TCM practice tools
- Clic en "Add pricing"
  - Precio Mensual: $29 (guarda el Price ID)
  - Precio Anual: $290 (guarda el Price ID)

**Producto 2: Advanced**  
- Name: Advanced Plan
- Description: Advanced features for clinics
- Clic en "Add pricing"
  - Precio Mensual: $49 (guarda el Price ID)
  - Precio Anual: $490 (guarda el Price ID)

**📝 Guarda estos Price IDs**, los necesitarás en el paso 3.

Ejemplo de Price ID: `price_1234567890abcdef`

### 1.2 Obtener las API Keys

1. Ve a https://dashboard.stripe.com/test/apikeys
2. Copia:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...) ⚠️ Mantenla secreta

## 🗄️ Paso 2: Configurar Base de Datos

### 2.1 Agregar Columnas a Supabase

1. Ve a tu proyecto Supabase
2. Abre el **SQL Editor**
3. Ejecuta el script `server/setup-database.sql`:

```sql
-- Copia y pega el contenido de server/setup-database.sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
```

4. Verifica que se crearon las columnas correctamente

## 🎯 Paso 3: Actualizar Price IDs en el Código

Abre `src/app/services/planService.ts` y actualiza los Price IDs:

```typescript
{
  id: '2',
  code: 'pro',
  name: 'Practitioner',
  stripePriceIdMonthly: 'price_TU_PRICE_ID_MENSUAL_AQUI', // ← Actualiza
  stripePriceIdYearly: 'price_TU_PRICE_ID_ANUAL_AQUI',    // ← Actualiza
  // ...
},
{
  id: '3',
  code: 'clinic',
  name: 'Advanced',
  stripePriceIdMonthly: 'price_TU_PRICE_ID_MENSUAL_AQUI', // ← Actualiza
  stripePriceIdYearly: 'price_TU_PRICE_ID_ANUAL_AQUI',    // ← Actualiza
  // ...
}
```

## 🖥️ Paso 4: Configurar el Backend

### 4.1 Instalar Dependencias

```bash
cd server
npm install
```

### 4.2 Configurar Variables de Entorno

```bash
cd server
cp .env.example .env
```

Edita `server/.env` y agrega tus credenciales:

```bash
# Stripe Keys (desde Step 1.2)
STRIPE_SECRET_KEY=sk_test_TU_SECRET_KEY_AQUI
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Lo obtendrás en el paso 5

# Supabase (desde tu proyecto Supabase > Settings > API)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key_aqui  # ⚠️ NO uses la anon key

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 4.3 Iniciar el Servidor

```bash
npm run dev
```

Deberías ver:
```
🚀 Server running on http://localhost:3001
🔑 Stripe: ✅ Configured
🗄️  Supabase: ✅ Configured
```

## 🪝 Paso 5: Configurar Webhooks de Stripe

### 5.1 Instalar Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
# Ver: https://stripe.com/docs/stripe-cli#install
```

### 5.2 Login y Forward Webhooks

```bash
# Login con tu cuenta de Stripe
stripe login

# Forward webhooks a tu servidor local
stripe listen --forward-to http://localhost:3001/api/stripe-webhook
```

**📝 IMPORTANTE:** Copia el webhook signing secret que aparece:
```
> Ready! Your webhook signing secret is whsec_xxx...
```

Agrégalo a `server/.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Deja esta terminal abierta** mientras desarrolles.

## 🎨 Paso 6: Configurar el Frontend

### 6.1 Variables de Entorno

En la raíz del proyecto:

```bash
cp .env.example .env
```

Edita `.env`:
```bash
VITE_API_URL=http://localhost:3001
```

### 6.2 Iniciar el Frontend

```bash
# En la raíz del proyecto (no en /server)
npm run dev
```

## ✅ Paso 7: Probar el Flujo Completo

### 7.1 Verificar que Todo Esté Corriendo

Deberías tener **3 terminales abiertas**:

1. **Frontend**: `npm run dev` (puerto 5173)
2. **Backend**: `cd server && npm run dev` (puerto 3001)
3. **Stripe CLI**: `stripe listen --forward-to http://localhost:3001/api/stripe-webhook`

### 7.2 Flujo de Prueba

1. **Abre la app**: http://localhost:5173
2. **Regístrate** con un usuario nuevo
3. **Selecciona un plan de pago** (Practitioner o Advanced)
4. Deberías ser **redirigido a Stripe Checkout**
5. **Usa una tarjeta de prueba**:
   - Número: `4242 4242 4242 4242`
   - CVV: Cualquier 3 dígitos
   - Fecha: Cualquier fecha futura
6. **Completa el pago**
7. Serás **redirigido a /payment-success**
8. Verifica en la **terminal de Stripe CLI** que se recibió el webhook:
   ```
   ✅ Webhook received: checkout.session.completed
   💳 Checkout session completed: cs_test_...
   ✅ User plan updated to: pro
   ```
9. Deberías **entrar a la app** con el plan actualizado

### 7.3 Verificar en Supabase

1. Ve a tu proyecto Supabase
2. Abre la tabla `users`
3. Busca tu usuario
4. Verifica que tenga:
   - `plan_type`: `pro` o `clinic`
   - `stripe_customer_id`: `cus_xxx`
   - `stripe_subscription_id`: `sub_xxx`
   - `subscription_status`: `active`

## 🐛 Troubleshooting

### Error: "Failed to create checkout session"

**Solución:**
- Verifica que el backend esté corriendo (`http://localhost:3001/api/health`)
- Revisa que `STRIPE_SECRET_KEY` esté en `server/.env`
- Revisa que los Price IDs en `planService.ts` sean correctos

### Error: "Webhook signature verification failed"

**Solución:**
- Verifica que `STRIPE_WEBHOOK_SECRET` esté en `server/.env`
- Asegúrate de que Stripe CLI esté corriendo (`stripe listen`)
- Reinicia el servidor backend después de agregar el webhook secret

### No me redirige a Stripe Checkout

**Solución:**
- Abre la consola del navegador (F12)
- Busca errores
- Verifica que `VITE_API_URL` esté en el `.env` del frontend
- Reinicia el servidor de desarrollo del frontend

### El webhook no se recibe

**Solución:**
- Verifica que Stripe CLI esté corriendo: `stripe listen --forward-to http://localhost:3001/api/stripe-webhook`
- Verifica que el backend esté escuchando en el puerto 3001
- Revisa los logs del backend en la terminal

### Plan no se actualiza en Supabase

**Solución:**
- Revisa los logs del backend en la terminal del webhook
- Verifica que `SUPABASE_SERVICE_KEY` esté configurado (no la anon key)
- Verifica que la columna `plan_type` exista en la tabla `users`
- Verifica que el email del usuario coincida entre Stripe y Supabase

## 🚀 Paso 8: Deploy a Producción

### 8.1 Cambiar a Claves Live de Stripe

1. Ve a https://dashboard.stripe.com/apikeys (sin /test/)
2. Activa tu cuenta de Stripe (requiere verificación)
3. Obtén las claves **LIVE**:
   - `pk_live_xxx`
   - `sk_live_xxx`

### 8.2 Actualizar Price IDs a Producción

1. Crea los productos en modo LIVE en Stripe
2. Actualiza los Price IDs en `planService.ts` con los IDs de producción

### 8.3 Configurar Webhook en Producción

1. Ve a https://dashboard.stripe.com/webhooks
2. Clic "Add endpoint"
3. URL: `https://tu-dominio.com/api/stripe-webhook`
4. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copia el **Signing secret** y agrégalo a las variables de entorno de producción

### 8.4 Deploy del Backend

Opciones recomendadas:

**Railway** (Recomendado):
1. https://railway.app
2. Conecta tu repo de GitHub
3. Configura las variables de entorno
4. Deploy automático

**Render**:
1. https://render.com
2. New Web Service
3. Conecta repo
4. Agrega variables de entorno

**Fly.io**:
```bash
fly launch
fly secrets set STRIPE_SECRET_KEY=sk_live_xxx
fly deploy
```

### 8.5 Actualizar Frontend

Actualiza `.env` para producción:
```bash
VITE_API_URL=https://tu-api-backend.com
```

Rebuild y deploy:
```bash
npm run build
# Deploy a tu hosting (Vercel, Netlify, etc.)
```

## 📚 Recursos Útiles

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Supabase Docs](https://supabase.com/docs)

## ✨ ¡Listo!

Tu aplicación ahora acepta pagos con Stripe. Los usuarios pueden:
- ✅ Registrarse y seleccionar un plan
- ✅ Pagar con tarjeta de crédito/débito
- ✅ Acceder inmediatamente a las funciones del plan
- ✅ Cancelar su suscripción desde la app
- ✅ Ser downgradeados automáticamente si cancelan

¿Necesitas ayuda? Revisa la sección de Troubleshooting o los logs del servidor.
