import * as Dialog from '@radix-ui/react-dialog';
import { X, Edit2, Trash2, Calendar, User } from 'lucide-react';
import { updateNews, type NewsItem } from '@/app/data/newsContent';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface NewsDetailModalProps {
  news: NewsItem;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function NewsDetailModal({ news, isOpen, onClose, onEdit, onDelete }: NewsDetailModalProps) {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const ui = {
    description: isSpanish ? 'Detalles de la noticia' : 'News article details',
    active: isSpanish ? 'activo' : 'active',
    inactive: isSpanish ? 'inactivo' : 'inactive',
    clickDisable: isSpanish ? 'Pulsa para desactivar' : 'Click to disable',
    clickEnable: isSpanish ? 'Pulsa para activar' : 'Click to enable',
    close: isSpanish ? 'Cerrar' : 'Close',
    delete: isSpanish ? 'Eliminar' : 'Delete',
    edit: isSpanish ? 'Editar' : 'Edit',
  };
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-3xl w-full sm:max-h-[90vh] overflow-hidden z-[100] flex flex-col">
          <Dialog.Description className="sr-only">
            {ui.description}
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Dialog.Title className="text-xl font-semibold text-gray-900 truncate">
                {news.title}
              </Dialog.Title>
              <button
                onClick={() => {
                  updateNews(news.id, { enabled: !news.enabled });
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 transition-colors ${
                  news.enabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={news.enabled ? ui.clickDisable : ui.clickEnable}
              >
                {news.enabled ? ui.active : ui.inactive}
              </button>
            </div>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100" aria-label={ui.close}>
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(news.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              {news.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {news.author}
                </div>
              )}
            </div>

            {/* Summary */}
            {news.summary && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm font-medium text-teal-900">
                  {news.summary}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap">
                {news.content}
              </div>
            </div>
          </div>

          {/* Footer with Actions */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {ui.delete}
            </button>
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              {ui.edit}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
