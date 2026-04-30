import { cn } from "@/lib/utils";

interface ThermalActionIndicatorProps {
  thermalAction?: string;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

export function ThermalActionIndicator({ thermalAction, showLabel = true, size = 'md' }: ThermalActionIndicatorProps) {
  // Return null if no thermal action provided
  if (!thermalAction) return null;
  
  const getThermalActionStyles = (action: string) => {
    const normalized = action.toLowerCase();

    if (normalized.includes('very hot') || normalized === 'muy caliente') {
      return 'bg-red-400 text-white';
    }
    if (normalized === 'hot' || normalized === 'caliente') {
      return 'bg-red-300 text-white';
    }
    if (normalized === 'warm' || normalized === 'templado' || normalized === 'warming') {
      return 'bg-orange-300 text-white';
    }
    if (normalized.includes('slightly warm')) {
      return 'bg-orange-200 text-white';
    }
    if (normalized === 'neutral' || normalized === 'neutro') {
      return 'bg-gray-300 text-white';
    }
    if (normalized === 'cool' || normalized === 'fresca' || normalized === 'cooling') {
      return 'bg-blue-300 text-white';
    }
    if (normalized.includes('slightly cold')) {
      return 'bg-blue-300 text-white';
    }
    if (normalized === 'cold' || normalized === 'fría') {
      return 'bg-blue-400 text-white';
    }
    if (normalized.includes('very cold') || normalized === 'muy fría') {
      return 'bg-blue-500 text-white';
    }

    return 'bg-gray-300 text-white';
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs'
  };

  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-medium',
      getThermalActionStyles(thermalAction),
      sizeClasses[size]
    )}>
      {showLabel ? thermalAction : null}
    </div>
  );
}