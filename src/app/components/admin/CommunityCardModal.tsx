import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { getCommunityCard, updateCommunityCard } from '@/app/data/dashboardContent';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface CommunityCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function CommunityCardModal({ isOpen, onClose, onSave }: CommunityCardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const ui = {
    description: isSpanish ? 'Configurar la tarjeta de comunidad' : 'Configure community card settings',
    title: isSpanish ? 'Configurar tarjeta de comunidad' : 'Configure Community Card',
    titleLabel: isSpanish ? 'Título' : 'Title',
    titlePlaceholder: isSpanish ? 'Únete a nuestra comunidad' : 'Join Our Community',
    descriptionLabel: isSpanish ? 'Descripción' : 'Description',
    descriptionPlaceholder: isSpanish ? 'Conecta con otros profesionales...' : 'Connect with fellow practitioners...',
    buttonTextLabel: isSpanish ? 'Texto del botón' : 'Button Text',
    buttonTextPlaceholder: isSpanish ? 'Únete en Patreon' : 'Join on Patreon',
    externalUrlLabel: isSpanish ? 'URL externa (opcional)' : 'External URL (optional)',
    externalUrlPlaceholder: 'https://patreon.com/your-page',
    externalUrlHelp: isSpanish ? 'Déjalo vacío para mostrar la tarjeta sin enlace clicable' : 'Leave empty to display the card without a clickable link',
    cancel: isSpanish ? 'Cancelar' : 'Cancel',
    save: isSpanish ? 'Guardar cambios' : 'Save Changes',
  };

  useEffect(() => {
    if (isOpen) {
      const communityCard = getCommunityCard();
      if (communityCard) {
        setTitle(communityCard.title);
        setDescription(communityCard.description);
        setButtonText(communityCard.buttonText);
        setExternalUrl(communityCard.externalUrl || '');
      }
    }
  }, [isOpen]);

  // Emit events for modal state changes (for hiding layout footers)
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modal-opened'));
    } else {
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateCommunityCard({
      title: title.trim(),
      description: description.trim(),
      buttonText: buttonText.trim(),
      externalUrl: externalUrl.trim() || undefined
    });

    onSave();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-2xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            {ui.description}
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {ui.title}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {ui.titleLabel}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={ui.titlePlaceholder}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {ui.descriptionLabel}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder={ui.descriptionPlaceholder}
                    required
                  />
                </div>

                {/* Button Text */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {ui.buttonTextLabel}
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={ui.buttonTextPlaceholder}
                    required
                  />
                </div>

                {/* External URL */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {ui.externalUrlLabel}
                  </label>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={ui.externalUrlPlaceholder}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {ui.externalUrlHelp}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-gray-50 transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  {ui.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  {ui.save}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
