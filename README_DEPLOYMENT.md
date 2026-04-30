# TCM Platform - Guía de Deployment

Esta guía te ayudará a desplegar tu aplicación de Medicina Tradicional China en GitHub y Vercel, y prepararla para integración con Supabase.

## 📁 Estructura Preparada para Deployment

Tu proyecto ya está estructurado de forma profesional:

```
/
├── src/
│   ├── types/                    # ✅ Tipos TypeScript centralizados
│   ├── services/api/             # ✅ Servicios abstractos (listos para Supabase)
│   ├── hooks/                    # ✅ Hooks reutilizables (useAsync, etc.)
│   ├── app/
│   │   ├── components/          # Componentes React
│   │   ├── contexts/            # ✅ UserContext preparado
│   │   ├── data/                # Datos mock actuales
│   │   └── pages/               # Páginas de la aplicación
│   └── styles/                   # Estilos Tailwind
├── .env.example                  # ✅ Template de variables de entorno
├── SUPABASE_MIGRATION_GUIDE.md  # ✅ Guía de migración a Supabase
└── vercel.json                   # Configuración de Vercel
```

## 🚀 Paso 1: Preparar GitHub

### 1.1 Crear `.gitignore`

Asegúrate de tener este archivo en la raíz (ya debería existir):

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Environment variables
.env
.env.local
.env.production
.env.development

# Build output
dist/
build/
.vite/

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary
*.tmp
.cache/
```

### 1.2 Inicializar Git y Hacer Push

```bash
# Si aún no has inicializado git
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit: TCM Platform ready for deployment"

# Crear repositorio en GitHub (ve a github.com/new)
# Luego conecta tu repo local:
git remote add origin https://github.com/TU-USUARIO/tcm-platform.git

# Push a GitHub
git branch -M main
git push -u origin main
```

## 📦 Paso 2: Desplegar en Vercel

### 2.1 Opción A: Deploy desde GitHub (Recomendado)

1. Ve a https://vercel.com
2. Crea una cuenta o inicia sesión
3. Click en "Add New Project"
4. Importa tu repositorio de GitHub
5. Vercel detectará automáticamente Vite
6. No agregues variables de entorno todavía (son opcionales por ahora)
7. Click en "Deploy"

### 2.2 Opción B: Deploy desde CLI

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel

# Para producción
vercel --prod
```

### 2.3 Configurar Variables de Entorno (Opcional - para después)

Cuando estés listo para Supabase:

1. En Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Agrega estas variables (cópialas de `.env.example`):

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_URL=https://tu-app.vercel.app
```

**Importante**: Solo agrega variables con prefijo `VITE_` en Vercel para el frontend.

## 🔄 Paso 3: Continuous Deployment

Una vez conectado a GitHub:

1. **Automático**: Cada push a `main` se despliega automáticamente
2. **Preview Deployments**: Cada PR crea un preview deployment
3. **Rollback**: Puedes revertir a cualquier deployment anterior

```bash
# Workflow normal
git add .
git commit -m "Add new feature"
git push origin main
# Vercel despliega automáticamente!
```

## 🗄️ Paso 4: Preparar para Supabase (Futuro)

Tu aplicación ya está preparada para Supabase. Cuando estés listo:

1. **Lee**: `SUPABASE_MIGRATION_GUIDE.md` (guía completa paso a paso)
2. **Crea proyecto** en https://supabase.com
3. **Actualiza servicios** en `/src/services/api/` (instrucciones en la guía)
4. **Migra datos** de localStorage a Supabase
5. **Agrega variables** de Supabase en Vercel

**No necesitas hacer esto ahora**. Tu app funciona perfectamente sin backend.

## 💳 Paso 5: Integrar Stripe (Futuro)

Cuando estés listo para pagos:

1. **Crea cuenta** en https://stripe.com
2. **Obtén keys** del Dashboard → Developers → API Keys
3. **Crea productos y precios** en Stripe Dashboard
4. **Agrega variables** en Vercel:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...  # Para backend/webhooks
   ```
5. **Configura webhooks** para actualizar suscripciones

Ver `STRIPE_INTEGRATION.md` para detalles.

## 🌐 Paso 6: Dominio Personalizado (Opcional)

### En Vercel:

1. Settings → Domains
2. Agrega tu dominio: `tcmplatform.com`
3. Configura DNS según las instrucciones de Vercel
4. Espera propagación DNS (puede tardar hasta 48h)

### Configuración DNS típica:

```
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

## 📊 Monitoreo y Analytics

### Vercel Analytics (Gratis)

1. En tu proyecto → Analytics
2. Analytics automáticos de:
   - Page views
   - Performance metrics
   - Visitor insights

### Agregar Google Analytics (Opcional)

1. Crea propiedad en Google Analytics
2. Agrega variable en Vercel:
   ```
   VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```
3. El código ya está preparado en tu app

## 🔒 Seguridad

### Checklist de Seguridad:

- [✅] `.env` está en `.gitignore`
- [✅] Variables secretas NUNCA tienen prefijo `VITE_`
- [✅] Solo `VITE_*` variables en código frontend
- [ ] Configurar CORS cuando agregues backend
- [ ] Habilitar HTTPS (automático en Vercel)
- [ ] Configurar CSP headers (Content Security Policy)

### Headers de Seguridad en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## 🐛 Troubleshooting

### Build falla en Vercel

**Error: "Command failed: pnpm build"**
```bash
# Verifica localmente:
pnpm build

# Si funciona local, verifica Node version en Vercel:
# Settings → General → Node.js Version → 18.x o 20.x
```

### Variables de entorno no funcionan

**Error: "Cannot read env variable"**
- Verifica que tienen prefijo `VITE_` para frontend
- Redeploy después de agregar variables nuevas
- Variables sin `VITE_` solo funcionan en backend

### 404 en rutas de React Router

**Ya resuelto**: `vercel.json` tiene la configuración de rewrites correcta.

Si tienes problemas:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 📈 Performance Optimization

### Optimizaciones incluidas:

- ✅ Vite con code splitting automático
- ✅ Lazy loading de rutas
- ✅ Cache headers en assets
- ✅ Minificación de código

### Mejoras futuras:

```typescript
// Lazy load de páginas pesadas
const Builder = lazy(() => import('./pages/Builder'));
const AdminPanel = lazy(() => import('./pages/AdminDashboard'));

// En tus rutas:
<Route path="/builder" element={
  <Suspense fallback={<Loading />}>
    <Builder />
  </Suspense>
} />
```

## 🎯 Próximos Pasos

Después del deployment:

1. ✅ **App desplegada** en Vercel
2. ⏭️ **Probar en producción** - verifica que todo funciona
3. ⏭️ **Compartir con usuarios** para feedback
4. ⏭️ **Planear migración a Supabase** cuando necesites backend real
5. ⏭️ **Configurar Stripe** cuando quieras habilitar pagos
6. ⏭️ **Agregar dominio** personalizado

## 📞 Soporte

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev
- **React Router**: https://reactrouter.com
- **Supabase Docs**: https://supabase.com/docs

## 🎉 ¡Listo!

Tu aplicación está:
- ✅ Desplegada en Vercel
- ✅ Conectada a GitHub para CI/CD
- ✅ Preparada para Supabase
- ✅ Preparada para Stripe
- ✅ Lista para escalar

**Estado actual**: Frontend funcional con datos mock
**Próximo paso**: Conectar a Supabase cuando estés listo (ver `SUPABASE_MIGRATION_GUIDE.md`)
