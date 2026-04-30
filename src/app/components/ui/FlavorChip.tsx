import { cn } from "@/lib/utils";

interface FlavorChipProps {
  flavor: string;
  className?: string;
}

export function FlavorChip({ flavor, className }: FlavorChipProps) {
  const getFlavorColor = (flavor: string) => {
    const normalized = flavor.toLowerCase();
    
    if (normalized.includes('sweet')) return 'border-amber-500 text-amber-700';
    if (normalized.includes('bitter')) return 'border-red-600 text-red-700';
    if (normalized.includes('pungent') || normalized.includes('acrid')) return 'border-gray-500 text-gray-700';
    if (normalized.includes('salty')) return 'border-blue-600 text-blue-700';
    if (normalized.includes('sour')) return 'border-green-600 text-green-700';
    if (normalized.includes('bland')) return 'border-purple-600 text-purple-700';
    if (normalized.includes('aromatic')) return 'border-amber-700 text-amber-800';
    if (normalized.includes('astringent')) return 'border-purple-500 text-purple-700';
    
    return 'border-gray-400 text-gray-600';
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-white',
      getFlavorColor(flavor),
      className
    )}>
      {flavor}
    </span>
  );
}