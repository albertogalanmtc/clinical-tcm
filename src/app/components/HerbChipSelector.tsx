import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Herb } from '@/app/data/herbs';

// Generic item type for herbs and formulas
interface SelectableItem {
  id: string;
  name: string;
}

interface HerbChipSelectorProps {
  herbs: Herb[];
  selectedHerbs: string[];
  onToggleHerb: (herbName: string) => void;
  chipColor: 'green' | 'red';
  label: string;
  allowCustomInput?: boolean;
  // New props for generic items (herbs + formulas)
  items?: SelectableItem[];
}

export function HerbChipSelector({
  herbs,
  selectedHerbs,
  onToggleHerb,
  chipColor,
  label,
  allowCustomInput = true,
  items
}: HerbChipSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Use items if provided, otherwise convert herbs to items
  const allItems: SelectableItem[] = items || herbs.map(h => ({ id: h.herb_id, name: h.pinyin_name }));

  const filteredItems = allItems.filter(item =>
    searchText === '' || item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddManual = () => {
    if (manualInput.trim() && !selectedHerbs.includes(manualInput.trim())) {
      onToggleHerb(manualInput.trim());
      setManualInput('');
      setSearchText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddManual();
    }
  };

  const chipStyles = chipColor === 'green'
    ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
    : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <div className="flex flex-wrap gap-2 mb-2">
        {selectedHerbs.map((herb, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onToggleHerb(herb)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors border ${chipStyles}`}
          >
            {herb}
            <X className="w-3 h-3" />
          </button>
        ))}
      </div>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchText('');
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-left bg-white text-gray-400"
      >
        Select or type herb name...
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto w-full mt-1"
        >
          <div className="px-3 py-2 sticky top-0 bg-white border-b border-gray-200 space-y-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              placeholder="Search from library..."
              autoFocus
            />
            {allowCustomInput && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  placeholder="Or type custom herb..."
                />
                <button
                  type="button"
                  onClick={handleAddManual}
                  disabled={!manualInput.trim()}
                  className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {allItems.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No items in library. Use custom input above.
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No items found. Use custom input above.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedHerbs.includes(item.name);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onToggleHerb(item.name);
                    setSearchText('');
                  }}
                  className={`px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm ${
                    isSelected ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-900'
                  }`}
                >
                  {item.name}
                  {isSelected && <span className="ml-2 text-xs">✓</span>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}