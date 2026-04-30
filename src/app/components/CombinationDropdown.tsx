import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Herb } from '@/app/data/herbs';

interface CombinationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  herbs: Herb[];
  selectedHerbs: string[];
  onToggleHerb: (herbName: string) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
}

export function CombinationDropdown({
  isOpen,
  onClose,
  buttonRef,
  herbs,
  selectedHerbs,
  onToggleHerb,
  searchText,
  onSearchChange
}: CombinationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  const filteredHerbs = herbs.filter(herb =>
    !searchText || herb.pinyin_name.toLowerCase().includes(searchText.toLowerCase())
  );

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`
      }}
    >
      <div className="px-3 py-2 sticky top-0 bg-white border-b border-gray-200">
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          placeholder="Search herbs..."
          autoFocus
        />
      </div>
      {herbs.length === 0 ? (
        <div className="px-3 py-2 text-sm text-gray-500">
          No herbs available yet
        </div>
      ) : filteredHerbs.length === 0 ? (
        <div className="px-3 py-2 text-sm text-gray-500">
          No herbs found
        </div>
      ) : (
        filteredHerbs.map((herb) => (
          <label
            key={herb.herb_id}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedHerbs.includes(herb.pinyin_name)}
              onChange={() => onToggleHerb(herb.pinyin_name)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-900">{herb.pinyin_name}</span>
          </label>
        ))
      )}
    </div>,
    document.body
  );
}
