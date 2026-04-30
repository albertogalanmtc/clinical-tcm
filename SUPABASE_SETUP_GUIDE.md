# 🗄️ Guía de Setup de Supabase

## 📋 Orden de Ejecución

Ejecuta estos archivos SQL **en orden** en Supabase Dashboard → SQL Editor:

### **Paso 1: Crear todas las tablas base**
```
SUPABASE_CREATE_ALL_TABLES.sql
```
✅ Esto crea:
- `users` - Perfiles de usuarios
- `dashboard_messages` - Mensajes del dashboard
- `surveys` - Encuestas
- `survey_responses` - Respuestas a encuestas
- `banners` - Banners informativos
- `community_posts` - Posts de la comunidad
- `community_comments` - Comentarios en posts
- `news` - Artículos de noticias

---

### **Paso 2: Configurar permisos y funciones**
```
SUPABASE_COMPLETE_SETUP.sql
```
✅ Esto configura:
- Row Level Security (RLS) en todas las tablas
- Políticas de acceso (usuarios vs admins)
- Funciones helper (`is_admin()`, `has_plan_access()`)
- Trigger para auto-crear perfiles al registrarse
- Índices para performance
- Tabla `user_dismissed_items` para tracking

---

## 🚀 Cómo Ejecutar

1. **Ve a Supabase Dashboard**
   - https://supabase.com/dashboard/project/TU_PROJECT_ID

2. **Abre SQL Editor**
   - Sidebar izquierdo → SQL Editor

3. **Ejecuta Paso 1**
   - Click "New Query"
   - Copia/pega todo el contenido de `SUPABASE_CREATE_ALL_TABLES.sql`
   - Click "Run" (abajo derecha)
   - Espera confirmación ✅

4. **Ejecuta Paso 2**
   - Click "New Query" otra vez
   - Copia/pega todo el contenido de `SUPABASE_COMPLETE_SETUP.sql`
   - Click "Run"
   - Espera confirmación ✅

---

## ✅ Verificar que Funcionó

1. **Ve a Table Editor**
   - Sidebar izquierdo → Table Editor

2. **Deberías ver estas tablas:**
   - ✅ users
   - ✅ user_dismissed_items
   - ✅ dashboard_messages
   - ✅ surveys
   - ✅ survey_responses
   - ✅ banners
   - ✅ community_posts
   - ✅ community_comments
   - ✅ news

3. **Verifica RLS habilitado:**
   - Cada tabla debe tener el candado 🔒 (RLS enabled)

---

## 🔧 Troubleshooting

### Error: "relation already exists"
✅ **Está bien!** Las tablas ya existen. El script es **idempotente** (safe to run multiple times).

### Error: "permission denied"
❌ Asegúrate de estar usando el **SQL Editor** de Supabase, no un cliente SQL externo.

### Error: "foreign key violation"
❌ Ejecutaste los scripts en el orden incorrecto. 
Solución:
1. Ve a Table Editor
2. Elimina todas las tablas manualmente
3. Ejecuta de nuevo en orden: CREATE_ALL_TABLES → COMPLETE_SETUP

---

## 🎯 Después del Setup

### Crear tu usuario admin:

1. **Regístrate en la app** (http://localhost:5173/register)
2. **Ve a Supabase → Table Editor → users**
3. **Encuentra tu usuario** (busca por email)
4. **Edita la columna `role`**: cambia `'user'` → `'admin'`
5. **Recarga la app** → Ahora tienes acceso admin! 🎉

### Variables de entorno necesarias:

Asegúrate de tener esto en tu `.env`:

```bash
# Supabase
VITE_SUPABASE_URL=https://tu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Stripe (para pagos)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📚 Features que Dependen de Estas Tablas

- ✅ **Authentication** → `users`
- ✅ **Community Forum** → `community_posts`, `community_comments`
- ✅ **News Section** → `news`
- ✅ **Dashboard Messages** → `dashboard_messages`
- ✅ **Surveys** → `surveys`, `survey_responses`
- ✅ **Banners** → `banners`
- ✅ **Plan-based Access Control** → `users.plan_type`, RLS policies

---

¿Problemas? Copia el error exacto que ves en consola y compártelo.
