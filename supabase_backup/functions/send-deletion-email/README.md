# Send Deletion Email Edge Function

Esta función envía un email de confirmación cuando un usuario solicita eliminar su cuenta.

## Configuración

### 1. Guardar secrets en Supabase

```bash
# En tu terminal, ejecuta:
supabase secrets set RESEND_API_KEY=tu_api_key_aqui
supabase secrets set APP_URL=https://tu-dominio.com
```

O desde el dashboard:
- Settings → Edge Functions → Secrets
- Añadir: `RESEND_API_KEY` con tu API key de Resend
- Añadir: `APP_URL` con la URL de tu aplicación

### 2. Configurar dominio en Resend

En Resend, añade y verifica tu dominio. Luego actualiza el `from` en `index.ts`:

```typescript
from: 'TCM App <noreply@tudominio.com>', // Tu dominio verificado
```

### 3. Desplegar la función

```bash
supabase functions deploy send-deletion-email
```

## Uso

La función se llama desde el frontend:

```typescript
const { data, error } = await supabase.functions.invoke('send-deletion-email', {
  body: {
    email: 'user@example.com',
    deletionToken: 'abc123...',
    userName: 'John Doe' // opcional
  }
})
```

## Parámetros

- `email` (requerido): Email del usuario
- `deletionToken` (requerido): Token único para confirmar eliminación
- `userName` (opcional): Nombre del usuario para personalizar el email
