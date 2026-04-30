# 🎯 Sistema de Planes Dinámicos con Supabase

## ✅ ¿Qué hace esto?

Ahora cuando modificas un plan en **Admin Panel**, los cambios se guardan en **Supabase** (base de datos centralizada) y **TODOS los usuarios** con ese plan ven los cambios automáticamente.

---

## 🚀 Cómo Configurarlo

### **Paso 1: Ejecutar SQL en Supabase**

1. Ve a **Supabase Dashboard → SQL Editor**
2. Ejecuta `SUPABASE_PLANS_TABLE.sql`
3. Esto crea la tabla `plans` con 3 planes por defecto:
   - ✅ free
   - ✅ practitioner
   - ✅ advanced

### **Paso 2: Verificar que Funcionó**

1. Ve a **Table Editor** en Supabase
2. Abre la tabla `plans`
3. Deberías ver 3 filas (free, practitioner, advanced)

### **Paso 3: Probar el Sistema**

1. **Como Admin:**
   - Ve a Admin Panel → Plan Management
   - Edita el plan "Practitioner"
   - Por ejemplo, desactiva `builder`
   - Guarda los cambios

2. **Como Usuario:**
   - Inicia sesión con un usuario que tenga plan "Practitioner"
   - Recarga la página
   - Ahora NO deberías tener acceso al Builder ❌

3. **Reactiva el Builder:**
   - Vuelve al Admin Panel
   - Activa `builder` de nuevo en plan "Practitioner"
   - Guarda

4. **Usuario recarga:**
   - El usuario recarga la app
   - Ahora SÍ tiene acceso al Builder ✅

---

## 🔄 Cómo Funciona Internamente

### **Antes (localStorage)**
```
Admin → Edita plan en Admin Panel
      → Guarda solo en localStorage de SU navegador
      
Usuario → Lee de SU localStorage (diferente)
        → NO ve los cambios ❌
```

### **Ahora (Supabase)**
```
Admin → Edita plan en Admin Panel
      → handleSave() guarda en:
          1. localStorage (compatibilidad)
          2. Supabase tabla 'plans' ✅
      
Usuario → UserContext carga features desde Supabase
        → getPlanFeaturesAsync(planType)
        → Lee tabla 'plans' en Supabase
        → VE los cambios inmediatamente ✅
```

---

## 📁 Archivos Modificados

### **1. `/src/app/services/plansService.ts`** (NUEVO)
- `getPlanFeatures()` - Lee features de un plan desde Supabase
- `updatePlanFeatures()` - Actualiza features en Supabase
- `getActivePlans()` - Obtiene todos los planes activos

### **2. `/src/app/data/usersManager.ts`**
- ✅ Agregado `getPlanFeaturesAsync()` - Versión async que lee de Supabase
- ✅ Agregado `bioactiveCompoundsFilter` a interface PlanFeatures
- ✅ DEFAULT_PLANS actualizado con el nuevo campo

### **3. `/src/app/contexts/UserContext.tsx`**
- ✅ Cuando el usuario inicia sesión, carga features desde Supabase
- ✅ Cuando cambia el plan, recarga features desde Supabase
- Usa `getPlanFeaturesAsync()` en lugar de `getCurrentUserFeatures()`

### **4. `/src/app/pages/AdminPlanManagement.tsx`**
- ✅ `handleSave()` ahora es async y guarda en:
  1. localStorage (para compatibilidad)
  2. Supabase (para centralización)

### **5. `SUPABASE_PLANS_TABLE.sql`** (NUEVO)
- Crea tabla `plans` en Supabase
- Inserta 3 planes por defecto
- Configura RLS policies

---

## 🎯 Features Configurables

Estas son las features que puedes activar/desactivar por plan:

### **Acceso a Bibliotecas**
- `herbLibraryAccess`: 'none' | 'sample' | 'full'
- `formulaLibraryAccess`: 'none' | 'sample' | 'full'

### **Herramientas**
- `builder`: Prescription Builder
- `prescriptionLibrary`: Biblioteca de prescripciones
- `statistics`: Estadísticas de uso
- `customContent`: Crear contenido personalizado

### **Filtros**
- `herbPropertyFilters`: Filtros de propiedades de hierbas
- `formulaPropertyFilters`: Filtros de propiedades de fórmulas
- `clinicalUseFilters`: Filtros de uso clínico
- `pharmacologicalEffectsFilter`: Efectos farmacológicos
- `biologicalMechanismsFilter`: Mecanismos biológicos
- `bioactiveCompoundsFilter`: Compuestos bioactivos

### **Safety Engine**
- `generalConditions`: Condiciones generales
- `medications`: Interacciones medicamentos
- `allergies`: Alergenos
- `tcmRiskPatterns`: Patrones TCM de riesgo
- `safetyEngineMode`: 'disabled' | 'basic' | 'advanced'

### **Límites**
- `monthlyFormulas`: Número de fórmulas por mes (null = ilimitado)

---

## 🔍 Debugging

### **Ver qué features tiene un usuario:**

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver plan type del usuario
localStorage.getItem('userPlanType')

// Ver features cargadas (UserContext)
// Mira los console.logs que ya están en UserContext:
// "✅ DEBUG - Plan features loaded from Supabase:"
```

### **Ver planes en Supabase:**

1. Ve a **Supabase → Table Editor → plans**
2. Expande la columna `features` (es JSONB)
3. Ahí ves exactamente qué features tiene cada plan

### **Problemas comunes:**

**❌ Los cambios no se ven:**
- Recarga la página del usuario (F5)
- Verifica que guardaste en Admin Panel
- Mira consola del navegador - debe decir "Plan features loaded from Supabase"

**❌ Error "features is null":**
- Ejecutaste el SQL de SUPABASE_PLANS_TABLE.sql?
- Verifica en Table Editor que existen los planes

**❌ Usuario sigue viendo features antiguas:**
- localStorage puede tener cache
- Ejecuta `localStorage.clear()` y vuelve a login

---

## 🎉 Ventajas del Sistema

✅ **Centralizado**: Un solo lugar controla todos los planes  
✅ **Dinámico**: Cambios se aplican sin redeploy  
✅ **Escalable**: Funciona con 10 o 10,000 usuarios  
✅ **Auditable**: Supabase guarda historial de cambios  
✅ **Seguro**: RLS policies protegen la data  

---

## 🚨 Importante

- **Admin Panel ahora guarda en 2 lugares**: localStorage Y Supabase
- **Usuarios siempre leen de Supabase** (no localStorage)
- **localStorage solo es fallback** si Supabase falla
- **Los cambios requieren reload** del usuario (F5)

---

¿Problemas? Revisa los console.logs en navegador o comparte el error.
