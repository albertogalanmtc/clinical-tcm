import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { fetchAdminUserIdentities } from '@/app/services/adminUserLookupService';
import { fetchAllAdminUsers } from '@/app/services/adminUsersService';
import { getUserDisplayName } from '@/app/services/adminUsersService';
import type { Survey } from '@/app/services/surveysService';

interface SurveyAnalyticsModalProps {
  survey: Survey;
  isOpen: boolean;
  onClose: () => void;
}

interface SurveyResponseData {
  user_id: string;
  answers: string[];
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export function SurveyAnalyticsModal({ survey, isOpen, onClose }: SurveyAnalyticsModalProps) {
  const [responses, setResponses] = useState<SurveyResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadResponses();
    }
  }, [isOpen, survey.id]);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('user_id, answers, created_at')
        .eq('survey_id', survey.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading survey responses:', error);
        setResponses([]);
      } else {
        const rawResponses = data || [];
        let users = [];
        try {
          users = await fetchAdminUserIdentities(rawResponses.map(response => response.user_id));
        } catch (lookupError) {
          console.error('Error loading survey user details via function:', lookupError);
          users = await fetchAllAdminUsers();
        }

        const userMap = new Map(users.map(user => [user.id, user]));

        setResponses(rawResponses.map(response => {
          const user = userMap.get(response.user_id);
          const userName = user ? getUserDisplayName(user) : '';

          return {
            ...response,
            user_name: userName || response.user_id,
            user_email: user?.email || '',
          };
        }));
      }
    } catch (error) {
      console.error('Error loading survey responses:', error);
      setResponses([]);
    }
    setLoading(false);
  };

  // Calculate answer distribution for each question
  const getAnswerDistribution = (questionIndex: number) => {
    const answerCounts: Record<string, number> = {};
    
    responses.forEach(response => {
      const answer = response.answers[questionIndex];
      if (answer) {
        answerCounts[answer] = (answerCounts[answer] || 0) + 1;
      }
    });

    return Object.entries(answerCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([answer, count]) => ({
        answer,
        count,
        percentage: responses.length > 0 ? Math.round((count / responses.length) * 100) : 0
      }));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-4xl w-full sm:max-h-[90vh] overflow-hidden z-[110] flex flex-col">
          <Dialog.Description className="sr-only">
            Survey analytics and statistics
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Survey Analytics
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Survey Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">{survey.title}</h3>
              {survey.description && (
                <p className="text-sm text-gray-600">{survey.description}</p>
              )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <p className="text-sm text-teal-700 font-medium mb-1">Total Responses</p>
                <p className="text-2xl font-bold text-teal-900">{responses.length}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">Questions</p>
                <p className="text-2xl font-bold text-blue-900">{survey.questions.length}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-700 font-medium mb-1">Status</p>
                <p className="text-2xl font-bold text-purple-900 capitalize">{survey.status}</p>
              </div>
            </div>

            {/* Questions and Answers */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Question Analysis
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
              ) : responses.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                  <p className="text-gray-500">No responses yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {survey.questions.map((question, qIndex) => {
                    const distribution = getAnswerDistribution(qIndex);
                    const isExpanded = expandedQuestion === qIndex;

                    return (
                      <div key={qIndex} className="bg-white rounded-lg border border-gray-200">
                        <button
                          onClick={() => setExpandedQuestion(isExpanded ? null : qIndex)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 text-left flex-1">
                            <span className="px-2 py-1 bg-teal-600 text-white text-xs font-medium rounded">
                              Q{qIndex + 1}
                            </span>
                            <span className="font-medium text-gray-900">{question.question}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-2">
                            {distribution.length === 0 ? (
                              <p className="text-sm text-gray-500 py-2">No answers for this question</p>
                            ) : (
                              distribution.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm text-gray-700">{item.answer}</span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {item.count} ({item.percentage}%)
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-teal-600 h-2 rounded-full transition-all"
                                        style={{ width: `${item.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Individual Responses */}
            {responses.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Individual Responses ({responses.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {responses.map((response, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900">
                            <span className="font-semibold">{response.user_name || 'Unknown user'}</span>
                            {response.user_email ? (
                              <span className="text-gray-500"> · {response.user_email}</span>
                            ) : (
                            <span className="text-gray-500 font-mono"> · {response.user_id.substring(0, 8)}...</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(response.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        {response.answers.map((answer, aIndex) => (
                          <p key={aIndex} className="text-sm text-gray-600">
                            <span className="font-medium">Q{aIndex + 1}:</span> {answer}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 flex justify-end bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
