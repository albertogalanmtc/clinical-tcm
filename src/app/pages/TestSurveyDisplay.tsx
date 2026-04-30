import { useState, useEffect } from 'react';
import { surveysService } from '../services/surveysService';
import { useUser } from '../contexts/UserContext';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestSurveyDisplay() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [activeSurveys, setActiveSurveys] = useState<any[]>([]);
  const [allSurveys, setAllSurveys] = useState<any[]>([]);
  const [responseChecks, setResponseChecks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all surveys
      console.log('TestSurveyDisplay: Fetching all surveys...');
      const all = await surveysService.getAllSurveys();
      console.log('TestSurveyDisplay: All surveys:', all);
      setAllSurveys(all);

      // Get active surveys
      console.log('TestSurveyDisplay: Fetching active surveys...');
      const active = await surveysService.getActiveSurveys();
      console.log('TestSurveyDisplay: Active surveys:', active);
      setActiveSurveys(active);

      // Check responses for each active survey
      if (user) {
        const checks: Record<string, boolean> = {};
        for (const survey of active) {
          const hasResponded = await surveysService.hasUserResponded(survey.id, user.id);
          checks[survey.id] = hasResponded;
          console.log(`User has responded to "${survey.title}":`, hasResponded);
        }
        setResponseChecks(checks);
      }
    } catch (err: any) {
      console.error('TestSurveyDisplay: Error loading data:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="text-gray-700">Loading survey data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Display Test</h1>
        <p className="text-gray-600 mb-8">
          Diagnostic page to check if surveys are loading correctly.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
          {user ? (
            <div className="space-y-2">
              <p className="text-sm">
                <strong>User ID:</strong> {user.id}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {user.email}
              </p>
              <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">User is logged in</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 rounded border border-amber-200">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">No user logged in - surveys won't show</span>
              </div>
            </div>
          )}
        </div>

        {/* All Surveys */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Surveys in Database</h2>
          <p className="text-sm text-gray-600 mb-4">
            Total: <strong>{allSurveys.length}</strong> survey(s)
          </p>
          {allSurveys.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center text-gray-600">
              No surveys found in database. Create one from Admin → Dashboard Content → Surveys
            </div>
          ) : (
            <div className="space-y-3">
              {allSurveys.map((survey) => (
                <div key={survey.id} className="p-4 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{survey.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      survey.status === 'active' ? 'bg-green-100 text-green-700' :
                      survey.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {survey.status}
                    </span>
                  </div>
                  {survey.description && (
                    <p className="text-sm text-gray-600 mb-2">{survey.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Display: {survey.display_mode}</span>
                    <span>Questions: {survey.questions.length}</span>
                    <span>Show results: {survey.show_results ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Surveys */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Surveys</h2>
          <p className="text-sm text-gray-600 mb-4">
            These surveys have status = 'active' and are within date range.
          </p>
          <p className="text-sm mb-4">
            Total: <strong>{activeSurveys.length}</strong> active survey(s)
          </p>
          {activeSurveys.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded border border-amber-200 text-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  No active surveys found. Make sure at least one survey has status = 'active'
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSurveys.map((survey) => (
                <div key={survey.id} className="p-4 bg-green-50 rounded border border-green-200">
                  <h3 className="font-medium text-gray-900 mb-2">{survey.title}</h3>
                  {user && (
                    <div className="mt-3">
                      {responseChecks[survey.id] ? (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>User has already responded (won't show in dashboard)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-700 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">User has NOT responded (SHOULD show in dashboard)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expected Behavior */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Expected Behavior</h2>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>Surveys with status = 'active' should appear in the "Active Surveys" section above</li>
            <li>If user is logged in and hasn't responded, survey should show in dashboard</li>
            <li>Check browser console for "SurveyWidget:" logs to see what's happening</li>
            <li>Survey appears as a teal box in the dashboard after the banner</li>
          </ul>
        </div>

        <button
          onClick={loadData}
          className="mt-6 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Reload Data
        </button>
      </div>
    </div>
  );
}
