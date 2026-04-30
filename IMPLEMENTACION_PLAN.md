# 📋 PLAN DE IMPLEMENTACIÓN COMPLETA

## ✅ LO QUE YA TIENES

1. **Supabase configurado**
   - Tablas: users, herbs, formulas, prescriptions, surveys, banners, dashboard_messages
   - RLS policies básicas
   - Triggers para auto-crear perfiles

2. **Auth parcialmente implementada**
   - Login.tsx ya usa Supabase Auth
   - Detecta usuarios demo vs usuarios reales
   - Guarda sesión en localStorage

3. **Stripe integrado**
   - createStripeCheckout funciona
   - Redirect a Stripe checkout OK
   - Edge Function `create-stripe-checkout` configurada

## ❌ LO QUE FALTA

### CRÍTICO (Hacer AHORA):

1. **Proteger rutas** - Cualquiera puede entrar sin login
2. **Migrar UserContext** - Aún usa localStorage, debe usar Supabase
3. **Google OAuth** - Configurar provider (tienes la guía)
4. **Webhook Stripe** - Pagos no actualizan plan del usuario
5. **Control de acceso** - Planes no restringen features

### IMPORTANTE (Hacer después):

6. Migrar dismissed items a Supabase
7. Migrar todo contenido de localStorage a Supabase
8. Testing completo

---

## 🚀 ORDEN DE EJECUCIÓN

### PASO 1: Ejecutar SQL en Supabase (TÚ)
```sql
-- Ejecuta SUPABASE_COMPLETE_SETUP.sql en Supabase Dashboard
-- Esto crea:
-- - Columnas faltantes en users (stripe_customer_id, etc.)
-- - Tabla user_dismissed_items
-- - Actualiza surveys/banners/dashboard_messages
-- - Crea funciones is_admin() y has_plan_access()
-- - Trigger para auto-crear perfil en signup
```

### PASO 2: Configurar Google OAuth (TÚ)
```
Sigue GOOGLE_OAUTH_SETUP.md:
1. Google Cloud Console → Crear OAuth Client
2. Supabase Dashboard → Enable Google provider
3. Copiar Client ID y Secret
```

### PASO 3: Código (YO - Claude)
```typescript
1. Actualizar UserContext para usar Supabase session
2. Crear ProtectedRoute component
3. Envolver rutas que requieren auth
4. Implementar control de acceso por plan
5. Migrar dismissed items a Supabase
6. Crear página de error/no-access
```

### PASO 4: Deploy Webhook (TÚ)
```
1. Deploy /server a Vercel/Railway
2. Configurar webhook en Stripe Dashboard
3. Probar pago end-to-end
```

---

## 📝 TAREAS ESPECÍFICAS

### Para TI (Usuario):

- [ ] Ejecutar `SUPABASE_COMPLETE_SETUP.sql` en Supabase SQL Editor
- [ ] Configurar Google OAuth (sigue `GOOGLE_OAUTH_SETUP.md`)
- [ ] Crear primer usuario admin manualmente en Supabase:
  ```sql
  UPDATE users 
  SET role = 'admin', plan_type = 'admin'
  WHERE email = 'tu-email@example.com';
  ```
- [ ] Deploy `/server` a Vercel (cuando estés listo)
- [ ] Configurar webhook URL en Stripe Dashboard

### Para MÍ (Claude):

- [ ] Actualizar UserContext.tsx
- [ ] Crear ProtectedRoute.tsx
- [ ] Envolver rutas en App.tsx
- [ ] Crear PlanGate.tsx (bloquea features por plan)
- [ ] Actualizar servicios para usar Supabase en lugar de localStorage
- [ ] Migrar dismissed messages a Supabase
- [ ] Testing y debugging

---

## 🎯 RESULTADO FINAL

**App completamente funcional:**
✅ Login real con email/password + Google
✅ Solo usuarios autenticados pueden acceder
✅ Planes limitan acceso a features
✅ Admin no paga, tiene acceso total
✅ Stripe cobra y actualiza plan en DB
✅ Todo persiste en Supabase (no localStorage)
✅ Ready para producción

---

## ⏱️ TIEMPO ESTIMADO

- SQL setup: 5 minutos (tú)
- Google OAuth: 15 minutos (tú)
- Código: 30-45 minutos (yo)
- Deploy webhook: 20 minutos (tú)
- Testing: 15 minutos

**Total: ~2 horas**

---

🚀 **¿Empezamos?**

Dime si ya ejecutaste el SQL y configuraste Google OAuth, y empiezo con el código.
