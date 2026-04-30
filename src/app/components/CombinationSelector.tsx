import { useRef } from 'react';
import { X } from 'lucide-react';
import { Herb } from '@/app/data/herbs';
import { CombinationDropdown } from './CombinationDropdown';

interface CombinationSelectorProps {
  herbs: Herb[];
  combination: string[];
  onToggleHerb: (herbName: string) => void;
  searchText: string;
  onSearchChange: (value: string) => void;
  open: boolean;
  onToggleDropdown: () => void;
  size?: 'sm' | 'md';
}

export function CombinationSelector({
  herbs,
  combination,
  onToggleHerb,
  searchText,
  onSearchChange,
  open,
  onToggleDropdown,
  size = 'md'
}: CombinationSelectorProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const buttonClasses = size === 'sm'
    ? 'w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs text-left bg-white'
    : 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-left bg-white';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggleDropdown}
        className={buttonClasses}
      >
        {combination.length > 0 ? (
          <span className="text-gray-900">
            {combination.length} herb{combination.length > 1 ? 's' : ''} selected
          </span>
        ) : (
          <span className="text-gray-400">Select herbs...</span>
        )}
      </button>
      
      <CombinationDropdown
        isOpen={open}
        onClose={onToggleDropdown}
        buttonRef={buttonRef}
        herbs={herbs}
        selectedHerbs={combination}
        onToggleHerb={onToggleHerb}
        searchText={searchText}
        onSearchChange={onSearchChange}
      />
    </>
  );
}
