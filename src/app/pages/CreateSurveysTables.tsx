import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle, XCircle, Play } from 'lucide-react';

export default function CreateSurveysTables() {
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const createTables = async () => {
    setCreating(true);
    setSuccess(false);
    setError(null);
    setLogs([]);

    try {
      addLog('Starting migration...');

      // Create surveys table
      addLog('Creating surveys table...');
      const { error: surveysError } = await supabase.rpc('exec_sql', {
        query: `
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
        `
      });

      if (surveysError) {
        throw new Error(`Surveys table error: ${surveysError.message}`);
      }
      addLog('✓ Surveys table created');

      // Create indexes for surveys
      addLog('Creating surveys indexes...');
      await supabase.rpc('exec_sql', {
        query: `
          CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
          CREATE INDEX IF NOT EXISTS idx_surveys_display_mode ON surveys(display_mode);
          CREATE INDEX IF NOT EXISTS idx_surveys_dates ON surveys(start_date, end_date);
        `
      });
      addLog('✓ Surveys indexes created');

      // Create survey_responses table
      addLog('Creating survey_responses table...');
      const { error: responsesError } = await supabase.rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS survey_responses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            answers JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(survey_id, user_id)
          );
        `
      });

      if (responsesError) {
        throw new Error(`Survey responses table error: ${responsesError.message}`);
      }
      addLog('✓ Survey_responses table created');

      // Create indexes for survey_responses
      addLog('Creating survey_responses indexes...');
      await supabase.rpc('exec_sql', {
        query: `
          CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);
          CREATE INDEX IF NOT EXISTS idx_survey_responses_user ON survey_responses(user_id);
          CREATE INDEX IF NOT EXISTS idx_survey_responses_created ON survey_responses(created_at);
        `
      });
      addLog('✓ Survey_responses indexes created');

      addLog('✅ Migration completed successfully!');
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error';
      addLog(`❌ Error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Surveys Tables</h1>
        <p className="text-gray-600 mb-8">
          This will create the surveys and survey_responses tables in your Supabase database.
        </p>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Migration Status</h2>

          {!creating && !success && !error && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                Click the button below to create the surveys tables in your Supabase database.
              </p>
              <button
                onClick={createTables}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                <Play className="w-5 h-5" />
                Create Tables
              </button>
            </div>
          )}

          {creating && (
            <div className="flex items-center gap-3 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Creating tables...</span>
            </div>
          )}

          {success && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">✅ Tables created successfully!</span>
              </div>
              <p className="text-sm text-gray-600">
                You can now create surveys from the admin panel at{' '}
                <a href="/admin/dashboard-content/surveys" className="text-teal-600 hover:underline">
                  /admin/dashboard-content/surveys
                </a>
              </p>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">❌ Migration failed</span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-sm text-red-800 font-medium mb-1">Error:</p>
                <pre className="text-xs text-red-700 whitespace-pre-wrap">{error}</pre>
              </div>
              <button
                onClick={createTables}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Migration Log</h3>
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-xs text-green-400 font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> If this automated method doesn't work, you can manually run the SQL in the{' '}
            <a
              href="https://supabase.com/dashboard/project/cezjuzscwjazgeklbpnw"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Supabase SQL Editor
            </a>
            . The SQL is in <code className="bg-blue-100 px-1 rounded">supabase-migrations/create-surveys-table.sql</code>
          </p>
        </div>
      </div>
    </div>
  );
}
