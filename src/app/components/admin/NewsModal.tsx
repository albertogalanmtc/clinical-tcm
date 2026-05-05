import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { newsService, type NewsArticle } from '@/app/services/newsService';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  news?: NewsArticle | null;
  onSave: () => void;
}

export function NewsModal({ isOpen, onClose, news, onSave }: NewsModalProps) {
  const [title, setTitle] = useState(news?.title || '');
  const [summary, setSummary] = useState(news?.summary || '');
  const [content, setContent] = useState(news?.content || '');
  const [publishedAt, setPublishedAt] = useState(news?.published_at || new Date().toISOString().split('T')[0]);
  const [author, setAuthor] = useState(news?.author || '');
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>(news?.status || 'active');
  const [saving, setSaving] = useState(false);
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const ui = {
    description: isSpanish ? 'Editar o crear una noticia' : 'Edit or create a news article',
    title: news ? (isSpanish ? 'Editar noticia' : 'Edit News') : (isSpanish ? 'Añadir noticia' : 'Add News'),
    fillTitleContent: isSpanish ? 'Rellena el título y el contenido' : 'Please fill in title and content',
    titleLabel: isSpanish ? 'Título' : 'Title',
    summaryLabel: isSpanish ? 'Resumen' : 'Summary',
    contentLabel: isSpanish ? 'Contenido' : 'Content',
    publishedDate: isSpanish ? 'Fecha de publicación' : 'Published Date',
    authorLabel: isSpanish ? 'Autor (opcional)' : 'Author (optional)',
    statusLabel: isSpanish ? 'Estado' : 'Status',
    active: isSpanish ? 'Activo' : 'Active',
    inactive: isSpanish ? 'Inactivo' : 'Inactive',
    draft: isSpanish ? 'Borrador' : 'Draft',
    cancel: isSpanish ? 'Cancelar' : 'Cancel',
    saving: isSpanish ? 'Guardando...' : 'Saving...',
    update: isSpanish ? 'Actualizar noticia' : 'Update News',
    create: isSpanish ? 'Añadir noticia' : 'Add News',
    updated: isSpanish ? 'Noticia actualizada correctamente' : 'News updated successfully',
    created: isSpanish ? 'Noticia creada correctamente' : 'News created successfully',
    failed: isSpanish ? 'No se pudo guardar la noticia' : 'Failed to save news',
  };

  // Emit events for modal state changes
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modal-opened'));
    } else {
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }, [isOpen]);

  useEffect(() => {
    if (news) {
      setTitle(news.title);
      setSummary(news.summary || '');
      setContent(news.content || '');
      setPublishedAt(news.published_at || new Date().toISOString().split('T')[0]);
      setAuthor(news.author || '');
      setStatus(news.status);
    } else {
      setTitle('');
      setSummary('');
      setContent('');
      setPublishedAt(new Date().toISOString().split('T')[0]);
      setAuthor('');
      setStatus('active');
    }
  }, [news, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!title.trim() || !content.trim()) {
        toast.error(ui.fillTitleContent);
        return;
      }

      const newsData = {
        title: title.trim(),
        summary: summary.trim() || undefined,
        content: content.trim(),
        published_at: publishedAt || undefined,
        author: author.trim() || undefined,
        status
      };

      if (news) {
        await newsService.updateNews(news.id, newsData);
        toast.success(ui.updated);
      } else {
        await newsService.createNews(newsData);
        toast.success(ui.created);
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error(ui.failed);
    } finally {
      setSaving(false);
    }
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
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {ui.title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                {ui.titleLabel} <span className="text-red-500">*</span>
                </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={isSpanish ? 'Introduce el título de la noticia' : 'Enter news title'}
                required
              />
            </div>

            {/* Summary */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                {ui.summaryLabel}
                </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder={isSpanish ? 'Resumen breve para la vista de lista' : 'Short summary for the list view'}
              />
            </div>

            {/* Content */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                {ui.contentLabel} <span className="text-red-500">*</span>
                </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder={isSpanish ? 'Contenido completo de la noticia' : 'Full news content'}
                required
              />
            </div>

            {/* Date and Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ui.publishedDate}
                </label>
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ui.authorLabel}
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder={isSpanish ? 'Nombre del autor' : 'Author name'}
                />
              </div>
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                {ui.statusLabel}
                </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'draft')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="active">{ui.active}</option>
                <option value="inactive">{ui.inactive}</option>
                <option value="draft">{ui.draft}</option>
              </select>
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
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? ui.saving : (news ? ui.update : ui.create)}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
