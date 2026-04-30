import { cn } from "@/lib/utils";

interface MeridianChipProps {
  meridian: string;
  className?: string;
}

export function MeridianChip({ meridian, className }: MeridianChipProps) {
  const getMeridianColor = (meridian: string) => {
    const normalized = meridian.toUpperCase();
    
    // Fuego (Fire) - rojo
    if (['HT', 'HEART', 'PC', 'PERICARDIUM', 'SJ', 'SAN JIAO', 'SI', 'SMALL INTESTINE'].some(m => normalized.includes(m))) {
      return 'border-red-500 text-red-700';
    }
    
    // Madera (Wood) - verde
    if (['LV', 'LIVER', 'GB', 'GALLBLADDER'].some(m => normalized.includes(m))) {
      return 'border-green-600 text-green-700';
    }
    
    // Tierra (Earth) - amarillo/dorado
    if (['SP', 'SPLEEN', 'ST', 'STOMACH'].some(m => normalized.includes(m))) {
      return 'border-amber-500 text-amber-700';
    }
    
    // Metal - gris
    if (['LU', 'LUNG', 'LI', 'LARGE INTESTINE'].some(m => normalized.includes(m))) {
      return 'border-gray-500 text-gray-700';
    }
    
    // Agua (Water) - azul
    if (['KI', 'KD', 'KIDNEY', 'BL', 'BLADDER', 'UB', 'URINARY BLADDER'].some(m => normalized.includes(m))) {
      return 'border-blue-600 text-blue-700';
    }
    
    return 'border-gray-400 text-gray-600';
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-white',
      getMeridianColor(meridian),
      className
    )}>
      {meridian}
    </span>
  );
}