# Stripe Test Setup

Para que el flujo `create-account -> onboarding -> plans -> Stripe -> app` funcione en modo test:

1. Despliega estas funciones en Supabase:
   - `supabase/functions/create-stripe-checkout/index.ts`
   - `supabase/functions/stripe-webhook/index.ts`

2. Configura estos secrets en Supabase:
   - `STRIPE_SECRET_KEY`
   - `APP_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`

3. Usa `price IDs` de test en Stripe:
   - `VITE_STRIPE_PRICE_PRACTITIONER`
   - `VITE_STRIPE_PRICE_ADVANCED`

4. Crea el webhook de Stripe apuntando a la función `stripe-webhook` de Supabase.

5. Prueba el flujo con una tarjeta de test de Stripe y confirma que:
   - `free` entra directo a `/app`
   - `practitioner` y `advanced` pasan por Checkout
   - al pagar, el plan se escribe en `users.plan_type`

Si usas solo modo test, no pongas claves live en ningún sitio.
