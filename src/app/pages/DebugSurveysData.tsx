import { useState, useEffect } from 'react';
import { surveysService } from '@/app/services/surveysService';
import { supabase } from '@/app/lib/supabase';

export default function DebugSurveysData() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Get all surveys directly from Supabase
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Raw surveys from DB:', data);
    console.log('Error:', error);

    if (data) {
      setSurveys(data);
    }

    setLoading(false);
  };

  const fixSurvey = async (survey: any) => {
    if (!survey.questions || survey.questions.length === 0) {
      alert('No questions to use as title');
      return;
    }

    const title = survey.questions[0].question;

    const { error } = await supabase
      .from('surveys')
      .update({
        title,
        description: null
      })
      .eq('id', survey.id);

    if (error) {
      console.error('Error fixing survey:', error);
      alert('Error: ' + error.message);
    } else {
      alert('Survey fixed!');
      loadData();
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Surveys Data</h1>

      <div className="space-y-4">
        {surveys.map(survey => (
          <div key={survey.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <strong>ID:</strong> {survey.id}
              </div>
              <div>
                <strong>Status:</strong> {survey.status}
              </div>
              <div>
                <strong>Title:</strong> {survey.title || '(null)'}
              </div>
              <div>
                <strong>Description:</strong> {survey.description || '(null)'}
              </div>
              <div>
                <strong>Display Mode:</strong> {survey.display_mode}
              </div>
              <div>
                <strong>Start Date:</strong> {survey.start_date || '(null)'}
              </div>
              <div>
                <strong>End Date:</strong> {survey.end_date || '(null)'}
              </div>
              <div>
                <strong>Created:</strong> {new Date(survey.created_at).toLocaleString()}
              </div>
            </div>

            <div className="mb-4">
              <strong>Questions:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto text-xs">
                {JSON.stringify(survey.questions, null, 2)}
              </pre>
            </div>

            <button
              onClick={() => fixSurvey(survey)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Fix Survey (Use first question as title)
            </button>
          </div>
        ))}

        {surveys.length === 0 && (
          <div className="text-gray-500">No surveys found</div>
        )}
      </div>
    </div>
  );
}
