import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { submitBannerResponse, recordBannerDismissed, type Banner } from '@/app/data/banners';
import { getCurrentUser } from '@/app/data/communityPosts';

interface BannerModalDisplayProps {
  banner: Banner;
  onClose: () => void;
}

export function BannerModalDisplay({ banner, onClose }: BannerModalDisplayProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [freeTextAnswer, setFreeTextAnswer] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

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

  const handleNext = () => {
    if (!banner.questions) return;

    // Determine the answer: if custom option selected, use free text, otherwise use selected option
    const answerToSubmit = selectedAnswer === '__custom__'
      ? freeTextAnswer.trim()
      : selectedAnswer;

    if (!answerToSubmit) return;

    const newAnswers = [...answers, answerToSubmit];
    setAnswers(newAnswers);
    setSelectedAnswer(null);
    setFreeTextAnswer('');

    // Check if this was the last question
    if (currentQuestionIndex === banner.questions.length - 1) {
      // Submit all answers
      const user = getCurrentUser();
      submitBannerResponse(banner.id, user.id, newAnswers);
      setSubmitted(true);

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleAnnouncementDismiss = () => {
    const user = getCurrentUser();

    // If there's a feedback message, show it first
    if (banner.feedbackMessage) {
      // Mark as completed (answered)
      submitBannerResponse(banner.id, user.id, ['acknowledged']);
      setSubmitted(true);
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      // No feedback message, just dismiss for today
      recordBannerDismissed(banner.id, user.id);
      onClose();
    }
  };

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden z-[101] animate-in fade-in zoom-in-95 duration-200">
          <Dialog.Description className="sr-only">
            Survey banner
          </Dialog.Description>

          {/* Image (if exists) - full width, no margins - Only shown during survey, not on thank you message */}
          {banner.imageUrl && !submitted && (
            <div className="w-full h-48 sm:h-64 overflow-hidden">
              <img
                src={banner.imageUrl}
                alt="Survey banner"
                className="w-full h-full object-cover"
                style={
                  banner.imagePosition
                    ? { objectPosition: `${banner.imagePosition.x}% ${banner.imagePosition.y}%` }
                    : undefined
                }
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Close button - hide when showing thank you message */}
            {!submitted && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {submitted ? (
              // Thank you message (for both surveys and announcements)
              <div className="text-center py-6">
                {banner.showCelebrationEmoji && (
                  <div className="text-5xl mb-4">{banner.celebrationEmoji || '🎉'}</div>
                )}
                {banner.feedbackMessage ? (
                  <p className="text-gray-600">
                    {renderTextWithLinks(banner.feedbackMessage)}
                  </p>
                ) : (
                  <p className="text-gray-600">Thank you for your feedback!</p>
                )}
              </div>
            ) : banner.type === 'announcement' ? (
              // Announcement message
              <div>
                <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4 pr-8">
                  {banner.title}
                </Dialog.Title>
                <p className="text-gray-600 mb-6">
                  {renderTextWithLinks(banner.message || '')}
                </p>
                <button
                  onClick={handleAnnouncementDismiss}
                  className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  Got it
                </button>
              </div>
            ) : (
              // Survey form
              <div>
                {/* Progress indicator */}
                {banner.questions && banner.questions.length > 1 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>Question {currentQuestionIndex + 1} of {banner.questions.length}</span>
                      <span>{Math.round(((currentQuestionIndex + 1) / banner.questions.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / banner.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Current Question */}
                <Dialog.Title className="text-xl font-semibold text-gray-900 mb-6 pr-8">
                  {banner.questions && banner.questions[currentQuestionIndex]?.question}
                </Dialog.Title>

                {/* Options - Radio buttons stacked vertically */}
                <div className="space-y-3 mb-6">
                  {banner.questions && banner.questions[currentQuestionIndex]?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedAnswer(option);
                        setFreeTextAnswer('');
                      }}
                      className={`w-full flex items-start gap-3 p-4 rounded-lg border transition-all text-left ${
                        selectedAnswer === option
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Radio circle */}
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition-all ${
                          selectedAnswer === option
                            ? 'border-teal-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedAnswer === option && (
                          <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                        )}
                      </div>

                      {/* Option text */}
                      <span className="flex-1 text-gray-900">
                        {option}
                      </span>
                    </button>
                  ))}

                  {/* Free text option - shown if allowFreeText is enabled */}
                  {banner.questions && banner.questions[currentQuestionIndex]?.allowFreeText && (
                    <div
                      onClick={() => setSelectedAnswer('__custom__')}
                      className={`w-full flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedAnswer === '__custom__'
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Radio circle */}
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition-all ${
                          selectedAnswer === '__custom__'
                            ? 'border-teal-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedAnswer === '__custom__' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                        )}
                      </div>

                      {/* Input text */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={freeTextAnswer}
                          onChange={(e) => {
                            setFreeTextAnswer(e.target.value);
                            setSelectedAnswer('__custom__');
                          }}
                          onFocus={() => setSelectedAnswer('__custom__')}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Other (please specify)..."
                          className="w-full px-3 py-2 border-0 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Next/Submit button */}
                <button
                  onClick={handleNext}
                  disabled={!selectedAnswer || (selectedAnswer === '__custom__' && !freeTextAnswer.trim())}
                  className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {banner.questions && currentQuestionIndex === banner.questions.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
