import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar, User } from 'lucide-react';
import type { NewsArticle } from '@/app/services/newsService';

interface NewsDetailModalProps {
  news: NewsArticle;
  isOpen: boolean;
  onClose: () => void;
}

export function NewsDetailModal({ news, isOpen, onClose }: NewsDetailModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-3xl w-full sm:max-h-[90vh] overflow-hidden z-[100] flex flex-col">
          <Dialog.Description className="sr-only">
            News article details
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900 line-clamp-1 flex-1">
              {news.title}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {news.published_at && new Date(news.published_at).toLocaleDateString('en-US', {
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
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {news.content}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
