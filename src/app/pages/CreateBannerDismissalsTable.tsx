import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function CreateBannerDismissalsTable() {
  const [status, setStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const createTable = async () => {
    setStatus('creating');
    setMessage('Creating banner_dismissals table...');

    try {
      // Check if table exists first
      const { data: existingTable, error: checkError } = await supabase
        .from('banner_dismissals')
        .select('id')
        .limit(1);

      if (!checkError) {
        setStatus('success');
        setMessage('Table banner_dismissals already exists!');
        return;
      }

      setStatus('error');
      setMessage(
        'Table does not exist. Please run the SQL migration manually in Supabase Dashboard.\n\n' +
        'Go to: SQL Editor in Supabase and run the script from:\n' +
        'supabase-migrations/create-banner-dismissals-table.sql'
      );
    } catch (error) {
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Banner Dismissals Table Setup
        </h1>
        <p className="text-gray-600 mb-6">
          This tool checks if the banner_dismissals table exists in your Supabase database.
        </p>

        <button
          onClick={createTable}
          disabled={status === 'creating'}
          className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {status === 'creating' && <Loader2 className="w-5 h-5 animate-spin" />}
          Check Table Status
        </button>

        {status !== 'idle' && (
          <div
            className={`p-4 rounded-lg flex items-start gap-3 ${
              status === 'success'
                ? 'bg-green-50 border border-green-200'
                : status === 'error'
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : status === 'error' ? (
              <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={`text-sm font-medium whitespace-pre-line ${
                  status === 'success'
                    ? 'text-green-900'
                    : status === 'error'
                    ? 'text-amber-900'
                    : 'text-blue-900'
                }`}
              >
                {message}
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-2">
              SQL Migration File Location:
            </p>
            <code className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 block">
              supabase-migrations/create-banner-dismissals-table.sql
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
