import { Search, X, Star } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showFavoriteButton?: boolean;
  onFavoriteClick?: () => void;
  isFavoriteActive?: boolean;
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className,
  showFavoriteButton = false,
  onFavoriteClick,
  isFavoriteActive = false
}: SearchBarProps) {
  return (
    <div className={cn('relative flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] sm:w-5 sm:h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 sm:h-11 pl-10 pr-10 sm:pl-10 sm:pr-10 text-sm sm:text-base bg-white border border-gray-200 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-end"
            aria-label="Clear search"
          >
            <X className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
          </button>
        )}
      </div>
      
      {showFavoriteButton && (
        <button
          onClick={onFavoriteClick}
          className="p-2 flex items-center"
          title="Toggle favorites"
        >
          <Star className={`w-5 h-5 ${isFavoriteActive ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
        </button>
      )}
    </div>
  );
}