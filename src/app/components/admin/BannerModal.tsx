import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, Loader2 } from 'lucide-react';
import { bannersService, type Banner } from '@/app/services/bannersService';
import { toast } from 'sonner';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: Banner | null;
  onSave: () => void;
}

export function BannerModal({ isOpen, onClose, banner, onSave }: BannerModalProps) {
  const [title, setTitle] = useState(banner?.title || '');
  const [content, setContent] = useState(banner?.content || '');
  const [linkUrl, setLinkUrl] = useState(banner?.link_url || '');
  const [linkText, setLinkText] = useState(banner?.link_text || '');
  const [startDate, setStartDate] = useState(banner?.start_date ? new Date(banner.start_date).toISOString().split('T')[0] : '');
  const [endDate, setEndDate] = useState(banner?.end_date ? new Date(banner.end_date).toISOString().split('T')[0] : '');
  const [status, setStatus] = useState<'active' | 'inactive'>(banner?.status || 'active');
  const [dismissible, setDismissible] = useState(banner?.dismissible ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modal-opened'));
    } else {
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }, [isOpen]);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setContent(banner.content || '');
      setLinkUrl(banner.link_url || '');
      setLinkText(banner.link_text || '');
      setStartDate(banner.start_date ? new Date(banner.start_date).toISOString().split('T')[0] : '');
      setEndDate(banner.end_date ? new Date(banner.end_date).toISOString().split('T')[0] : '');
      setStatus(banner.status);
      setDismissible(banner.dismissible);
    } else {
      setTitle('');
      setContent('');
      setLinkUrl('');
      setLinkText('');
      setStartDate('');
      setEndDate('');
      setStatus('active');
      setDismissible(true);
    }
  }, [banner, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!title.trim()) {
        toast.error('Please enter a title');
        setSaving(false);
        return;
      }

      const bannerData = {
        title: title.trim(),
        content: content.trim() || undefined,
        type: 'info' as const,
        link_url: linkUrl.trim() || undefined,
        link_text: linkText.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        status,
        dismissible
      };

      if (banner) {
        await bannersService.updateBanner(banner.id, bannerData);
        toast.success('Banner updated successfully');
      } else {
        await bannersService.createBanner(bannerData);
        toast.success('Banner created successfully');
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error('Failed to save banner');
      console.error('Error saving banner:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-2xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            {banner ? 'Edit banner' : 'Create new banner'}
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {banner ? 'Edit Banner' : 'Create Banner'}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

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
                  placeholder="Banner title"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (Optional)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  placeholder="Banner message or description"
                />
              </div>

              {/* Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Learn more"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">When to start showing this banner</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">When to stop showing this banner</p>
                </div>
              </div>

              {/* Dismissible */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="dismissible"
                  checked={dismissible}
                  onChange={(e) => setDismissible(e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="dismissible" className="text-sm font-medium text-gray-700">
                  Dismissible (users can close this banner)
                </label>
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
                {saving ? 'Saving...' : (banner ? 'Update Banner' : 'Create Banner')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
