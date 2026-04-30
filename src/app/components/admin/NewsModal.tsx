import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { newsService, type NewsArticle } from '@/app/services/newsService';
import { toast } from 'sonner';

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
        toast.error('Please fill in title and content');
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
        toast.success('News updated successfully');
      } else {
        await newsService.createNews(newsData);
        toast.success('News created successfully');
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error('Failed to save news');
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
            {news ? 'Edit news article' : 'Add new news article'}
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {news ? 'Edit News' : 'Add News'}
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
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter news title"
                required
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Short summary for the list view"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Full news content"
                required
              />
            </div>

            {/* Date and Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Published Date
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
                  Author (optional)
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Author name"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'draft')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : (news ? 'Update News' : 'Add News')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
