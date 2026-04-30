import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { Herb } from '../data/herbs';

export function HerbJsonEditorModal({ 
  herb, 
  onClose,
  onSave 
}: { 
  herb: Herb; 
  onClose: () => void;
  onSave: (updatedHerb: Herb) => void;
}) {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(herb, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      
      // Basic validation
      if (!parsed.herb_id || !parsed.pinyin_name) {
        setError('Required fields missing: herb_id and pinyin_name are required');
        return;
      }

      setError(null);
      onSave(parsed as Herb);
      onClose();
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
    }
  };

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-4xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            JSON editor for {herb.pinyin_name} herb data
          </Dialog.Description>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    Edit Herb JSON: {herb.pinyin_name}
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-600 mt-1">
                    Modify the herb data in JSON format. Changes will be saved to the library.
                  </Dialog.Description>
                </div>
                <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Validation Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setError(null);
                }}
                className="w-full h-[calc(90vh-240px)] font-mono text-sm p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                spellCheck={false}
              />
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Herb ID:</span> {herb.herb_id}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}