import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, Loader2 } from 'lucide-react';
import { dashboardMessagesService, type DashboardMessage } from '@/app/services/dashboardMessagesService';
import { toast } from 'sonner';

interface DashboardMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: DashboardMessage | null;
  onSave: () => void;
}

export function DashboardMessageModal({ isOpen, onClose, message, onSave }: DashboardMessageModalProps) {
  const [title, setTitle] = useState(message?.title || '');
  const [content, setContent] = useState(message?.content || '');
  const [highlighted, setHighlighted] = useState(message?.highlighted || false);
  const [closeable, setCloseable] = useState(message?.closeable || false);
  const [status, setStatus] = useState<'active' | 'inactive'>(message?.status || 'active');
  const [saving, setSaving] = useState(false);

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
      setHighlighted(message.highlighted);
      setCloseable(message.closeable);
      setStatus(message.status);
    } else {
      setTitle('');
      setContent('');
      setHighlighted(false);
      setCloseable(false);
      setStatus('active');
    }
  }, [message, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!title.trim() || !content.trim()) {
        toast.error('Please fill in title and content');
        setSaving(false);
        return;
      }

      const messageData = {
        title: title.trim(),
        content: content.trim(),
        highlighted,
        closeable,
        status
      };

      if (message) {
        await dashboardMessagesService.updateMessage(message.id, messageData);
        toast.success('Message updated successfully');
      } else {
        await dashboardMessagesService.createMessage(messageData);
        toast.success('Message created successfully');
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error('Failed to save message');
      console.error('Error saving message:', error);
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
            {message ? 'Edit dashboard message' : 'Create new dashboard message'}
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {message ? 'Edit Message' : 'Create Message'}
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
                  placeholder="Message title"
                  required
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
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  placeholder="Message content"
                  required
                />
              </div>

              {/* Highlighted */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highlighted}
                    onChange={(e) => setHighlighted(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Highlight Message
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Highlighted messages appear with a green background
                </p>
              </div>

              {/* Closeable */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={closeable}
                    onChange={(e) => setCloseable(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Allow users to close this message
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Users can dismiss closeable messages
                </p>
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
                {saving ? 'Saving...' : (message ? 'Update Message' : 'Create Message')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
