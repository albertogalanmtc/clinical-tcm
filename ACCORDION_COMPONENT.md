# Componente Accordion

## Ubicación
`/src/app/components/ui/Accordion.tsx`

## Descripción
Componente de acordeón reutilizable para la aplicación de Medicina Tradicional China. Soporta animaciones suaves, persistencia de estado en localStorage, y diferentes tamaños para diferentes contextos.

## Características

### ✅ Implementadas
- **Título siempre visible**: El título se renderiza correctamente ya sea string o ReactNode
- **Estado persistente**: Opcionalmente guarda el estado (abierto/cerrado) en localStorage
- **Animaciones suaves**: Transiciones de altura con easing para apertura/cierre
- **Icono animado**: Chevron que rota al abrir/cerrar
- **Tamaños variables**: `large` para secciones principales, `small` para acordeones anidados
- **Iconos personalizados**: Soporte para iconos de React o SVG strings con color
- **Accesibilidad**: Atributos `aria-expanded` y `type="button"`
- **Compatible con SSR**: Chequeos de `typeof window !== 'undefined'`

## Props

```typescript
interface AccordionProps {
  title: string | React.ReactNode;  // Título del acordeón (siempre visible)
  children: React.ReactNode;        // Contenido interno
  defaultOpen?: boolean;            // Estado inicial (default: true)
  storageKey?: string;              // Key para persistencia en localStorage
  size?: 'large' | 'small';         // Tamaño (default: 'large')
  className?: string;               // Clases CSS adicionales
  icon?: React.ReactNode | { svg: string; color: string }; // Icono opcional
}
```

## Uso

### Básico
```tsx
import { Accordion } from './ui/Accordion';

<Accordion title="Properties">
  <div>Contenido aquí</div>
</Accordion>
```

### Con persistencia
```tsx
<Accordion 
  title="Clinical use" 
  defaultOpen={true}
  storageKey="herb-clinical-use-section"
  size="large"
>
  <div>Contenido aquí</div>
</Accordion>
```

### Con icono
```tsx
<Accordion
  title="Safety & alerts"
  defaultOpen={false}
  storageKey={`herb-${herb.herb_id}-antagonisms`}
  size="small"
  icon={getAlertIcon('antagonism')}
>
  <div>Contenido aquí</div>
</Accordion>
```

### Anidado (pequeño)
```tsx
<Accordion title="Main Section" size="large">
  <div className="space-y-4">
    <Accordion title="Subsection 1" size="small">
      <div>Contenido anidado</div>
    </Accordion>
    <Accordion title="Subsection 2" size="small">
      <div>Más contenido</div>
    </Accordion>
  </div>
</Accordion>
```

## Estilos

### Tamaños

**Large (default)**:
- Título: `text-2xl font-bold`
- Padding: `py-6` en móvil, `py-5` en desktop
- Chevron: `w-6 h-6`
- Uso: Secciones principales (Properties, Clinical use, Safety & alerts)

**Small**:
- Título: `text-lg font-semibold`
- Padding: `py-0` para evitar espacio extra en listas anidadas
- Chevron: `w-5 h-5`
- Uso: Subsecciones (TCM actions, Clinical indications, Dui Yao)

## Animaciones

- **Apertura/Cierre**: Transición suave de altura (200ms ease-out)
- **Chevron**: Rotación de 180° al abrir
- **Hover**: Opacidad reducida (70%) en el botón

## Persistencia

Cuando se proporciona `storageKey`:
1. Al montar, lee el estado de localStorage
2. Si no existe, usa `defaultOpen`
3. Al cambiar el estado, guarda en localStorage
4. Persist entre recargas y sesiones

## Compatibilidad

- ✅ React 18+
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ SSR/Next.js (con chequeos de window)
- ✅ Sistemas case-sensitive y case-insensitive

## Notas de Implementación

### Archivos Relacionados

- **Accordion.tsx** (mayúscula): Componente custom que se usa en toda la app
- **accordion.tsx** (minúscula): Wrapper de Radix UI (no se usa directamente)

### Imports

Siempre usar:
```tsx
import { Accordion } from './ui/Accordion';  // ✅ Correcto
```

No usar:
```tsx
import { Accordion } from './ui/accordion';  // ❌ Incorrecto
```

### Integración con HerbDetails y FormulaDetails

El componente está integrado y funcionando en:
- `/src/app/components/HerbDetails.tsx`
- `/src/app/components/FormulaDetails.tsx`

Todas las secciones de estos modales usan este componente con diferentes configuraciones.

## Solución de Problemas

### El título no se ve
✅ **Resuelto**: El componente ahora soporta `title` como prop explícita (string o ReactNode)

### Animación brusca
✅ **Resuelto**: Implementada animación de altura suave con transiciones CSS

### Estado no persiste
- Verificar que `storageKey` sea único para cada instancia
- Verificar que el navegador permita localStorage

### Conflictos de archivos
✅ **Resuelto**: Usar siempre `Accordion.tsx` (mayúscula) para imports

## Mejoras Futuras Posibles

- [ ] Soporte para grupos de acordeones (solo uno abierto a la vez)
- [ ] Callbacks onOpen/onClose
- [ ] Animación de fade para el contenido
- [ ] Versión controlada (controlled component)
- [ ] Más opciones de animación (duración, easing)

## Mantenimiento

Última actualización: Abril 2026
Mantenedor: Equipo de desarrollo TCM App
