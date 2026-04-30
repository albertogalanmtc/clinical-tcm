import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TestSupabaseConnection() {
  const [result, setResult] = useState<string>('Testing...');
  const [loading, setLoading] = useState(true);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing Supabase connection...');

    try {
      // Test 1: Basic connection
      const { data: session, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setResult(`❌ Auth Error: ${sessionError.message}`);
        setLoading(false);
        return;
      }

      // Test 2: Database query
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (usersError) {
        setResult(`❌ Database Error: ${usersError.message}\n\nThis might be normal if the table doesn't exist yet.`);
        setLoading(false);
        return;
      }

      // Test 3: Connection info
      const connectionInfo = {
        url: 'https://cezjuzscwjazgeklbpnw.supabase.co',
        hasSession: !!session.session,
        userEmail: session.session?.user?.email || 'Not logged in',
        databaseAccess: 'OK',
      };

      setResult(`✅ Supabase Connected!\n\n${JSON.stringify(connectionInfo, null, 2)}`);
      setLoading(false);
    } catch (error: any) {
      setResult(`❌ Connection Failed: ${error.message}`);
      setLoading(false);
    }
  };

  // Run test on mount
  useState(() => {
    testConnection();
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Supabase Connection Test</h1>

          <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg whitespace-pre-wrap mb-4">
            {result}
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
              <span>Testing connection...</span>
            </div>
          )}

          <button
            onClick={testConnection}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Test Again
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-2">Connection Details:</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Supabase URL:</strong> https://cezjuzscwjazgeklbpnw.supabase.co</p>
              <p><strong>Project ID:</strong> cezjuzscwjazgeklbpnw</p>
              <p><strong>Status:</strong> {loading ? 'Testing...' : 'Test Complete'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
