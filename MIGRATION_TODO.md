# Migración a Supabase - TODO List

## ✅ Completado

1. **Tablas creadas en Supabase:**
   - users
   - herbs  
   - formulas
   - prescriptions
   - promotions
   - courses
   - news
   - research
   - community_posts
   - community_comments
   - celebrations
   - banners
   - dashboard_messages

2. **Servicios creados:**
   - `/src/app/services/promotionsService.ts`
   - `/src/app/services/coursesService.ts`
   - `/src/app/services/newsService.ts`
   - `/src/app/services/researchService.ts`
   - `/src/app/services/celebrationsService.ts`
   - `/src/app/services/bannersService.ts`
   - `/src/app/services/dashboardMessagesService.ts`
   - `/src/app/services/communityService.ts`

3. **Páginas migradas:**
   - `/src/app/pages/AdminDashboardPromotions-NEW.tsx` (creada, pendiente de activar)

---

## 🔨 Pendiente de Migrar

### Paso 1: Activar la nueva página de Promotions

```bash
mv src/app/pages/AdminDashboardPromotions-NEW.tsx src/app/pages/AdminDashboardPromotions.tsx
```

### Paso 2: Migrar páginas de Admin (Dashboard Content)

Las siguientes páginas necesitan ser actualizadas para usar Supabase en lugar de localStorage:

#### A. **AdminDashboardCourses.tsx**
- Archivo: `/src/app/pages/AdminDashboardCourses.tsx`
- Servicio: `coursesService`
- Reemplazar: `getC ourses()`, `deleteCourse()`, `updateCourse()`, etc.
- Por: `coursesService.getAllCourses()`, `coursesService.deleteCourse()`, etc.

#### B. **AdminDashboardNews.tsx**
- Archivo: `/src/app/pages/AdminDashboardNews.tsx`
- Servicio: `newsService`
- Reemplazar imports de `/src/app/data/newsContent.ts`
- Por: `newsService.getAllNews()`, `newsService.createNews()`, etc.

#### C. **AdminDashboardResearch.tsx**
- Archivo: `/src/app/pages/AdminDashboardResearch.tsx`
- Servicio: `researchService`
- Reemplazar imports de `/src/app/data/researchContent.ts`
- Por: `researchService.getAllResearch()`, etc.

#### D. **AdminDashboardCelebrations.tsx**
- Archivo: `/src/app/pages/AdminDashboardCelebrations.tsx`
- Servicio: `celebrationsService`
- Reemplazar imports de `/src/app/data/celebrationsContent.ts`
- Por: `celebrationsService.getAllCelebrations()`, etc.

#### E. **AdminDashboardBanners.tsx**
- Archivo: `/src/app/pages/AdminDashboardBanners.tsx`
- Servicio: `bannersService`
- Reemplazar imports de `/src/app/data/bannersContent.ts`
- Por: `bannersService.getAllBanners()`, etc.

#### F. **AdminDashboardMessages.tsx**
- Archivo: `/src/app/pages/AdminDashboardMessages.tsx`
- Servicio: `dashboardMessagesService`
- Reemplazar imports de `/src/app/data/dashboardContent.ts`
- Por: `dashboardMessagesService.getAllMessages()`, etc.

#### G. **AdminCommunity.tsx**
- Archivo: `/src/app/pages/AdminCommunity.tsx`
- Servicio: `communityService`
- Reemplazar imports de `/src/app/data/communityContent.ts`
- Por: `communityService.getAllPosts()`, etc.

### Paso 3: Migrar páginas de Usuario (Frontend)

#### A. **Promos.tsx**
- Archivo: `/src/app/pages/Promos.tsx`
- Cambiar: `getPromos()` → `promotionsService.getActivePromotions()`

#### B. **Courses.tsx**
- Archivo: `/src/app/pages/Courses.tsx`
- Cambiar: `getCourses()` → `coursesService.getActiveCourses()`

#### C. **News.tsx**
- Archivo: `/src/app/pages/News.tsx`
- Cambiar: `getNews()` → `newsService.getActiveNews()`

#### D. **Research.tsx**
- Archivo: `/src/app/pages/Research.tsx`
- Cambiar: `getResearch()` → `researchService.getActiveResearch()`

#### E. **Community.tsx** y **CommunityPostDetail.tsx**
- Archivos: `/src/app/pages/Community.tsx`, `/src/app/pages/CommunityPostDetail.tsx`
- Cambiar: `getPosts()`, `getComments()` → `communityService.getActivePosts()`, `communityService.getPostComments()`

### Paso 4: Migrar Dashboard.tsx

El dashboard muestra contenido de múltiples fuentes. Actualizar:

```typescript
// Antes
import { getPromos } from '@/app/data/promosContent';
import { getCourses } from '@/app/data/coursesContent';
// etc...

// Después
import { promotionsService } from '@/app/services/promotionsService';
import { coursesService } from '@/app/services/coursesService';

// Usar en useEffect:
const loadDashboardContent = async () => {
  const promos = await promotionsService.getActivePromotions();
  const courses = await coursesService.getActiveCourses();
  // etc...
}
```

