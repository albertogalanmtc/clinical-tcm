import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Herb } from '@/app/data/herbs';
import { Formula } from '@/app/data/formulas';

interface IngredientSelectorProps {
  herbs: Herb[];
  formulas?: Formula[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeIngredients?: string[];
}

export function IngredientSelector({
  herbs,
  formulas = [],
  value,
  onChange,
  placeholder = "Select or type herb/formula name...",
  excludeIngredients = []
}: IngredientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (isOpen && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const filteredHerbs = herbs.filter(herb =>
    herb.pinyin_name.toLowerCase().includes(searchText.toLowerCase()) && !excludeIngredients.includes(herb.pinyin_name)
  );

  const filteredFormulas = formulas.filter(formula =>
    formula.pinyin_name.toLowerCase().includes(searchText.toLowerCase()) && !excludeIngredients.includes(formula.pinyin_name)
  );

  const hasResults = filteredHerbs.length > 0 || filteredFormulas.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSearchText(newValue);
    setIsOpen(true);
  };

  const handleSelect = (name: string) => {
    onChange(name);
    setSearchText('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          setSearchText(value);
          setIsOpen(true);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        placeholder={placeholder}
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto w-full mt-1"
        >
          {!hasResults ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {herbs.length === 0 && formulas.length === 0 
                ? "No items available yet. Type to add manually."
                : `No results found. Press Enter to add "${searchText}" manually.`}
            </div>
          ) : (
            <>
              {filteredHerbs.map((herb) => (
                <div
                  key={herb.herb_id}
                  onClick={() => handleSelect(herb.pinyin_name)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-900 flex items-center justify-between"
                >
                  <span>{herb.pinyin_name}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Herb</span>
                </div>
              ))}
              {filteredFormulas.map((formula) => (
                <div
                  key={formula.formula_id}
                  onClick={() => handleSelect(formula.pinyin_name)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-900 flex items-center justify-between"
                >
                  <span>{formula.pinyin_name}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">Formula</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}