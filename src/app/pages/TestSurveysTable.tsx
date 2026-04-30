import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestSurveysTable() {
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [surveys, setSurveys] = useState<any[]>([]);

  useEffect(() => {
    checkTable();
  }, []);

  const checkTable = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to query the surveys table
      const { data, error: queryError } = await supabase
        .from('surveys')
        .select('*')
        .limit(5);

      if (queryError) {
        setTableExists(false);
        setError(queryError.message);
        console.error('Table check error:', queryError);
      } else {
        setTableExists(true);
        setSurveys(data || []);
        console.log('Surveys table exists! Found surveys:', data);
      }
    } catch (err: any) {
      setTableExists(false);
      setError(err.message);
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Surveys Table Test</h1>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table Status</h2>

          {loading ? (
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Checking if surveys table exists...</span>
            </div>
          ) : (
            <>
              {tableExists ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">✅ Surveys table exists!</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Found <strong>{surveys.length}</strong> survey(s) in the table
                    </p>
                    {surveys.length > 0 && (
                      <div className="bg-gray-50 rounded p-4 mt-3">
                        <pre className="text-xs text-gray-700 overflow-auto">
                          {JSON.stringify(surveys, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">❌ Surveys table does NOT exist</span>
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded p-4 mt-3">
                      <p className="text-sm text-red-800 font-medium mb-1">Error:</p>
                      <pre className="text-xs text-red-700">{error}</pre>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">
                      🔧 To fix this, run the migration SQL:
                    </p>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Go to <a href="https://supabase.com/dashboard/project/cezjuzscwjazgeklbpnw" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                      <li>Navigate to "SQL Editor"</li>
                      <li>Copy the content from <code className="bg-blue-100 px-1 rounded">supabase-migrations/create-surveys-table.sql</code></li>
                      <li>Paste and run it in the SQL Editor</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Migration SQL</h2>
          <p className="text-sm text-gray-600 mb-3">
            Copy this SQL and run it in the Supabase SQL Editor:
          </p>
          <div className="bg-gray-900 rounded p-4 overflow-auto">
            <pre className="text-xs text-green-400 font-mono">
{`-- Surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  display_mode TEXT NOT NULL DEFAULT 'widget' CHECK (display_mode IN ('widget', 'modal')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  show_results BOOLEAN DEFAULT FALSE,
  thank_you_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_display_mode ON surveys(display_mode);
CREATE INDEX IF NOT EXISTS idx_surveys_dates ON surveys(start_date, end_date);

-- Survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(survey_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created ON survey_responses(created_at);`}
            </pre>
          </div>
        </div>

        <button
          onClick={checkTable}
          className="mt-6 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Re-check Table
        </button>
      </div>
    </div>
  );
}
