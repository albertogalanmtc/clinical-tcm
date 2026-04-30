import * as Dialog from '@radix-ui/react-dialog';
import { X, ChevronLeft, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategoriesByGroup, getCategoryKey, type SafetyCategory } from '@/app/data/safetyCategoriesManager';

interface PatientSafetyProfile {
  [key: string]: boolean;
}

interface GeneralConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientSafetyProfile: PatientSafetyProfile;
  onUpdateProfile: (profile: PatientSafetyProfile) => void;
}

export function GeneralConditionsModal({
  isOpen,
  onClose,
  patientSafetyProfile,
  onUpdateProfile
}: GeneralConditionsModalProps) {
  const [categories, setCategories] = useState<SafetyCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadedCategories = getCategoriesByGroup('conditions');
      // Sort alphabetically by displayName
      loadedCategories.sort((a, b) => a.displayName.localeCompare(b.displayName));
      setCategories(loadedCategories);
      setSearchQuery('');
    }
  }, [isOpen]);

  const selectedCount = categories.filter(c => {
    const key = getCategoryKey(c.displayName);
    return patientSafetyProfile[key] === true;
  }).length;

  const filteredCategories = categories.filter(c =>
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearAll = () => {
    const clearedProfile = { ...patientSafetyProfile };
    categories.forEach(c => {
      const key = getCategoryKey(c.displayName);
      clearedProfile[key] = false;
    });
    onUpdateProfile(clearedProfile);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
        <Dialog.Content
          className="fixed left-0 right-0 bottom-0 top-[10vh] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:w-full sm:max-w-md sm:max-h-[85vh] overflow-hidden z-50 flex flex-col"
          onPointerDownOutside={onClose}
        >
          <Dialog.Title className="sr-only">Select General Conditions</Dialog.Title>

          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors sm:hidden"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">General Conditions</h2>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conditions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                autoFocus
              />
            </div>

            {/* Quick actions */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-600">
                {selectedCount} selected
              </span>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-2">
              {filteredCategories.map(c => {
                const key = getCategoryKey(c.displayName);
                return (
                  <label key={key} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded">
                    <input
                      type="checkbox"
                      checked={patientSafetyProfile[key] ?? false}
                      onChange={(e) => onUpdateProfile({ ...patientSafetyProfile, [key]: e.target.checked })}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">{c.displayName}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                disabled={selectedCount === 0}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
              >
                Clear
              </button>
              <button
                onClick={onClose}
                disabled={selectedCount === 0}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
              >
                Apply
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}