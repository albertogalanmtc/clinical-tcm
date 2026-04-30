import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { surveysService } from '../services/surveysService';
import { Loader2, Play, Database, List, Plus } from 'lucide-react';

export default function DebugSurveys() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const addResult = (test: string, status: 'success' | 'error', data: any) => {
    setResults(prev => [...prev, { test, status, data, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    try {
      // Test 1: Check if table exists
      addResult('Checking if surveys table exists', 'success', 'Starting...');
      const { data: tableData, error: tableError } = await supabase
        .from('surveys')
        .select('*')
        .limit(1);

      if (tableError) {
        addResult('Table check', 'error', tableError);
      } else {
        addResult('Table check', 'success', 'Table exists!');
      }

      // Test 2: Get all surveys using service
      addResult('Getting all surveys via service', 'success', 'Starting...');
      const surveys = await surveysService.getAllSurveys();
      addResult('Get all surveys', 'success', { count: surveys.length, surveys });

      // Test 3: Get active surveys
      addResult('Getting active surveys', 'success', 'Starting...');
      const activeSurveys = await surveysService.getActiveSurveys();
      addResult('Get active surveys', 'success', { count: activeSurveys.length, activeSurveys });

      // Test 4: Direct query to see all records
      addResult('Direct query to surveys table', 'success', 'Starting...');
      const { data: allData, error: allError } = await supabase
        .from('surveys')
        .select('*');

      if (allError) {
        addResult('Direct query', 'error', allError);
      } else {
        addResult('Direct query', 'success', { count: allData?.length || 0, data: allData });
      }

      // Test 5: Try to create a test survey
      addResult('Creating test survey', 'success', 'Starting...');
      const testSurvey = {
        title: 'Test Survey ' + Date.now(),
        description: 'This is a test survey',
        questions: [
          {
            question: 'How are you?',
            options: ['Good', 'Bad', 'Okay'],
            allowFreeText: false
          }
        ],
        display_mode: 'widget' as const,
        status: 'draft' as const,
        show_results: false
      };

      const createdSurvey = await surveysService.createSurvey(testSurvey);
      if (createdSurvey) {
        addResult('Create survey', 'success', createdSurvey);
      } else {
        addResult('Create survey', 'error', 'Failed to create survey - returned null');
      }

      // Test 6: Query again after creation
      addResult('Re-querying after creation', 'success', 'Starting...');
      const { data: afterCreate, error: afterError } = await supabase
        .from('surveys')
        .select('*');

      if (afterError) {
        addResult('After creation query', 'error', afterError);
      } else {
        addResult('After creation query', 'success', { count: afterCreate?.length || 0, data: afterCreate });
      }

    } catch (error: any) {
      addResult('Unexpected error', 'error', error.message || error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug Surveys System</h1>
        <p className="text-gray-600 mb-8">
          This page runs comprehensive tests on the surveys system.
        </p>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <button
            onClick={runTests}
            disabled={testing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run All Tests
              </>
            )}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg border-2 p-4 ${
                  result.status === 'success' ? 'border-green-200' : 'border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-semibold ${
                    result.status === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.status === 'success' ? '✓' : '✗'} {result.test}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className={`text-sm p-3 rounded ${
                  result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Links</h3>
          <div className="space-y-2 text-sm">
            <a href="/admin/dashboard-content/surveys" className="block text-blue-700 hover:underline">
              → Admin Surveys Page
            </a>
            <a href="/test-surveys" className="block text-blue-700 hover:underline">
              → Test Surveys Table
            </a>
            <a href="https://supabase.com/dashboard/project/cezjuzscwjazgeklbpnw" target="_blank" rel="noopener noreferrer" className="block text-blue-700 hover:underline">
              → Supabase Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
