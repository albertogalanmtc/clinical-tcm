import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, Send } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { surveysService, type Survey, type SurveyQuestion } from '@/app/services/surveysService';
import { useUser } from '@/app/contexts/UserContext';
import { toast } from 'sonner';

export function SurveyWidget() {
  console.log('SurveyWidget: Component mounted/rendered');

  const { user } = useUser();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<string[]>([]);
  const [freeTextAnswers, setFreeTextAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    console.log('SurveyWidget: useEffect triggered, user changed:', user?.email);
    loadSurvey();
  }, [user]);

  useEffect(() => {
    if (survey && survey.display_mode === 'modal' && !submitted && !dismissed) {
      setTimeout(() => setModalOpen(true), 1000);
    }
  }, [survey, submitted, dismissed]);

  const loadSurvey = async () => {
    console.log('SurveyWidget: loadSurvey called');
    console.log('SurveyWidget: user:', user);

    if (!user) {
      console.log('SurveyWidget: No user, skipping');
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('SurveyWidget: Fetching active surveys...');
    const surveys = await surveysService.getActiveSurveys();
    console.log('SurveyWidget: Active surveys:', surveys);
    console.log('SurveyWidget: Number of active surveys:', surveys.length);

    let surveyToShow = null;

    for (const s of surveys) {
      console.log(`SurveyWidget: Checking survey "${s.title}" (${s.id})`);
      const hasResponded = await surveysService.hasUserResponded(s.id, user.id);
      console.log(`SurveyWidget: User has responded to "${s.title}":`, hasResponded);

      if (!hasResponded) {
        console.log(`SurveyWidget: ✅ WILL SHOW survey "${s.title}"`);
        surveyToShow = s;
        setSurvey(s);
        setAnswers(new Array(s.questions.length).fill(''));
        break;
      } else {
        console.log(`SurveyWidget: ❌ User already responded to "${s.title}", skipping`);
      }
    }

    if (surveyToShow) {
      console.log('SurveyWidget: ✅ Final survey to display:', surveyToShow.title);
    } else {
      console.log('SurveyWidget: ❌ No survey to display (either no active surveys or user responded to all)');
    }

    setLoading(false);
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleFreeTextChange = (questionIndex: number, text: string) => {
    setFreeTextAnswers({ ...freeTextAnswers, [questionIndex]: text });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!survey || !user) return;

    if (answers.some((a, i) => !a && !freeTextAnswers[i])) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitting(true);

    const finalAnswers = answers.map((answer, i) => {
      if (freeTextAnswers[i]) {
        return answer ? `${answer}: ${freeTextAnswers[i]}` : freeTextAnswers[i];
      }
      return answer;
    });

    const success = await surveysService.submitResponse(survey.id, user.id, finalAnswers);

    if (success) {
      toast.success('Thank you for your response!');
      setSubmitted(true);

      if (survey.show_results) {
        const surveyStats = await surveysService.getSurveyStats(survey.id);
        setStats(surveyStats);
      } else {
        // Hide widget after 2 seconds if not showing results
        setTimeout(() => {
          setDismissed(true);
          setModalOpen(false);
        }, 2000);
      }
    } else {
      toast.error('Failed to submit response');
    }

    setSubmitting(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setModalOpen(false);
  };

  if (loading) {
    console.log('SurveyWidget: Still loading, returning null');
    return null;
  }

  if (!survey) {
    console.log('SurveyWidget: No survey to show, returning null');
    return null;
  }

  if (!user) {
    console.log('SurveyWidget: No user, returning null');
    return null;
  }

  if (dismissed) {
    console.log('SurveyWidget: Survey was dismissed, returning null');
    return null;
  }

  console.log('SurveyWidget: RENDERING survey:', survey.title, 'display_mode:', survey.display_mode);

  const renderQuestions = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {survey.questions.map((question, qIndex) => (
        <div key={qIndex}>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            {qIndex + 1}. {question.question}
          </label>
          <div className="space-y-2">
            {question.options.map((option, oIndex) => (
              <label
                key={oIndex}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  value={option}
                  checked={answers[qIndex] === option}
                  onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  required={!question.allowFreeText}
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
            {question.allowFreeText && (
              <div className="mt-3">
                <textarea
                  value={freeTextAnswers[qIndex] || ''}
                  onChange={(e) => handleFreeTextChange(qIndex, e.target.value)}
                  placeholder="Or provide your own answer..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                />
              </div>
            )}
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Survey
          </>
        )}
      </button>
    </form>
  );

  const renderResults = () => {
    if (!stats) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-green-600 mb-4">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Thank you for your response!</span>
        </div>

        {survey.thank_you_message && (
          <p className="text-sm text-gray-700 mb-4">{survey.thank_you_message}</p>
        )}

        <div className="space-y-6">
          <h4 className="font-medium text-gray-900">Survey Results ({stats.totalResponses} responses)</h4>
          {stats.questionStats.map((qStat: any, qIndex: number) => (
            <div key={qIndex} className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{qStat.question}</p>
              <div className="space-y-2">
                {Object.entries(qStat.answers).map(([answer, count]: [string, any]) => {
                  const percentage = ((count / stats.totalResponses) * 100).toFixed(1);
                  return (
                    <div key={answer} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-700">{answer}</span>
                        <span className="text-gray-500 font-medium">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setDismissed(true);
            setModalOpen(false);
          }}
          className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    );
  };

  const renderThankYou = () => (
    <div className="text-center py-8">
      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
      <h3 className="font-medium text-gray-900 mb-2">Thank you!</h3>
      {survey.thank_you_message && (
        <p className="text-sm text-gray-700">{survey.thank_you_message}</p>
      )}
    </div>
  );

  const content = (
    <div>
      {!submitted ? (
        <>
          <h3 className="font-medium text-gray-900 mb-2">
            {survey.title}
          </h3>
          {survey.description && (
            <p className="text-sm text-gray-600 mb-4">
              {survey.description}
            </p>
          )}
          {renderQuestions()}
        </>
      ) : (
        survey.show_results ? renderResults() : renderThankYou()
      )}
    </div>
  );

  if (survey.display_mode === 'modal') {
    return (
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[60]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 z-[70]">
            <Dialog.Description className="sr-only">
              Survey: {survey.title}
            </Dialog.Description>
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            {content}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mb-6">
      <div className="border-2 border-teal-200 bg-teal-50 rounded-lg p-5 relative animate-in fade-in slide-in-from-top-4 duration-500">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 hover:bg-teal-100 rounded-full transition-colors z-10"
          title="Dismiss"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
        {content}
      </div>
    </div>
  );
}
