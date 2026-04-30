import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import { normalizeForSearch } from '@/app/utils/searchUtils';

interface BioactiveCompoundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCompounds: Record<string, string[]>;
  selectedCompounds: Record<string, string[]>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  expandedClasses: string[];
  onToggleClass: (chemicalClass: string) => void;
  onToggleCompound: (chemicalClass: string, compound: string) => void;
  onToggleAllClassCompounds: (chemicalClass: string, compounds: string[]) => void;
  onClearAll: () => void;
  viewMode: 'categories' | 'all';
  onViewModeChange: (mode: 'categories' | 'all') => void;
}

export function BioactiveCompoundsModal({
  isOpen,
  onClose,
  availableCompounds,
  selectedCompounds,
  searchQuery,
  onSearchChange,
  expandedClasses,
  onToggleClass,
  onToggleCompound,
  onToggleAllClassCompounds,
  onClearAll,
  viewMode,
  onViewModeChange
}: BioactiveCompoundsModalProps) {
  const selectedCount = Object.values(selectedCompounds).reduce((acc, compounds) => acc + compounds.length, 0);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
        <Dialog.Content
          className="fixed left-0 right-0 bottom-0 top-[10vh] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:w-full sm:max-w-md sm:max-h-[85vh] overflow-hidden z-50 flex flex-col"
          onPointerDownOutside={onClose}
        >
          <Dialog.Title className="sr-only">Select Bioactive Compounds</Dialog.Title>

          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">Bioactive Compounds</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search chemical classes or compounds..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                autoFocus
              />
            </div>

            {/* Quick actions */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-600">
                {selectedCount} selected
              </span>
              
              {/* View mode toggle */}
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => onViewModeChange('categories')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'categories'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Categories
                </button>
                <button
                  onClick={() => onViewModeChange('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {viewMode === 'categories' ? (
              <div className="space-y-2">
                {(() => {
                  const searchLower = normalizeForSearch(searchQuery);
                  
                  return Object.entries(availableCompounds).map(([chemicalClass, compounds]) => {
                    // Filter compounds based on search
                    const filteredCompounds = compounds.filter(compound =>
                      normalizeForSearch(chemicalClass).includes(searchLower) ||
                      normalizeForSearch(compound).includes(searchLower)
                    );

                    if (filteredCompounds.length === 0) return null;

                    const isClassExpanded = expandedClasses.includes(chemicalClass);
                    const classSelections = selectedCompounds[chemicalClass] || [];
                    const classCount = classSelections.length;

                    return (
                      <div key={chemicalClass} className="border-b border-gray-100 last:border-b-0">
                        {/* Chemical Class Header */}
                        <div className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors">
                          {/* Checkbox for select all */}
                          <input
                            type="checkbox"
                            checked={classCount === filteredCompounds.length && classCount > 0}
                            ref={(el) => {
                              if (el) {
                                el.indeterminate = classCount > 0 && classCount < filteredCompounds.length;
                              }
                            }}
                            onChange={() => onToggleAllClassCompounds(chemicalClass, filteredCompounds)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            title="Select all compounds in this class"
                          />
                          
                          {/* Expandable header */}
                          <div
                            onClick={() => onToggleClass(chemicalClass)}
                            className="flex-1 flex items-center justify-between text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{chemicalClass}</span>
                              {classCount > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                  {classCount}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {isClassExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronUp className="w-4 h-4 text-gray-400 transform rotate-180" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Compound List */}
                        {isClassExpanded && (
                          <div className="bg-white">
                            {filteredCompounds.map(compound => (
                              <label key={compound} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 ml-6 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={classSelections.includes(compound)}
                                  onChange={() => onToggleCompound(chemicalClass, compound)}
                                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">{compound}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="space-y-1">
                {(() => {
                  const searchLower = normalizeForSearch(searchQuery);
                  
                  return Object.entries(availableCompounds).flatMap(([chemicalClass, compounds]) =>
                    compounds
                      .filter(compound =>
                        normalizeForSearch(chemicalClass).includes(searchLower) ||
                        normalizeForSearch(compound).includes(searchLower)
                      )
                      .map(compound => {
                        const classSelections = selectedCompounds[chemicalClass] || [];
                        const isSelected = classSelections.includes(compound);

                        return (
                          <label
                            key={`${chemicalClass}-${compound}`}
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleCompound(chemicalClass, compound)}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">{compound}</span>
                          </label>
                        );
                      })
                  );
                })()}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Apply
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}