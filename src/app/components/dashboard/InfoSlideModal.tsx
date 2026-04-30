import { X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

// Type definition
interface HeroSlide {
  id: string;
  imageUrl: string;
  linkType: 'external' | 'internal';
  externalUrl?: string;
  internalContent?: {
    title: string;
    content: string;
  };
  status: 'active' | 'inactive';
  order: number;
}

interface InfoSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: HeroSlide | null;
}

export function InfoSlideModal({ isOpen, onClose, slide }: InfoSlideModalProps) {
  if (!slide || slide.linkType !== 'internal' || !slide.internalContent) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-3xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            Information slide content
          </Dialog.Description>
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-2xl font-semibold text-gray-900">
              {slide.internalContent.title}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
              <X className="w-6 h-6" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {slide.internalContent.content}
              </p>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
