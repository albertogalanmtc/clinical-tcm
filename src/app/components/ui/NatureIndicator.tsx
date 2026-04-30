import { cn } from "@/lib/utils";

interface NatureIndicatorProps {
  nature?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function NatureIndicator({ nature, showLabel = true, size = 'md', className }: NatureIndicatorProps) {
  // Return null if no nature provided
  if (!nature) return null;
  
  const getNatureStyles = (nature: string) => {
    const normalized = nature.toLowerCase();
    
    if (normalized.includes('very hot') || normalized === 'muy caliente') {
      return 'bg-red-400 text-white border-red-400';
    }
    if (normalized === 'hot' || normalized === 'caliente') {
      return 'bg-red-300 text-white border-red-300';
    }
    if (normalized === 'warm' || normalized === 'templado') {
      return 'bg-orange-300 text-white border-orange-300';
    }
    if (normalized === 'neutral' || normalized === 'neutro') {
      return 'bg-gray-300 text-white border-gray-300';
    }
    if (normalized === 'cool' || normalized === 'fresca') {
      return 'bg-blue-300 text-white border-blue-300';
    }
    if (normalized === 'cold' || normalized === 'fría') {
      return 'bg-blue-400 text-white border-blue-400';
    }
    if (normalized.includes('very cold') || normalized === 'muy fría') {
      return 'bg-blue-500 text-white border-blue-500';
    }
    
    return 'bg-gray-300 text-white border-gray-300';
  };

  return (
    <div className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      getNatureStyles(nature),
      className
    )}>
      {showLabel ? nature : null}
    </div>
  );
}