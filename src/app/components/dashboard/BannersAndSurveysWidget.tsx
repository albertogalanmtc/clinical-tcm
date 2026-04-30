import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { bannersService, type Banner } from '@/app/services/bannersService';
import { surveysService, type Survey } from '@/app/services/surveysService';
import { useUser } from '@/app/contexts/UserContext';

type ContentItem =
  | { type: 'banner'; data: Banner; created_at: string }
  | { type: 'survey'; data: Survey; created_at: string };

export function BannersAndSurveysWidget() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [dismissedItems, setDismissedItems] = useState<Set<string>>(new Set());
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string[]>>({});
  const [submittedSurveys, setSubmittedSurveys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);

    // Fetch both banners and surveys
    const [banners, surveys] = await Promise.all([
      bannersService.getActiveBanners(),
      surveysService.getActiveSurveys()
    ]);

    // Load dismissed/responded from localStorage for non-Supabase users
    const dismissedBanners = JSON.parse(localStorage.getItem('dismissedBanners') || '[]');
    const respondedSurveys = JSON.parse(localStorage.getItem('respondedSurveys') || '[]');

    const allItems: ContentItem[] = [];

    // Add banners
    for (const banner of banners) {
      // Check if user dismissed this banner
      if (user?.id) {
        try {
          const hasDismissed = await bannersService.hasUserDismissedBanner(banner.id, user.id);
          if (hasDismissed) {
            console.log(`Banner ${banner.id} already dismissed by user`);
            continue;
          }
        } catch (error) {
          console.log('Banner dismissals check failed:', error);
        }
      } else {
        // Check localStorage for non-Supabase users
        if (dismissedBanners.includes(banner.id)) {
          console.log(`Banner ${banner.id} already dismissed (localStorage)`);
          continue;
        }
      }

      allItems.push({
        type: 'banner',
        data: banner,
        created_at: banner.created_at
      });
    }

    // Add surveys
    for (const survey of surveys) {
      // Check if user has responded
      if (user?.id) {
        try {
          const hasResponded = await surveysService.hasUserResponded(survey.id, user.id);
          if (hasResponded) {
            continue;
          }
        } catch (error) {
          console.log('Survey responses check failed:', error);
        }
      } else {
        // Check localStorage for non-Supabase users
        if (respondedSurveys.includes(survey.id)) {
          continue;
        }
      }

      allItems.push({
        type: 'survey',
        data: survey,
        created_at: survey.created_at
      });
    }

    // Sort by display_order (banners and surveys together)
    allItems.sort((a, b) => {
      const orderA = a.data.display_order ?? 999;
      const orderB = b.data.display_order ?? 999;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // If same order, sort by created_at (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setItems(allItems);
    setLoading(false);
  };

  const handleTemporaryDismiss = (id: string) => {
    setDismissedItems(prev => new Set([...prev, id]));
  };

  const handleBannerPermanentDismiss = async (banner: Banner) => {
    if (user?.id) {
      try {
        const success = await bannersService.dismissBanner(banner.id, user.id);
        if (success) {
          console.log('✅ Banner dismissed and saved to database');
          toast.success('Got it! You won\'t see this banner again');
        } else {
          toast.error('Failed to save. Please try again.');
          return;
        }
      } catch (error) {
        console.error('Could not save dismissal:', error);
        toast.error('Failed to save. Please try again.');
        return;
      }
    } else {
      // For users without Supabase account, save dismissal to localStorage
      const dismissed = JSON.parse(localStorage.getItem('dismissedBanners') || '[]');
      dismissed.push(banner.id);
      localStorage.setItem('dismissedBanners', JSON.stringify(dismissed));
      toast.success('Got it!');
    }
    // Dismiss locally
    setDismissedItems(prev => new Set([...prev, banner.id]));
  };

  const handleSurveySubmit = async (survey: Survey) => {
    const answers = surveyAnswers[survey.id] || [];

    // Validate all questions are answered
    if (answers.some((a, i) => !a || a.trim() === '')) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    if (user?.id) {
      // User logged in with Supabase - save to database
      try {
        const success = await surveysService.submitResponse(survey.id, user.id, answers);
        if (success) {
          console.log('✅ Survey response saved to database');
          // Mark survey as submitted (show thank you message)
          setSubmittedSurveys(prev => new Set([...prev, survey.id]));
        } else {
          toast.error('Failed to submit survey. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting survey:', error);
        toast.error('Failed to submit survey. Please try again.');
      }
    } else {
      // For users without Supabase account, save to localStorage
      const responded = JSON.parse(localStorage.getItem('respondedSurveys') || '[]');
      responded.push(survey.id);
      localStorage.setItem('respondedSurveys', JSON.stringify(responded));
      // Mark survey as submitted (show thank you message)
      setSubmittedSurveys(prev => new Set([...prev, survey.id]));
    }
  };

  if (loading) {
    return null;
  }

  // Get only the first visible banner and first visible survey
  const visibleBanners = items.filter(item => item.type === 'banner' && !dismissedItems.has(item.data.id));
  const visibleSurveys = items.filter(item => item.type === 'survey' && !dismissedItems.has(item.data.id));

  const firstBanner = visibleBanners[0];
  const firstSurvey = visibleSurveys[0];

  // Only show if we have at least one banner or survey
  if (!firstBanner && !firstSurvey) {
    return null;
  }

  const itemsToShow = [];
  if (firstBanner) itemsToShow.push(firstBanner);
  if (firstSurvey) itemsToShow.push(firstSurvey);

  return (
    <>
      {itemsToShow.map(item => {
        if (item.type === 'banner') {
          const banner = item.data;
          return (
            <div key={`banner-${banner.id}`} className="max-w-5xl mx-auto mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 relative animate-in fade-in slide-in-from-top-4 duration-500">
                {banner.dismissible && (
                  <button
                    onClick={() => handleTemporaryDismiss(banner.id)}
                    className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-10"
                    title="Close temporarily"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}

                <div className="pr-8 mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {banner.title}
                  </h3>
                  {banner.content && (
                    <p className="text-sm text-gray-700 mb-3">
                      {banner.content}
                    </p>
                  )}
                  {banner.link_url && banner.link_text && (
                    <a
                      href={banner.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                      {banner.link_text}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
                {banner.dismissible && (
                  <button
                    onClick={() => handleBannerPermanentDismiss(banner)}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Got it
                  </button>
                )}
              </div>
            </div>
          );
        } else {
          const survey = item.data;
          const isSubmitted = submittedSurveys.has(survey.id);

          if (isSubmitted) {
            // Show thank you message
            const emoji = survey.show_thank_you_emoji && survey.thank_you_emoji ? survey.thank_you_emoji : '';
            const message = survey.thank_you_message || 'Thank you for your response!';

            return (
              <div key={`survey-${survey.id}`} className="max-w-5xl mx-auto mb-6">
                <div className="bg-white border-2 border-teal-200 rounded-lg p-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                  {emoji && (
                    <div className="text-6xl mb-4">
                      {emoji}
                    </div>
                  )}
                  <p className="text-lg text-gray-900 mb-6">
                    {message}
                  </p>
                  <button
                    onClick={() => setDismissedItems(prev => new Set([...prev, survey.id]))}
                    className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          }

          const answers = surveyAnswers[survey.id] || new Array(survey.questions.length).fill('');
          const allAnswered = survey.questions.every((_, i) => answers[i]?.trim());

          return (
            <div key={`survey-${survey.id}`} className="max-w-5xl mx-auto mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 relative animate-in fade-in slide-in-from-top-4 duration-500">
                <button
                  onClick={() => handleTemporaryDismiss(survey.id)}
                  className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-10"
                  title="Close"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>

                <div className="pr-8 mb-6">
                  <div className="space-y-4">
                    {survey.questions.map((q, qIndex) => (
                      <div key={qIndex}>
                        <label className={`block text-gray-900 mb-2 ${qIndex === 0 ? 'font-medium' : 'text-sm font-medium'}`}>
                          {q.question}
                        </label>
                        {q.allowFreeText ? (
                          <input
                            type="text"
                            value={answers[qIndex] || ''}
                            onChange={(e) => {
                              const newAnswers = [...answers];
                              newAnswers[qIndex] = e.target.value;
                              setSurveyAnswers(prev => ({ ...prev, [survey.id]: newAnswers }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Type your answer..."
                          />
                        ) : (
                          <div className="space-y-2">
                            {q.options.map((option, oIndex) => (
                              <label key={oIndex} className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-2 rounded-lg hover:bg-gray-50 transition-colors ${
                                answers[qIndex] === option
                                  ? 'border-teal-600 bg-teal-50'
                                  : 'border-gray-300'
                              }`}>
                                <input
                                  type="radio"
                                  name={`survey-${survey.id}-q-${qIndex}`}
                                  value={option}
                                  checked={answers[qIndex] === option}
                                  onChange={(e) => {
                                    const newAnswers = [...answers];
                                    newAnswers[qIndex] = e.target.value;
                                    setSurveyAnswers(prev => ({ ...prev, [survey.id]: newAnswers }));
                                  }}
                                  className="w-4 h-4 text-teal-600 accent-teal-600 border-gray-300 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleTemporaryDismiss(survey.id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Maybe later
                  </button>
                  <button
                    onClick={() => handleSurveySubmit(survey)}
                    disabled={!allAnswered}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      allAnswered
                        ? 'text-white bg-teal-600 hover:bg-teal-700'
                        : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    }`}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          );
        }
      })}
    </>
  );
}
