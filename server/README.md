# TCM Backend - Stripe Integration

Backend server para manejar la integración de pagos con Stripe.

## 🚀 Instalación

```bash
cd server
npm install
```

## ⚙️ Configuración

1. **Crea el archivo `.env`** copiando `.env.example`:
```bash
cp .env.example .env
```

2. **Configura las variables de entorno**:

### Stripe Keys
Obtén tus claves de: https://dashboard.stripe.com/test/apikeys

- `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe (sk_test_...)
- `STRIPE_WEBHOOK_SECRET`: Secreto del webhook (whsec_...) - Ver sección "Webhooks" abajo

### Supabase
Obtén tus credenciales desde tu proyecto Supabase > Settings > API

- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_SERVICE_KEY`: Service role key (¡NO la anon key!)

### Otras configuraciones
- `PORT`: Puerto del servidor (default: 3001)
- `FRONTEND_URL`: URL de tu frontend (default: http://localhost:5173)

## 🏃 Ejecución

### Modo desarrollo (con auto-reload):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

El servidor estará disponible en: http://localhost:3001

## 🔌 Endpoints

### 1. Health Check
```
GET /api/health
```
Verifica que el servidor esté funcionando.

### 2. Create Checkout Session
```
POST /api/create-checkout-session

Body:
{
  "priceId": "price_xxx",
  "planCode": "pro",
  "billingPeriod": "monthly",
  "customerEmail": "user@example.com",
  "successUrl": "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:5173/select-membership",
  "isUpgrade": false,
  "currentPlan": null
}

Response:
{
  "sessionUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### 3. Verify Checkout Session (opcional)
```
POST /api/verify-checkout-session

Body:
{
  "sessionId": "cs_test_..."
}

Response:
{
  "success": true,
  "planCode": "pro",
  "customerEmail": "user@example.com"
}
```

### 4. Stripe Webhook
```
POST /api/stripe-webhook
```
Recibe eventos de Stripe (checkout.session.completed, customer.subscription.deleted, etc.)

### 5. Get Subscription Status
```
GET /api/subscription-status/:userId

Response:
{
  "planType": "pro",
  "subscriptionStatus": "active",
  "stripeCustomerId": "cus_xxx"
}
```

### 6. Cancel Subscription
```
POST /api/cancel-subscription

Body:
{
  "userId": "user-uuid"
}

Response:
{
  "success": true,
  "cancelAt": 1234567890
}
```

## 🪝 Configurar Webhooks de Stripe

### Desarrollo Local (con Stripe CLI)

1. **Instala Stripe CLI**: https://stripe.com/docs/stripe-cli

2. **Login con Stripe**:
```bash
stripe login
```

3. **Forward webhooks a tu servidor local**:
```bash
stripe listen --forward-to localhost:3001/api/stripe-webhook
```

4. **Copia el webhook secret** que muestra la terminal y agrégalo a tu `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Producción

1. Ve a: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://tu-dominio.com/api/stripe-webhook`
4. Selecciona estos eventos:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copia el "Signing secret" y agrégalo a tus variables de entorno de producción

## 🧪 Testing

### Tarjetas de prueba de Stripe:

- **Éxito**: `4242 4242 4242 4242`
- **Rechazo**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- **CVV**: Cualquier 3 dígitos
- **Fecha**: Cualquier fecha futura

### Flujo de prueba completo:

1. Inicia el servidor: `npm run dev`
2. Inicia Stripe CLI forwarding: `stripe listen --forward-to localhost:3001/api/stripe-webhook`
3. Inicia el frontend
4. Registra un usuario
5. Selecciona un plan de pago (Practitioner/Advanced)
6. Completa el checkout con tarjeta de prueba
7. Verifica en la consola del servidor que el webhook se recibió
8. Verifica en Supabase que el plan del usuario se actualizó

## 📊 Base de Datos (Supabase)

El servidor espera que la tabla `users` tenga estas columnas:

```sql
-- Agregar columnas de Stripe a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
```

## 🔒 Seguridad

- ✅ CORS configurado para solo aceptar requests del frontend
- ✅ Webhook signature verification activada
- ✅ Usa SUPABASE_SERVICE_KEY (no la anon key) para operaciones privilegiadas
- ⚠️ NUNCA expongas tu STRIPE_SECRET_KEY en el frontend
- ⚠️ NUNCA commitees el archivo `.env`

## 📝 Logs

El servidor muestra logs claros para debugging:
- ✅ Verde = Éxito
- ❌ Rojo = Error
- ⚠️ Amarillo = Advertencia
- 🔍 Azul = Info

## 🚀 Deploy

Para producción, puedes deployar este servidor en:

- **Railway**: https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io
- **Heroku**: https://heroku.com

Recuerda:
1. Configurar las variables de entorno en el servicio de hosting
2. Cambiar a claves LIVE de Stripe (sk_live_xxx)
3. Configurar el webhook en Stripe Dashboard apuntando a tu URL de producción
4. Actualizar `FRONTEND_URL` en el `.env` de producción

## 🐛 Troubleshooting

### Error: "Webhook signature verification failed"
- Verifica que `STRIPE_WEBHOOK_SECRET` esté correctamente configurado
- Si usas Stripe CLI, asegúrate de estar usando el secret que te muestra al hacer `stripe listen`

### Error: "User not found"
- Verifica que el email del usuario en Stripe coincida con el email en Supabase
- Verifica que el usuario se haya registrado correctamente en Supabase

### Error: "Failed to create checkout session"
- Verifica que el `priceId` exista en tu cuenta de Stripe
- Verifica que `STRIPE_SECRET_KEY` esté correctamente configurado

## 📚 Recursos

- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Supabase Docs](https://supabase.com/docs)
