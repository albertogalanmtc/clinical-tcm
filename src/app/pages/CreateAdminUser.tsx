import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function CreateAdminUser() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const ADMIN_ID = '00000000-0000-0000-0000-000000000001';

  const createAdminUser = async () => {
    setLoading(true);
    setResult('');

    try {
      // Check if admin user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', ADMIN_ID)
        .single();

      if (existingUser) {
        setResult('✅ Admin user already exists in Supabase');
        toast.success('Admin user already exists');
        setLoading(false);
        return;
      }

      // Create admin user
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: ADMIN_ID,
          email: 'admin@tcm.com',
          first_name: 'Alberto',
          last_name: 'Galán',
          title: 'Dr.',
          role: 'admin',
          plan_type: 'practitioner',
          country: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('Error creating admin user:', error);
        setResult('❌ Error: ' + error.message);
        toast.error('Failed to create admin user');
      } else {
        console.log('Admin user created:', data);
        setResult('✅ Admin user created successfully!\n\n' + JSON.stringify(data, null, 2));
        toast.success('Admin user created successfully!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setResult('❌ Unexpected error: ' + (error as Error).message);
      toast.error('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Admin User in Supabase
          </h1>

          <p className="text-gray-600 mb-6">
            This will create a fixed admin user in the Supabase `users` table so that admin posts
            and comments can be saved to the database even without a Supabase auth session.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Admin User Details:</h3>
            <ul className="text-sm text-blue-800 space-y-1 font-mono">
              <li>• ID: {ADMIN_ID}</li>
              <li>• Email: admin@tcm.com</li>
              <li>• Name: Dr. Alberto Galán</li>
              <li>• Role: admin</li>
              <li>• Plan: practitioner</li>
            </ul>
          </div>

          <button
            onClick={createAdminUser}
            disabled={loading}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating Admin User...' : 'Create Admin User'}
          </button>

          {result && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Result:</h3>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-900 mb-3">How this works:</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                1. The admin user (admin@tcm.com) doesn't have a Supabase auth session by default
              </p>
              <p>
                2. We assign a fixed UUID ({ADMIN_ID}) to the admin
              </p>
              <p>
                3. This allows posts and comments from the admin to be saved to Supabase
              </p>
              <p>
                4. The views will be able to show admin's name, email, and country in reports
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
