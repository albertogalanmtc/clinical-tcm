import { useState, useEffect } from 'react';
import { X, Save, ExternalLink, FileText } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { addWelcomeMessage, updateWelcomeMessage, type WelcomeMessage } from '@/app/data/dashboardContent';
import { ContentVisibilitySettings, type VisibilitySettings } from './ContentVisibilitySettings';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface WelcomeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: WelcomeMessage | null;
  onSave: () => void;
}

export function WelcomeMessageModal({ isOpen, onClose, message, onSave }: WelcomeMessageModalProps) {
  const [title, setTitle] = useState(message?.title || '');
  const [content, setContent] = useState(message?.content || '');
  const [enabled, setEnabled] = useState(message?.enabled ?? true);
  const [highlighted, setHighlighted] = useState(message?.highlighted ?? false);
  const [dismissible, setDismissible] = useState(message?.dismissible ?? false);
  const [actionType, setActionType] = useState<'none' | 'link' | 'modal'>(
    message?.modalContent ? 'modal' : message?.link ? 'link' : 'none'
  );
  const [link, setLink] = useState(message?.link || '');
  const [modalTitle, setModalTitle] = useState(message?.modalContent?.title || '');
  const [modalContent, setModalContent] = useState(message?.modalContent?.content || '');
  const [visibilitySettings, setVisibilitySettings] = useState<VisibilitySettings>({
    countries: message?.countries || [],
    dateRange: message?.dateRange
  });
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const ui = {
    description: isSpanish ? 'Editar o crear un mensaje de bienvenida' : 'Edit or create a welcome message',
    title: message ? (isSpanish ? 'Editar mensaje de bienvenida' : 'Edit Welcome Message') : (isSpanish ? 'Añadir mensaje de bienvenida' : 'Add Welcome Message'),
    displayMessage: isSpanish ? 'Mostrar mensaje' : 'Display Message',
    displayHelp: isSpanish ? 'Mostrar este mensaje en el panel' : 'Show this message on dashboard',
    highlightMessage: isSpanish ? 'Destacar mensaje' : 'Highlight Message',
    highlightHelp: isSpanish ? 'Mostrar con fondo degradado verde' : 'Show with green gradient background',
    allowClose: isSpanish ? 'Permitir a los usuarios cerrarlo' : 'Allow Users to Close',
    allowCloseHelp: isSpanish ? 'Mostrar botón de cierre - los usuarios pueden descartar este mensaje' : 'Show close button - users can dismiss this message',
    titleLabel: isSpanish ? 'Título' : 'Title',
    titlePlaceholder: isSpanish ? 'Bienvenido a Clinical TCM' : 'Welcome to Clinical TCM',
    contentLabel: isSpanish ? 'Contenido' : 'Content',
    contentPlaceholder: isSpanish ? 'Tu plataforma completa para la práctica clínica de Medicina Tradicional China...' : 'Your comprehensive platform for Traditional Chinese Medicine clinical practice...',
    clickAction: isSpanish ? 'Acción al hacer clic' : 'Click Action',
    none: isSpanish ? 'Ninguna' : 'None',
    link: isSpanish ? 'Enlace' : 'Link',
    modal: isSpanish ? 'Modal' : 'Modal',
    linkLabel: isSpanish ? 'Enlace externo *' : 'External Link *',
    linkPlaceholder: 'https://example.com',
    linkHelp: isSpanish ? 'Al hacer clic en el mensaje se abrirá este enlace' : 'Clicking the message will open this link',
    modalTitleLabel: isSpanish ? 'Título del modal *' : 'Modal Title *',
    modalTitlePlaceholder: isSpanish ? 'Introduce el título del modal...' : 'Enter modal title...',
    modalContentLabel: isSpanish ? 'Contenido del modal *' : 'Modal Content *',
    modalContentPlaceholder: isSpanish ? 'Introduce el contenido del modal...' : 'Enter modal content...',
    visibilitySettings: isSpanish ? 'Ajustes de visibilidad' : 'Visibility Settings',
    cancel: isSpanish ? 'Cancelar' : 'Cancel',
    save: isSpanish ? 'Guardar' : 'Save',
    saveChanges: isSpanish ? 'Guardar cambios' : 'Save Changes',
    addMessage: isSpanish ? 'Añadir mensaje' : 'Add Message',
    titleOrContent: isSpanish ? 'Introduce al menos un título o contenido' : 'Please enter at least a title or content',
    linkUrl: isSpanish ? 'Introduce una URL de enlace' : 'Please enter a link URL',
    modalFields: isSpanish ? 'Introduce el título y el contenido del modal' : 'Please enter both modal title and content',
  };

  // Emit events for modal state changes (for hiding layout footers)
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modal-opened'));
    } else {
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }, [isOpen]);

  useEffect(() => {
    if (message) {
      setTitle(message.title);
      setContent(message.content);
      setEnabled(message.enabled);
      setHighlighted(message.highlighted ?? false);
      setDismissible(message.dismissible ?? false);
      setActionType(message.modalContent ? 'modal' : message.link ? 'link' : 'none');
      setLink(message.link || '');
      setModalTitle(message.modalContent?.title || '');
      setModalContent(message.modalContent?.content || '');
      setVisibilitySettings({
        countries: message.countries || [],
        dateRange: message.dateRange
      });
    } else {
      setTitle('');
      setContent('');
      setEnabled(true);
      setHighlighted(false);
      setDismissible(false);
      setActionType('none');
      setLink('');
      setModalTitle('');
      setModalContent('');
      setVisibilitySettings({ countries: [] });
    }
  }, [message, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() && !content.trim()) {
      toast.error(ui.titleOrContent);
      return;
    }

    if (actionType === 'link' && !link.trim()) {
      toast.error(ui.linkUrl);
      return;
    }

    if (actionType === 'modal' && (!modalTitle.trim() || !modalContent.trim())) {
      toast.error(ui.modalFields);
      return;
    }

    const messageData: Omit<WelcomeMessage, 'id' | 'order'> = {
      title: title.trim(),
      content: content.trim(),
      enabled,
      highlighted,
      dismissible,
      link: actionType === 'link' ? link.trim() : undefined,
      modalContent: actionType === 'modal' ? {
        title: modalTitle.trim(),
        content: modalContent.trim()
      } : undefined,
      countries: visibilitySettings.countries,
      dateRange: visibilitySettings.dateRange
    };

    if (message) {
      updateWelcomeMessage(message.id, messageData);
    } else {
      addWelcomeMessage(messageData);
    }

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
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Enabled Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">{ui.displayMessage}</p>
                <p className="text-xs text-gray-500 mt-1">{ui.displayHelp}</p>
              </div>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Highlighted Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">{ui.highlightMessage}</p>
                <p className="text-xs text-gray-500 mt-1">{ui.highlightHelp}</p>
              </div>
              <button
                type="button"
                onClick={() => setHighlighted(!highlighted)}
                className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                  highlighted ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    highlighted ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Dismissible Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">{ui.allowClose}</p>
                <p className="text-xs text-gray-500 mt-1">{ui.allowCloseHelp}</p>
              </div>
              <button
                type="button"
                onClick={() => setDismissible(!dismissible)}
                className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                  dismissible ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    dismissible ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                  }`}
                />
              </button>
            </div>

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
              />
            </div>

            {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                {ui.contentLabel}
                </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder={ui.contentPlaceholder}
              />
            </div>

            {/* Action Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                {ui.clickAction}
                </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('none')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    actionType === 'none'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <X className={`w-5 h-5 mx-auto mb-1 ${
                    actionType === 'none' ? 'text-teal-600' : 'text-gray-400'
                  }`} />
                  <div className="text-xs font-medium text-gray-900">{ui.none}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('link')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    actionType === 'link'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ExternalLink className={`w-5 h-5 mx-auto mb-1 ${
                    actionType === 'link' ? 'text-teal-600' : 'text-gray-400'
                  }`} />
                  <div className="text-xs font-medium text-gray-900">{ui.link}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('modal')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    actionType === 'modal'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className={`w-5 h-5 mx-auto mb-1 ${
                    actionType === 'modal' ? 'text-teal-600' : 'text-gray-400'
                  }`} />
                  <div className="text-xs font-medium text-gray-900">{ui.modal}</div>
                </button>
              </div>
            </div>

            {/* Conditional Fields based on Action Type */}
            {actionType === 'link' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ui.linkLabel}
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder={ui.linkPlaceholder}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {ui.linkHelp}
                </p>
              </div>
            )}

            {actionType === 'modal' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {ui.modalTitleLabel}
                  </label>
                  <input
                    type="text"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder={ui.modalTitlePlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {ui.modalContentLabel}
                  </label>
                  <textarea
                    value={modalContent}
                    onChange={(e) => setModalContent(e.target.value)}
                    placeholder={ui.modalContentPlaceholder}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>
              </>
            )}

            {/* Visibility Settings */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">{ui.visibilitySettings}</h3>
              <ContentVisibilitySettings
                settings={visibilitySettings}
                onChange={setVisibilitySettings}
              />
            </div>
            </div>

            {/* Footer with Actions */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {ui.cancel}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {message ? ui.saveChanges : ui.addMessage}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
