import * as Dialog from '@radix-ui/react-dialog';
import { X, Edit2, Trash2 } from 'lucide-react';
import { updateBanner, type Banner } from '@/app/data/banners';

interface BannerDetailModalProps {
  banner: Banner;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function BannerDetailModal({ banner, isOpen, onClose, onEdit, onDelete }: BannerDetailModalProps) {
  // Helper to convert URLs in text to clickable links
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 underline"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-3xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            Survey banner details and statistics
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Dialog.Title className="text-xl font-semibold text-gray-900 truncate">
                {banner.title}
              </Dialog.Title>
              <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                banner.displayMode === 'modal'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {banner.displayMode === 'modal' ? 'Modal' : 'Widget'}
              </span>
              <button
                onClick={() => {
                  updateBanner(banner.id, { enabled: !banner.enabled });
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 transition-colors ${
                  banner.enabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={banner.enabled ? 'Click to disable' : 'Click to enable'}
              >
                {banner.enabled ? 'active' : 'inactive'}
              </button>
            </div>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Image Preview */}
            {banner.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={banner.imageUrl}
                  alt="Banner preview"
                  className="w-full h-48 object-cover"
                  style={
                    banner.imagePosition
                      ? { objectPosition: `${banner.imagePosition.x}% ${banner.imagePosition.y}%` }
                      : undefined
                  }
                />
              </div>
            )}

            {/* Content Type Badge & Priority */}
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded text-sm font-medium ${
                banner.type === 'survey'
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {banner.type === 'survey' ? 'Survey' : 'Announcement'}
              </span>
              <span className={`px-3 py-1.5 rounded text-sm font-medium ${
                banner.priority === 'high'
                  ? 'bg-red-100 text-red-700'
                  : banner.priority === 'low'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                Priority: {banner.priority === 'high' ? 'High' : banner.priority === 'low' ? 'Low' : 'Normal'}
              </span>
            </div>

            {/* Priority Description */}
            {banner.priority === 'high' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  <strong>High Priority:</strong> This banner can bypass user cooldowns and will be shown even if the user recently interacted with another banner.
                </p>
              </div>
            )}
            {banner.priority === 'low' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>Low Priority:</strong> This banner will only be shown when no higher priority banners are active.
                </p>
              </div>
            )}

            {/* Questions (Survey type) */}
            {banner.type === 'survey' && banner.questions && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Questions ({banner.questions.length})
                </h3>
                <div className="space-y-4">
                  {banner.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-teal-600 text-white text-xs font-medium rounded">
                          Q{qIndex + 1}
                        </span>
                        <p className="text-gray-900 font-medium flex-1">{q.question}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {q.options.map((option, oIndex) => (
                          <span
                            key={oIndex}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-full border border-amber-200"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message (Announcement type) */}
            {banner.type === 'announcement' && banner.message && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Message</h3>
                <div className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {renderTextWithLinks(banner.message)}
                </div>
              </div>
            )}

            {/* Feedback Message */}
            {banner.feedbackMessage && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Response Message</h3>
                <div className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {banner.showCelebrationEmoji && <span className="text-xl mr-2">{banner.celebrationEmoji || '🎉'}</span>}
                  {renderTextWithLinks(banner.feedbackMessage)}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50">
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
