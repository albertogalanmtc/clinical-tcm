import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Trash2, Edit2, ClipboardList, ChevronLeft, Loader2, BarChart3, ChevronUp, ChevronDown } from 'lucide-react';
import { surveysService, type Survey } from '@/app/services/surveysService';
import { SurveyModal } from '@/app/components/admin/SurveyModal';
import { SurveyAnalyticsModal } from '@/app/components/admin/SurveyAnalyticsModal';
import { toast } from 'sonner';

export default function AdminDashboardSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [selectedSurveyForAnalytics, setSelectedSurveyForAnalytics] = useState<Survey | null>(null);

  const loadSurveys = async () => {
    setLoading(true);
    const data = await surveysService.getAllSurveys();
    setSurveys(data);

    const counts: Record<string, number> = {};
    for (const survey of data) {
      const stats = await surveysService.getSurveyStats(survey.id);
      counts[survey.id] = stats?.totalResponses || 0;
    }
    setResponseCounts(counts);

    setLoading(false);
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const success = await surveysService.deleteSurvey(itemToDelete.id);
    if (success) {
      toast.success('Survey deleted successfully');
      loadSurveys();
    } else {
      toast.error('Failed to delete survey');
    }

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleStatusToggle = async (survey: Survey) => {
    const newStatus = survey.status === 'active' ? 'inactive' : 'active';
    const updated = await surveysService.updateSurvey(survey.id, { status: newStatus });

    if (updated) {
      toast.success(`Survey ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadSurveys();
    } else {
      toast.error('Failed to update survey');
    }
  };

  const moveSurvey = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === surveys.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newSurveys = [...surveys];
    const temp = newSurveys[index];
    newSurveys[index] = newSurveys[newIndex];
    newSurveys[newIndex] = temp;

    // Update display_order for both surveys
    await surveysService.updateSurveyOrder(newSurveys[index].id, index);
    await surveysService.updateSurveyOrder(newSurveys[newIndex].id, newIndex);

    setSurveys(newSurveys);
    toast.success('Order updated');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <>
      {/* Back Button + Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link
            to="/admin/dashboard-content"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="sr-only">Back to Dashboard Content</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Surveys</h1>
        </div>
        <p className="text-gray-600">Create and manage user surveys to gather feedback</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex items-center justify-end">
        <button
          onClick={() => {
            setEditingSurvey(null);
            setIsSurveyModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Survey
        </button>
      </div>

      {/* Surveys Grid */}
      {surveys.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Surveys Yet</h3>
          <p className="text-gray-600 mb-4">Create your first survey to gather user feedback</p>
          <button
            onClick={() => {
              setEditingSurvey(null);
              setIsSurveyModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Survey
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey, index) => (
            <div
              key={survey.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveSurvey(index, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded transition-colors ${
                        index === 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSurvey(index, 'down')}
                      disabled={index === surveys.length - 1}
                      className={`p-1 rounded transition-colors ${
                        index === surveys.length - 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                    {survey.title}
                  </h3>
                  <button
                    onClick={() => handleStatusToggle(survey)}
                    className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 transition-colors ${
                      survey.status === 'active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {survey.status}
                  </button>
                </div>
                {survey.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {survey.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                    {survey.questions.length} {survey.questions.length === 1 ? 'question' : 'questions'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedSurveyForAnalytics(survey);
                    setAnalyticsModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-teal-50 text-teal-700 text-xs rounded hover:bg-teal-100 transition-colors font-medium mb-3"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  View Analytics ({responseCounts[survey.id] || 0})
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingSurvey(survey);
                    setIsSurveyModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setItemToDelete({ id: survey.id, title: survey.title });
                    setDeleteConfirmOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <SurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => {
          setIsSurveyModalOpen(false);
          setEditingSurvey(null);
        }}
        survey={editingSurvey}
        onSave={loadSurveys}
      />

      {selectedSurveyForAnalytics && (
        <SurveyAnalyticsModal
          survey={selectedSurveyForAnalytics}
          isOpen={analyticsModalOpen}
          onClose={() => {
            setAnalyticsModalOpen(false);
            setSelectedSurveyForAnalytics(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-[100]">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Deletion
            </Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-6">
              Are you sure you want to delete "{itemToDelete?.title}"? This will also delete all responses. This action cannot be undone.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
