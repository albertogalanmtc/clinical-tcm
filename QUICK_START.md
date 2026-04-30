# 🚀 Inicio Rápido - Stripe Integration

## ✅ Lo que se implementó

### Backend (TypeScript + Express)
📁 `/server/`
- ✅ Servidor Express con TypeScript
- ✅ 3 endpoints de Stripe (checkout, verify, webhook)
- ✅ Integración con Supabase
- ✅ Manejo de suscripciones (crear, cancelar, renovar)
- ✅ Logs claros para debugging

### Frontend (React)
- ✅ Código de pago activado en `SelectMembership.tsx`
- ✅ Conectado al backend via `VITE_API_URL`
- ✅ Flujo completo: Free → Stripe Checkout → Success → App

### Base de Datos
- ✅ Script SQL para agregar columnas de Stripe a `users`

## 🏃 Inicio Rápido (3 pasos)

### 1️⃣ Configura Stripe
```bash
# Ve a https://dashboard.stripe.com/test/products
# Crea 2 productos: Practitioner ($29/$290) y Advanced ($49/$490)
# Guarda los 4 Price IDs
```

### 2️⃣ Configura el Backend
```bash
cd server
npm install
cp .env.example .env
# Edita .env con tus credenciales de Stripe y Supabase
npm run dev
```

### 3️⃣ Configura Webhooks (otra terminal)
```bash
# Instala Stripe CLI: brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to http://localhost:3001/api/stripe-webhook
# Copia el webhook secret a server/.env
```

### 4️⃣ Inicia el Frontend
```bash
# En la raíz del proyecto
cp .env.example .env
# VITE_API_URL ya está configurado en el .env.example
npm run dev
```

## 🧪 Prueba

1. Ve a http://localhost:5173
2. Regístrate → Selecciona Practitioner/Advanced
3. Usa tarjeta: `4242 4242 4242 4242`
4. ¡Listo! Deberías entrar con el plan actualizado

## 📚 Guías Completas

- **Setup detallado**: Ver `SETUP_STRIPE.md`
- **Backend docs**: Ver `server/README.md`
- **Troubleshooting**: Ver `SETUP_STRIPE.md` sección 🐛

## ⚡ Comandos Útiles

```bash
# Backend
cd server && npm run dev

# Frontend  
npm run dev

# Webhooks
stripe listen --forward-to http://localhost:3001/api/stripe-webhook

# Check health
curl http://localhost:3001/api/health
```
