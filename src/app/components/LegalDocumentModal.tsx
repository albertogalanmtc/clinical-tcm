import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText } from 'lucide-react';
import { useEffect } from 'react';
import type { LegalDocument } from '../data/platformSettings';

interface LegalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument | null;
}

export function LegalDocumentModal({ isOpen, onClose, document }: LegalDocumentModalProps) {
  // Emit events for modal state changes (for hiding layout footers)
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modal-opened'));
    } else {
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }, [isOpen]);

  if (!document) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-0 right-0 bottom-0 top-[10vh] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:w-full sm:max-w-3xl sm:max-h-[85vh] overflow-hidden z-[80] flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-start gap-2 px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-xl font-bold text-gray-900 mb-1">
                {document.title}
              </Dialog.Title>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(document.lastUpdated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {document.content}
              </div>
            </div>
          </div>

          {/* Footer - Close button on mobile */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 sm:hidden">
            <Dialog.Close className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
              Close
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}