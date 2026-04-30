# 🎨 Dashboard Content - Nueva Estructura

**Fecha:** 28 de Abril, 2026  
**Objetivo:** Separar creación de contenido de organización/layout

---

## 📋 **Nueva Estructura**

### **Dashboard Content Hub** (`/admin/dashboard-content`)
Portal central para gestionar todo el contenido del dashboard.

**Cards disponibles:**

#### 1️⃣ **Dashboard Organization**
- **Ruta:** `/admin/dashboard-organization`
- **Función:** Organizar layout y posicionamiento del contenido
- **Features:**
  - Content Layout & Positioning (flechas up/down)
  - Ordenar elementos respecto a Quick Actions
  - Editar Quick Actions settings
  - Editar Community card settings

#### 2️⃣ **Messages** 🆕
- **Ruta:** `/admin/dashboard-content/messages`
- **Función:** CRUD completo de mensajes de dashboard
- **Features:**
  - Crear/editar/eliminar mensajes
  - Toggle active/inactive
  - Tipos: info, warning, success, tip
  - Priority levels
  - Vista previa

#### 3️⃣ **Carousel Images** 🆕
- **Ruta:** `/admin/dashboard-content/images`
- **Función:** CRUD completo de carousel + settings globales
- **Features:**
  - Crear/editar/eliminar slides
  - Reordenar slides (flechas up/down)
  - Toggle visible/hidden
  - Carousel Settings integrados:
    - Desktop ratio (16:9, 9:16, fullscreen)
    - Mobile ratio
    - Transition interval
  - Vista previa

#### 4️⃣ **Banners**
- **Ruta:** `/admin/dashboard-content/banners`
- **Función:** Gestionar banners y anuncios
- **Sin cambios**

#### 5️⃣ **Surveys**
- **Ruta:** `/admin/dashboard-content/surveys`
- **Función:** Crear encuestas con preguntas
- **Sin cambios**

#### 6️⃣ **News**
- **Ruta:** `/admin/dashboard-content/news`
- **Función:** Gestionar artículos para la Quick Action "News"
- **Nota:** News es una card de Quick Actions, NO contenido posicionable

---

## 🔄 **Cambios Realizados**

### **✅ Archivos Creados**
1. `src/app/pages/AdminDashboardMessages.tsx`
   - CRUD completo de mensajes
   - Modal de edición integrado
   - Confirmación de eliminación

2. `src/app/pages/AdminDashboardImages.tsx`
   - CRUD completo de slides
   - Carousel settings integrados
   - Reordenamiento con flechas
   - Vista previa del carousel

### **✏️ Archivos Modificados**

1. **AdminDashboardContent.tsx → AdminDashboardOrganization.tsx**
   - ❌ Eliminados: Botones "Add Message" y "Add Slide"
   - ❌ Eliminada: Sección completa "Carousel Settings"
   - ✅ Mantenido: Content Layout & Positioning
   - ✅ Mantenido: Reordenamiento con flechas
   - ✅ Mantenido: Quick Actions editor
   - **Nota:** Por ahora se mantiene funcional con modales, se limpiará después

2. **AdminDashboardContentHub.tsx**
   - Agregadas cards: Messages, Carousel Images
   - Reordenadas para mejor UX
   - Actualizada descripción de Dashboard Organization

3. **App.tsx**
   - Actualizado import: `AdminDashboardContent → AdminDashboardOrganization`
   - Agregado import: `AdminDashboardImages`
   - Agregada ruta: `/admin/dashboard-content/images`

---

## 🎯 **Flujo de Trabajo**

### **Crear Contenido:**
```
1. Ve a /admin/dashboard-content
2. Selecciona tipo de contenido:
   • Messages → Crear mensajes
   • Carousel Images → Crear slides + configurar carousel
   • Banners → Crear banners
   • Surveys → Crear encuestas
   • News → Crear artículos (para Quick Action)
```

### **Organizar Layout:**
```
1. Ve a /admin/dashboard-content
2. Selecciona "Dashboard Organization"
3. Usa flechas para reordenar elementos respecto a Quick Actions
4. Elementos ordenables:
   - Messages
   - Carousel Images
   - Banners
   - Surveys
   - [Quick Actions] ← Punto de referencia fijo
```

---

## 📊 **Estructura de Datos**

### **Messages** (tabla existente: `dashboard_messages`)
```typescript
{
  id: uuid
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'tip'
  priority: number
  status: 'active' | 'inactive'
  created_by: uuid
  created_at: timestamp
  updated_at: timestamp
}
```

### **Carousel Images** (localStorage: `heroSlides`)
```typescript
{
  id: string
  title: string
  description?: string
  image: string  // URL de la imagen
  ctaText?: string
  ctaLink?: string
  order: number
  visible: boolean
  targetAudience?: string[]
}
```

### **Carousel Settings** (localStorage: `carouselSettings`)
```typescript
{
  desktopRatio: '16:9' | '9:16' | 'fullscreen'
  mobileRatio: '16:9' | '9:16' | 'fullscreen'
  transitionInterval: number  // milliseconds
}
```

---

## 🚀 **Próximos Pasos**

### **Fase 1: Funcional (✅ COMPLETO)**
- [x] Crear AdminDashboardMessages.tsx
- [x] Crear AdminDashboardImages.tsx
- [x] Renombrar a AdminDashboardOrganization.tsx
- [x] Actualizar rutas en App.tsx
- [x] Actualizar ContentHub con nuevas cards

### **Fase 2: Limpieza (✅ COMPLETO)**
- [x] Limpiar AdminDashboardOrganization.tsx:
  - [x] Eliminar modales de creación (HeroSlideModal, WelcomeMessageModal)
  - [x] Eliminar sección "Carousel Settings"
  - [x] Eliminar botones "Add Message" y "Add Slide"
  - [x] Mantener solo positioning + Quick Actions editor
  - [x] Reducción: 721 líneas → 269 líneas (62.7%)

### **Fase 3: Supabase Integration (🔮 FUTURO)**
- [ ] Migrar heroSlides a Supabase table
- [ ] Migrar carouselSettings a platform_settings
- [ ] Supabase Storage para imágenes
- [ ] RLS policies

---

## 📝 **Notas Importantes**

1. **News NO es contenido posicionable**
   - News es una Quick Action card
   - AdminDashboardNews gestiona artículos que aparecen al hacer clic en "News"

2. **Quick Actions son fijas**
   - No se reordenan en el positioning
   - Son el punto de referencia para todo el contenido

3. **Carousel Settings ahora en Images**
   - Antes: En Dashboard Organization
   - Ahora: En Dashboard Content → Images
   - Configuración global para todo el carousel

4. **Messages vs Banners**
   - Messages: Mensajes informativos del dashboard
   - Banners: Anuncios temporales con fechas de inicio/fin

---

**✅ Reorganización completada y funcional**