### Paso 5: Actualizar componentes

#### A. **QuickActionCards.tsx**
- Archivo: `/src/app/components/dashboard/QuickActionCards.tsx`
- Si muestra contenido de promotions/courses/etc, actualizar a usar servicios

#### B. **PromoDetailModal.tsx**
- Archivo: `/src/app/components/PromoDetailModal.tsx`
- Actualizar para recibir datos de Supabase

---

## 📋 Patrón de Migración

Para cada archivo que migres, sigue este patrón:

### 1. Imports
```typescript
// ❌ ANTES (localStorage)
import { getPromos, deletePromo } from '@/app/data/promosContent';

// ✅ DESPUÉS (Supabase)
import { promotionsService, type Promotion } from '@/app/services/promotionsService';
```

### 2. State Management
```typescript
// ❌ ANTES
const [promos, setPromos] = useState(getPromos());

// ✅ DESPUÉS
const [promos, setPromos] = useState<Promotion[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    const data = await promotionsService.getAllPromotions();
    setPromos(data);
    setLoading(false);
  };
  loadData();
}, []);
```

### 3. CRUD Operations
```typescript
// ❌ ANTES
const handleDelete = (id: string) => {
  deletePromo(id);
  setPromos(getPromos());
};

// ✅ DESPUÉS
const handleDelete = async (id: string) => {
  const success = await promotionsService.deletePromotion(id);
  if (success) {
    toast.success('Deleted successfully');
    loadData(); // Reload from Supabase
  } else {
    toast.error('Failed to delete');
  }
};
```

### 4. Loading States
```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  );
}
```

---

## 🔧 Ejemplo Completo: Migrar AdminDashboardCourses.tsx

### Antes:
```typescript
import { getCourses, deleteCourse, updateCourse } from '@/app/data/coursesContent';

const [courses, setCourses] = useState(getCourses());

const handleDelete = (id: string) => {
  deleteCourse(id);
  setCourses(getCourses());
};
```

### Después:
```typescript
import { coursesService, type Course } from '@/app/services/coursesService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const [courses, setCourses] = useState<Course[]>([]);
const [loading, setLoading] = useState(true);

const loadCourses = async () => {
  setLoading(true);
  const data = await coursesService.getAllCourses();
  setCourses(data);
  setLoading(false);
};

useEffect(() => {
  loadCourses();
}, []);

const handleDelete = async (id: string) => {
  const success = await coursesService.deleteCourse(id);
  if (success) {
    toast.success('Course deleted');
    loadCourses();
  } else {
    toast.error('Failed to delete');
  }
};

if (loading) {
  return <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
  </div>;
}
```

---

## ⚠️ Notas Importantes

1. **No uses `getPromos()`, `getCourses()`, etc. directamente** - siempre usa `await` con los servicios

2. **Añade loading states** a todas las páginas que cargan datos

3. **Usa toast notifications** para feedback de acciones (crear/editar/eliminar)

4. **No olvides el `useEffect`** para cargar datos cuando el componente se monta

5. **Elimina archivos antiguos** cuando termines:
   - `/src/app/data/promosContent.ts`
   - `/src/app/data/coursesContent.ts`
   - `/src/app/data/newsContent.ts`
   - etc.

6. **Elimina listeners de localStorage** - ya no son necesarios:
   ```typescript
   // ❌ YA NO NECESARIO
   window.addEventListener('promos-updated', handleUpdate);
   ```

---

## ✅ Checklist de Migración

### Admin Pages
- [ ] AdminDashboardPromotions (✅ creada como -NEW, pendiente activar)
- [ ] AdminDashboardCourses
- [ ] AdminDashboardNews
- [ ] AdminDashboardResearch
- [ ] AdminDashboardCelebrations
- [ ] AdminDashboardBanners
- [ ] AdminDashboardMessages
- [ ] AdminCommunity

### User Pages
- [ ] Promos.tsx
- [ ] Courses.tsx
- [ ] News.tsx
- [ ] Research.tsx
- [ ] Community.tsx
- [ ] CommunityPostDetail.tsx
- [ ] CommunityNewPost.tsx

### Dashboard & Components
- [ ] Dashboard.tsx
- [ ] QuickActionCards.tsx
- [ ] PromoDetailModal.tsx
- [ ] Otros componentes que usen data antigua

### Cleanup
- [ ] Eliminar archivos `/src/app/data/*Content.ts` antiguos
- [ ] Eliminar publish functions (ya no necesarias)
- [ ] Verificar que no haya imports rotos

---

## 🚀 Cómo Empezar

1. **Activa la primera migración:**
   ```bash
   mv src/app/pages/AdminDashboardPromotions-NEW.tsx src/app/pages/AdminDashboardPromotions.tsx
   ```

2. **Prueba que funcione** - crea, edita, elimina una promoción

3. **Replica el patrón** para las demás páginas una por una

4. **Usa el ejemplo completo** de arriba como referencia

---

¿Por dónde quieres empezar? ¿Activamos Promotions y probamos que funcione primero?
