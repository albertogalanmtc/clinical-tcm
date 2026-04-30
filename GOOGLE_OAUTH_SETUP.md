# 🔐 Google OAuth Setup Guide

## Paso 1: Configurar Google Cloud Console

### 1.1 Crear un Proyecto
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre sugerido: "TCM App" o el nombre de tu app

### 1.2 Habilitar Google+ API
1. En el menú lateral → "APIs & Services" → "Library"
2. Busca "Google+ API"
3. Click en "Enable"

### 1.3 Crear Credenciales OAuth
1. Ve a "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Si te pide, configura la "OAuth consent screen":
   - User Type: **External** (para testing)
   - App name: Tu nombre de app
   - User support email: Tu email
   - Developer contact: Tu email
   - Scopes: Solo necesitas email y profile (se agregan automáticamente)
   - Test users: Agrega tu email y otros emails de prueba

4. Vuelve a "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: **Web application**
6. Name: "TCM Web Client"
7. **Authorized redirect URIs:**
   Supabase Dashboard → Authentication → Providers → Google → Copia el "Callback URL"
   Debe verse como: https://abcdefgh.supabase.co/auth/v1/callback

8. Click "Create"
9. **Guarda el Client ID y Client Secret**

## Paso 2: Configurar Supabase

1. Ve a Supabase Dashboard → Authentication → Providers
2. Busca "Google" y habilítalo
3. Pega Client ID y Client Secret de Google Cloud Console
4. Click "Save"

## Testing

1. Ve a /login en tu app
2. Click "Continue with Google"
3. Autoriza en Google
4. Deberías volver autenticado ✅
