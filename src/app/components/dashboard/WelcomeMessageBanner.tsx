import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type WelcomeMessage } from '@/app/data/dashboardContent';
import { InfoSlideModal } from './InfoSlideModal';

interface WelcomeMessageBannerProps {
  message: WelcomeMessage;
  onDismiss?: (messageId: string) => void;
}

export function WelcomeMessageBanner({ message, onDismiss }: WelcomeMessageBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasAction = message.link || message.modalContent;
  const MessageContainer = message.link ? 'a' : hasAction ? 'button' : 'div';

  const baseClassName = `rounded-lg border p-6 sm:p-8 lg:p-12 text-center ${
    message.highlighted
      ? 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200'
      : 'bg-white border-gray-200'
  }`;

  const containerProps = message.link
    ? {
        href: message.link,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: `${baseClassName} transition-transform hover:scale-[1.02] cursor-pointer`
      }
    : message.modalContent
    ? {
        type: 'button' as const,
        onClick: () => setIsModalOpen(true),
        className: `${baseClassName} w-full transition-transform hover:scale-[1.02] cursor-pointer`
      }
    : {
        className: baseClassName
      };

  return (
    <>
      <div className="max-w-5xl mx-auto relative mb-6">
        <MessageContainer {...containerProps}>
          {message.title && (
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {message.title}
            </h1>
          )}
          {message.content && (
            <p className={`text-sm sm:text-base lg:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed ${message.title ? '' : 'mb-0'}`}>
              {message.content}
            </p>
          )}
        </MessageContainer>
        {message.dismissible && onDismiss && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDismiss(message.id);
            }}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close message"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {message.modalContent && (
        <InfoSlideModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={message.modalContent.title}
          content={message.modalContent.content}
        />
      )}
    </>
  );
}
