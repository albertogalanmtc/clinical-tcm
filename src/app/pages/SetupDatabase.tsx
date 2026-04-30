import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { CheckCircle, XCircle, Loader2, Copy, ExternalLink } from 'lucide-react';

const BANNER_DISMISSALS_SQL = `
-- Create banner_dismissals table
CREATE TABLE IF NOT EXISTS banner_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL,
  user_id UUID NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(banner_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_banner_dismissals_banner ON banner_dismissals(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_dismissals_user ON banner_dismissals(user_id);
`;

const SURVEY_RESPONSES_SQL = `
-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL,
  user_id UUID NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(survey_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user ON survey_responses(user_id);
`;

const FULL_SQL = BANNER_DISMISSALS_SQL + '\n' + SURVEY_RESPONSES_SQL;

export default function SetupDatabase() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<{
    bannerDismissals: 'unknown' | 'exists' | 'missing';
    surveyResponses: 'unknown' | 'exists' | 'missing';
  }>({
    bannerDismissals: 'unknown',
    surveyResponses: 'unknown',
  });
  const [copied, setCopied] = useState(false);

  const checkTables = async () => {
    setChecking(true);

    try {
      // Check banner_dismissals
      const { error: bannerError } = await supabase
        .from('banner_dismissals')
        .select('id')
        .limit(1);

      // Check survey_responses
      const { error: surveyError } = await supabase
        .from('survey_responses')
        .select('id')
        .limit(1);

      setStatus({
        bannerDismissals: bannerError ? 'missing' : 'exists',
        surveyResponses: surveyError ? 'missing' : 'exists',
      });
    } catch (error) {
      console.error('Error checking tables:', error);
    } finally {
      setChecking(false);
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(FULL_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openSupabase = () => {
    window.open('https://supabase.com/dashboard/project/cezjuzscwjazgeklbpnw/editor', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Setup</h1>
        <p className="text-gray-600 mb-8">
          Configure the required tables for banners and surveys functionality
        </p>

        {/* Check Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table Status</h2>

          <button
            onClick={checkTables}
            disabled={checking}
            className="mb-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Check Tables
          </button>

          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {status.bannerDismissals === 'exists' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {status.bannerDismissals === 'missing' && <XCircle className="w-5 h-5 text-red-600" />}
              {status.bannerDismissals === 'unknown' && <div className="w-5 h-5 rounded-full bg-gray-300" />}
              <span className="font-medium text-gray-900">banner_dismissals</span>
              <span className={`ml-auto text-sm ${
                status.bannerDismissals === 'exists' ? 'text-green-600' :
                status.bannerDismissals === 'missing' ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {status.bannerDismissals === 'exists' ? 'Ready' :
                 status.bannerDismissals === 'missing' ? 'Missing' :
                 'Unknown'}
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {status.surveyResponses === 'exists' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {status.surveyResponses === 'missing' && <XCircle className="w-5 h-5 text-red-600" />}
              {status.surveyResponses === 'unknown' && <div className="w-5 h-5 rounded-full bg-gray-300" />}
              <span className="font-medium text-gray-900">survey_responses</span>
              <span className={`ml-auto text-sm ${
                status.surveyResponses === 'exists' ? 'text-green-600' :
                status.surveyResponses === 'missing' ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {status.surveyResponses === 'exists' ? 'Ready' :
                 status.surveyResponses === 'missing' ? 'Missing' :
                 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        {(status.bannerDismissals === 'missing' || status.surveyResponses === 'missing') && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">
              ⚠️ Missing Tables Detected
            </h3>
            <p className="text-amber-800 mb-4">
              To enable banners and surveys functionality, you need to create the missing tables in your Supabase database.
            </p>

            <div className="space-y-3">
              <h4 className="font-semibold text-amber-900">Quick Setup (3 steps):</h4>
              <ol className="list-decimal list-inside space-y-2 text-amber-800">
                <li>Click "Copy SQL" below to copy the creation script</li>
                <li>Click "Open Supabase SQL Editor"</li>
                <li>Paste and run the SQL in the editor</li>
              </ol>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={copySQL}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy SQL'}
                </button>
                <button
                  onClick={openSupabase}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Supabase SQL Editor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {status.bannerDismissals === 'exists' && status.surveyResponses === 'exists' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                ✅ All Tables Ready!
              </h3>
            </div>
            <p className="text-green-800">
              Your database is properly configured. Banners and surveys will now save user interactions.
            </p>
          </div>
        )}

        {/* SQL Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">SQL Script</h2>
            <button
              onClick={copySQL}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
            {FULL_SQL}
          </pre>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Need help?</strong> These tables are required for:
          </p>
          <ul className="mt-2 text-sm text-blue-800 list-disc list-inside space-y-1">
            <li><strong>banner_dismissals:</strong> Tracks when users click "Got it" on banners</li>
            <li><strong>survey_responses:</strong> Stores user survey answers for analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
