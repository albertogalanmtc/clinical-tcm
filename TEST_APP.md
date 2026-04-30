# 🧪 Testing de la App

## 🔍 VERIFICACIÓN RÁPIDA

### Paso 1: Abre la consola del navegador

1. Abre http://localhost:5173 en tu navegador
2. Presiona **F12** (o Click derecho → Inspeccionar)
3. Ve a la pestaña **Console**

### Paso 2: Limpia localStorage

Ejecuta esto en la consola del navegador:

```javascript
localStorage.clear();
location.reload();
```

### Paso 3: ¿Qué debería pasar?

**✅ SI FUNCIONA:**
- Te redirige a `/login`
- Ves el formulario de login
- URL en navegador: `http://localhost:5173/login`

**❌ SI NO FUNCIONA:**
Verás errores en la consola del navegador.

---

## 📝 Copia los errores aquí

Si ves errores en rojo en la consola, **cópiamelos** y los arreglo inmediatamente.

Errores comunes:
- `Failed to resolve module` → Falta importar algo
- `Cannot read property of undefined` → Bug en el código
- `Network error` → Problema con Supabase

---

## 🎯 Después de limpiar localStorage

1. Intenta registrarte: Click "Sign up"
2. Completa el formulario
3. Deberías ver un mensaje de confirmación
4. Revisa tu email (si Supabase tiene email confirmación habilitado)

---

## ✅ Si todo funciona

Entonces puedes:
1. Registrar tu usuario
2. Ir a Supabase → Table Editor → users
3. Cambiar tu `role` a `admin`
4. Recargar la app
5. Ahora deberías tener acceso a `/admin`

---

¿Qué ves en la consola después de `localStorage.clear()`?
