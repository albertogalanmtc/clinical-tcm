# ⚡ Arreglar el Error "Failed to fetch"

## 🔴 El Problema

El frontend no puede conectarse al backend porque **el backend no está corriendo**.

## ✅ La Solución (3 pasos)

### Paso 1: Configura el Backend

```bash
cd server
npm install
cp .env.example .env
```

**Edita `server/.env`** con tus credenciales reales:

```bash
# MÍNIMO REQUERIDO para que funcione:
STRIPE_SECRET_KEY=sk_test_tu_clave_aqui
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key_aqui
```

> 💡 **¿Dónde consigo estas credenciales?**
> - Stripe: https://dashboard.stripe.com/test/apikeys
> - Supabase: Tu proyecto → Settings → API

### Paso 2: Inicia el Backend

**Opción A - Automático:**
```bash
./start-backend.sh
```

**Opción B - Manual:**
```bash
cd server
npm run dev
```

Deberías ver:
```
🚀 Server running on http://localhost:3001
🔑 Stripe: ✅ Configured
🗄️  Supabase: ✅ Configured
```

### Paso 3: Reinicia el Frontend

En **otra terminal**:

```bash
# Para el servidor actual (Ctrl+C)
npm run dev
```

## 🧪 Prueba

1. Ve a http://localhost:5173
2. Registra un usuario
3. Selecciona **Practitioner** o **Advanced**
4. Clic en **"Continue to Payment"**
5. Ya **NO** debería salir el error "Failed to fetch"

---

## 🆘 Si Aún Tienes Problemas

### Verifica que el backend esté corriendo:

```bash
curl http://localhost:3001/api/health
```

**Respuesta esperada:**
```json
{"status":"ok","timestamp":"2026-04-27T..."}
```

### Verifica el .env del frontend:

```bash
cat .env | grep VITE_API_URL
```

**Debería mostrar:**
```
VITE_API_URL=http://localhost:3001
```

### Verifica los logs del backend:

En la terminal donde corre el backend, deberías ver:
```
🛒 Creating checkout session for: { planCode: 'pro', customerEmail: '...', isUpgrade: false }
```

---

## 📋 Checklist

- [ ] Backend instalado (`cd server && npm install`)
- [ ] Backend configurado (`server/.env` con credenciales)
- [ ] Backend corriendo (`npm run dev` en /server)
- [ ] Frontend configurado (`.env` con `VITE_API_URL`)
- [ ] Frontend reiniciado (después de crear `.env`)

---

## 🎯 Próximo Paso

Una vez que el backend esté corriendo y el error "Failed to fetch" desaparezca, verás el **próximo error** que será sobre Stripe (porque aún no has configurado los Price IDs).

Para eso, sigue la guía completa en: **`SETUP_STRIPE.md`**
